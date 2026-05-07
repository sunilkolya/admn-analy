import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import os

def train_model():
    print("Generating synthetic dataset...")
    # Features: [Class_Level, SC_Count, ST_Count, OBC_Count, GEN_Count, EWS_Count, Sports_Count, Others_Count]
    # Class_Level: 1 to 12
    # Categories: Counts of students in each category
    
    data_size = 1000
    np.random.seed(42)
    
    classes = np.random.randint(1, 13, size=data_size)
    sc_counts = np.random.randint(0, 50, size=data_size)
    st_counts = np.random.randint(0, 30, size=data_size)
    obc_counts = np.random.randint(0, 100, size=data_size)
    gen_counts = np.random.randint(0, 100, size=data_size)
    
    # Admission categories (subset of social or separate distributions)
    ews_counts = np.random.randint(0, 20, size=data_size)
    sports_counts = np.random.randint(0, 10, size=data_size)
    others_counts = np.random.randint(0, 50, size=data_size)
    
    # Target: Total Students (for calculation demo)
    # In a real scenario, this might be some other metric, but here we calculate total
    totals = sc_counts + st_counts + obc_counts + gen_counts
    
    df = pd.DataFrame({
        'class_level': classes,
        'sc': sc_counts,
        'st': st_counts,
        'obc': obc_counts,
        'gen': gen_counts,
        'ews': ews_counts,
        'sports': sports_counts,
        'others': others_counts,
        'total': totals
    })
    
    X = df.drop('total', axis=1)
    y = df['total']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training scikit-learn LinearRegression model...")
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Calculate accuracy (R^2 score for regression)
    accuracy = model.score(X_test, y_test)
    print(f"Model Training Complete. Accuracy (R^2): {accuracy:.4f}")
    
    # Save the model
    joblib.dump(model, 'model.pkl')
    print("Model saved as model.pkl")
    
    return accuracy

if __name__ == "__main__":
    train_model()
