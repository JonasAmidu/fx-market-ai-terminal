import React, { useState } from 'react';
import { X, Key, Volume2, Sparkles, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ELEVENLABS_VOICES } from '../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  onSaveGeminiKey: (key: string) => void;
  geminiModel: string;
  onSaveGeminiModel: (model: string) => void;
  elevenLabsKey: string;
  onSaveElevenLabsKey: (key: string) => void;
  selectedVoiceId: string;
  onSaveSelectedVoiceId: (id: string) => void;
  speechSpeed: number;
  onSaveSpeechSpeed: (speed: number) => void;
  autoPlayVoiceover: boolean;
  onSaveAutoPlayVoiceover: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  geminiKey,
  onSaveGeminiKey,
  geminiModel,
  onSaveGeminiModel,
  elevenLabsKey,
  onSaveElevenLabsKey,
  selectedVoiceId,
  onSaveSelectedVoiceId,
  speechSpeed,
  onSaveSpeechSpeed,
  autoPlayVoiceover,
  onSaveAutoPlayVoiceover,
}) => {
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiKey);
  const [localGeminiModel, setLocalGeminiModel] = useState(geminiModel);
  const [localElevenLabsKey, setLocalElevenLabsKey] = useState(elevenLabsKey);
  const [localVoiceId, setLocalVoiceId] = useState(selectedVoiceId);
  const [localSpeed, setLocalSpeed] = useState(speechSpeed);
  const [localAutoPlay, setLocalAutoPlay] = useState(autoPlayVoiceover);

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showElevenKey, setShowElevenKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveGeminiKey(localGeminiKey);
    onSaveGeminiModel(localGeminiModel);
    onSaveElevenLabsKey(localElevenLabsKey);
    onSaveSelectedVoiceId(localVoiceId);
    onSaveSpeechSpeed(localSpeed);
    onSaveAutoPlayVoiceover(localAutoPlay);

    // Save to localStorage
    try {
      localStorage.setItem('fx_gemini_key', localGeminiKey);
      localStorage.setItem('fx_gemini_model', localGeminiModel);
      localStorage.setItem('fx_eleven_key', localElevenLabsKey);
      localStorage.setItem('fx_voice_id', localVoiceId);
      localStorage.setItem('fx_speech_speed', localSpeed.toString());
      localStorage.setItem('fx_autoplay', localAutoPlay ? 'true' : 'false');
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-wide">
                Terminal AI & Audio Configuration
              </h3>
              <p className="text-xs text-slate-400">Custom API keys & Voiceover settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Gemini AI Section */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Google Gemini AI Engine
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Optional
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Gemini API Key</label>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={localGeminiKey}
                  onChange={e => setLocalGeminiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                If left blank, the terminal automatically uses the built-in <strong>Deep Quantitative Heuristic Engine</strong> (100% functional without an API key!).
              </p>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Model Selection</label>
              <select
                value={localGeminiModel}
                onChange={e => setLocalGeminiModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-fast, Recommended)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
              </select>
            </div>
          </div>

          {/* ElevenLabs & Voice Section */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Audio Broadcast & ElevenLabs
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Studio Quality
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ElevenLabs API Key</label>
              <div className="relative">
                <input
                  type={showElevenKey ? 'text' : 'password'}
                  placeholder="xi-api-key..."
                  value={localElevenLabsKey}
                  onChange={e => setLocalElevenLabsKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowElevenKey(!showElevenKey)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showElevenKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                If blank, the terminal will seamlessly use your browser's built-in Web Speech synthesis engine.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">AI Analyst Voice</label>
                <select
                  value={localVoiceId}
                  onChange={e => setLocalVoiceId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  {ELEVENLABS_VOICES.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">Speech Rate</label>
                  <span className="font-mono text-emerald-400">{localSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.1"
                  value={localSpeed}
                  onChange={e => setLocalSpeed(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 mt-1.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoPlayVoiceover"
                checked={localAutoPlay}
                onChange={e => setLocalAutoPlay(e.target.checked)}
                className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="autoPlayVoiceover" className="text-slate-300 cursor-pointer select-none">
                Automatically read scan broadcast aloud upon AI completion
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Settings persist in local browser storage</span>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950 glow-emerald"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
