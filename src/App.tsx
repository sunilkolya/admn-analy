/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Calculator, FileJson, AlertCircle, CheckCircle2, ChevronRight, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PredictionRecord {
  class_level: number;
  sc: number;
  st: number;
  obc: number;
  gen: number;
  ews: number;
  sports: number;
  others: number;
}

interface PredictionResult {
  prediction: string;
  confidence: number;
}

export default function App() {
  const [fileData, setFileData] = useState<PredictionRecord | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (typeof json.class_level !== 'number') throw new Error('Invalid JSON format: missing class_level');
        setFileData(json);
        setError(null);
        setResult(null);
      } catch (err) {
        setError('Error parsing JSON file. Please ensure it follows the correct format.');
        setFileData(null);
      }
    };
    reader.readAsText(file);
  };

  const handlePredict = async () => {
    if (!fileData) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileData),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction from server');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Could not reach the prediction server. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-serif flex flex-col overflow-x-hidden selection:bg-slate-200">
      {/* Header Section */}
      <header className="p-10 border-b border-[#1A1A1A] flex flex-col md:flex-row justify-between items-baseline gap-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-none">
            ADMISSION<br />ANALYTICS
          </h1>
          <p className="mt-4 text-xs font-sans uppercase tracking-[0.2em] opacity-60">
            Social Category Wise • Machine Learning Model v2.4
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-light italic">2024-25</div>
          <p className="text-xs font-sans uppercase tracking-widest opacity-60">Academic Session</p>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Pane: Input/Upload */}
        <section className="w-full lg:w-[40%] border-r border-[#1A1A1A] p-10 flex flex-col justify-between gap-12">
          <div>
            <span className="text-xs font-sans font-bold uppercase block mb-8 underline underline-offset-4 tracking-wider">01 / Data Ingestion</span>
            
            <div 
              onClick={triggerFileInput}
              className={`
                border-2 border-dashed border-[#1A1A1A] aspect-square flex flex-col items-center justify-center p-12 text-center group cursor-pointer transition-all duration-300
                ${fileData ? 'bg-[#F4F2EE]' : 'bg-white hover:bg-[#FDFCFB]'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
              <div className="w-12 h-12 mb-6 border border-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform">
                {fileData ? <FileJson className="w-6 h-6" /> : <span className="text-2xl font-sans">+</span>}
              </div>
              <p className="text-2xl italic mb-2">
                {fileData ? 'Manifest Loaded' : 'Drop Enrollment Manifest'}
              </p>
              <p className="text-[10px] font-sans uppercase tracking-tighter opacity-50">
                Accepted: JSON (Max 50MB)
              </p>
            </div>

            {fileData && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="mt-8 pt-8 border-t border-slate-200"
              >
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans uppercase tracking-widest opacity-50">Class</span>
                    <span className="text-lg">{fileData.class_level}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans uppercase tracking-widest opacity-50">General</span>
                    <span className="text-lg">{fileData.gen}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans uppercase tracking-widest opacity-50">SC/ST Total</span>
                    <span className="text-lg">{fileData.sc + fileData.st}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans uppercase tracking-widest opacity-50">OBC</span>
                    <span className="text-lg">{fileData.obc}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <div className="mt-8 p-4 bg-red-50 text-red-900 font-sans text-xs uppercase tracking-tight border border-red-100 flex items-center gap-3">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <button 
            onClick={handlePredict}
            disabled={!fileData || loading}
            className="w-full bg-[#1A1A1A] text-white py-6 px-4 font-sans uppercase tracking-[0.3em] text-xs hover:bg-[#333333] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-4"
          >
            {loading ? (
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Run Calculation Model'
            )}
          </button>
        </section>

        {/* Right Pane: Predictions/Results */}
        <section className="flex-1 p-10 flex flex-col group min-h-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-16 gap-8">
            <span className="text-xs font-sans font-bold uppercase underline underline-offset-4 tracking-wider">02 / Calculated Totals</span>
            
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex space-x-12"
                >
                  <div className="text-center">
                    <div className="text-3xl font-light italic">{(result.confidence).toFixed(3)}</div>
                    <p className="text-[9px] font-sans uppercase tracking-widest opacity-60">Confidence Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold tracking-tighter">{result.prediction}</div>
                    <p className="text-[9px] font-sans uppercase tracking-widest opacity-60">Predicted Seats</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-x-auto"
              >
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#1A1A1A]">
                      <th className="text-left py-4 text-[11px] font-sans uppercase tracking-[0.2em] opacity-40 font-medium">Category Breakdown</th>
                      <th className="text-right py-4 text-[11px] font-sans uppercase tracking-[0.2em] opacity-40 font-medium">Verified Value</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg">
                    <tr className="border-b border-gray-100 hover:bg-[#F4F2EE] transition-colors">
                      <td className="py-6 italic">General Category Enrollment</td>
                      <td className="py-6 text-right font-sans">{fileData?.gen}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-[#F4F2EE] transition-colors">
                      <td className="py-6 italic">OBC-NCL Representation</td>
                      <td className="py-6 text-right font-sans">{fileData?.obc}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-[#F4F2EE] transition-colors">
                      <td className="py-6 italic">SC / ST Combined</td>
                      <td className="py-6 text-right font-sans">{(fileData?.sc ?? 0) + (fileData?.st ?? 0)}</td>
                    </tr>
                    <tr className="border-b border-[#1A1A1A] bg-[#F4F2EE]">
                      <td className="py-6 font-bold tracking-tight text-xl">Aggregated Prediction</td>
                      <td className="py-6 text-right text-3xl font-sans font-black">{result.prediction}</td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 group-hover:opacity-30 transition-opacity">
                <BarChart3 className="w-24 h-24 mb-6 stroke-[0.5px]" />
                <h3 className="text-3xl font-light italic">Awaiting Manifest Ingestion</h3>
                <p className="max-w-xs font-sans text-xs uppercase tracking-widest mt-4">Prediction engine standby mode. Supply JSON data to initiate analysis.</p>
              </div>
            )}
          </div>

          <footer className="mt-auto flex flex-col sm:flex-row justify-between items-center text-[10px] font-sans uppercase tracking-[0.2em] pt-12 gap-4">
            <div className="flex space-x-6">
              <span>System Ready</span>
              <span className="opacity-20 italic">|</span>
              <span className="opacity-60">Latency: 14ms</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${result ? 'bg-emerald-500 animate-pulse' : 'bg-[#1A1A1A]'}`}></div>
              <span>Connected to Scikit Engine v3.0</span>
            </div>
          </footer>
        </section>
      </main>

      {/* Legal/Info Bar */}
      <div className="bg-[#1A1A1A] text-white/40 text-[9px] font-sans uppercase tracking-[0.4em] py-3 px-10 flex justify-between">
        <span>© 2026 Editorial Analytics Group</span>
        <span className="text-white/60">Restricted Access • Internal Use Only</span>
      </div>
    </div>
  );
}

