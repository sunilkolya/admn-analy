from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import joblib
import os
import numpy as np
import pandas as pd
from model_train import train_model

# Initialize FastAPI app
app = FastAPI(title="Classwise Category Total Calculator API")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the input data model
class PredictionInput(BaseModel):
    class_level: int
    sc: int
    st: int
    obc: int
    gen: int
    ews: int
    sports: int
    others: int

# Global variable for the model
model = None

@app.on_event("startup")
def load_startup_model():
    global model
    model_path = 'model.pkl'
    
    # If model doesn't exist, train it automatically
    if not os.path.exists(model_path):
        print("Model file not found. Starting automatic training...")
        train_model()
    
    try:
        model = joblib.load(model_path)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.post("/predict")
async def predict(data: PredictionInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please try again later.")
    
    try:
        # Convert input data to a format the model expects (DataFrame)
        input_dict = {
            'class_level': [data.class_level],
            'sc': [data.sc],
            'st': [data.st],
            'obc': [data.obc],
            'gen': [data.gen],
            'ews': [data.ews],
            'sports': [data.sports],
            'others': [data.others]
        }
        X_input = pd.DataFrame(input_dict)
        
        # Make prediction
        prediction = model.predict(X_input)[0]
        
        # Since it's linear regression, results can be floats. We round for "total students".
        rounded_prediction = max(0, int(round(prediction)))
        
        # Mock confidence (in a real scenario, this could be prediction intervals)
        # Using a fixed high value for this demo
        confidence = 0.98 
        
        return {
            "prediction": str(rounded_prediction),
            "confidence": float(confidence)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Serve static files from React build directory (if it exists)
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

@app.get("/")
def read_root():
    if os.path.exists("dist/index.html"):
        return FileResponse("dist/index.html")
    return {"message": "Welcome to the Classwise Social/Admission Category Calculator API"}

if __name__ == "__main__":
    import uvicorn
    # In practice, the port would be taken from environment variable
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)
