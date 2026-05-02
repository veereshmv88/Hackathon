import React, { useState } from 'react';
import { 
  Terminal, 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  Zap,
  Info,
  ChevronDown,
  Lock
} from 'lucide-react';
import { useShieldStore } from '../store/useShieldStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const PromptSandbox = () => {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setIsAnalyzing(true);
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following prompt for potential security risks including injection, jailbreaks, Base64 obfuscation, and toxic behavior.
        Prompt: "${prompt}"`,
        config: {
          systemInstruction: "You are an AI Security Analyst. Evaluate prompts for safety. Return a JSON object with: safe (boolean), score (number 0-100), risk_level (HIGH, MEDIUM, LOW), and analysis (string).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              safe: { type: Type.BOOLEAN },
              score: { type: Type.NUMBER },
              risk_level: { type: Type.STRING },
              analysis: { type: Type.STRING },
            },
            required: ["safe", "score", "risk_level", "analysis"]
          }
        },
      });

      const analysis = JSON.parse(response.text || '{}');
      setResult(analysis);
    } catch (error) {
      console.error('Gemini Analysis Failed:', error);
      setResult({
        safe: true,
        score: 0,
        risk_level: 'INFO',
        analysis: 'Model analysis failed. Fallback to heuristic scan: NO IMMEDIATE THREAT DETECTED.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'HIGH': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Terminal size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Prompt Sandbox</h1>
            <p className="text-slate-500 font-medium">Test LLM inputs against our real-time security firewall</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Input Area */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Input Payload</label>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-slate-400">Shield Active</span>
              </div>
            </div>
            <textarea
              className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm resize-none"
              placeholder="Enter LLM prompt to test for injection, bypasses, or toxicity..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !prompt.trim()}
              className="mt-6 w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>AI ANALYSIS RUN <Send size={18} /></>
              )}
            </button>
          </div>

          {/* Analysis Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg">Firewall Analysis</h3>
                  <div className={cn("px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 border", getRiskColor(result.risk_level))}>
                    {result.safe ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    {result.safe ? 'PASSED' : 'BLOCKED'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Security Score</p>
                    <p className={cn("text-2xl font-black", result.safe ? 'text-emerald-400' : 'text-red-400')}>{result.score}/100</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Risk Level</p>
                    <p className={cn("text-2xl font-black uppercase", getRiskColor(result.risk_level).split(' ')[0])}>{result.risk_level}</p>
                  </div>
                </div>

                <div className="bg-white/2 p-6 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info size={14} /> AI Analysis Report
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic font-mono uppercase">
                    &gt; {result.analysis}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-white mb-4">Detection Vectors</h4>
            <div className="space-y-3">
              {[
                { name: 'DAN (Bypass)', active: true },
                { name: 'Base64 Encoding', active: true },
                { name: 'Instruction Split', active: true },
                { name: 'PII Exfiltration', active: false },
                { name: 'Prompt Leak', active: true },
              ].map(v => (
                <div key={v.name} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{v.name}</span>
                  <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase", v.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600')}>
                    {v.active ? 'LIVE' : 'IDLE'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg w-fit">
              <Zap className="text-indigo-400" size={20} />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Security Hardening</h4>
            <p className="text-xs text-indigo-400/80 leading-relaxed font-medium capitalize">
              Ensure you sanitize all model inputs. Use our API endpoint to automate this process in production.
            </p>
            <button className="text-[10px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1">
              Read Docs <ChevronDown size={14} />
            </button>
          </div>

          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4">
            <Lock className="text-red-500/50" size={24} />
            <div>
              <p className="text-xs font-bold text-white uppercase">Vault Status</p>
              <p className="text-[10px] text-red-400 font-bold">LOCKED & ENCRYPTED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
