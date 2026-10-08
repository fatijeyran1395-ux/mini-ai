'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [mode, setMode] = useState<'text2img' | 'img2img'>('text2img');
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تایمر
  useEffect(() => {
    if (!loading) {
      setSeconds(0);
      return;
    }
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [loading]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    if (mode === 'img2img' && !image) {
      setError('Please upload an image.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const endpoint = mode === 'text2img' ? '/api/text-to-image' : '/api/image-to-image';
      const body = mode === 'text2img' ? { prompt } : { prompt, imageBase64: image };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data.image);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setPrompt('');
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center p-4">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Studio
            </h1>
            <p className="text-slate-400 mt-2 text-sm tracking-widest uppercase">
              Premium Image Generation
            </p>
          </div>

          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8">

            {/* Mode Toggle */}
            <div className="flex gap-2 bg-black/30 p-1.5 rounded-2xl mb-6">
              <button
                  onClick={() => { setMode('text2img'); resetAll(); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      mode === 'text2img'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'text-slate-400 hover:text-white'
                  }`}
              >
                Text → Image
              </button>
              <button
                  onClick={() => { setMode('img2img'); resetAll(); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      mode === 'img2img'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'text-slate-400 hover:text-white'
                  }`}
              >
                Image + Text → Image
              </button>
            </div>

            {/* Upload (only img2img) */}
            {mode === 'img2img' && (
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Upload Reference Image
                  </label>
                  <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-purple-400/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-black/20"
                  >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                    {image ? (
                        <img src={image} alt="preview" className="max-h-48 mx-auto rounded-xl" />
                    ) : (
                        <div className="text-slate-400">
                          <p className="text-sm">Click to upload</p>
                          <p className="text-xs mt-1 opacity-60">PNG, JPG up to 10MB</p>
                        </div>
                    )}
                  </div>
                </div>
            )}

            {/* Prompt */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Your Prompt
              </label>
              <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cinematic portrait of a woman in neon-lit city..."
                  className="w-full h-28 p-4 rounded-2xl bg-black/30 border border-white/10 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 outline-none resize-none text-sm placeholder:text-slate-600 transition-all"
              />
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 py-4 rounded-2xl font-semibold text-sm tracking-wide shadow-lg shadow-purple-500/20 transition-all duration-300"
            >
              {loading ? (
                  <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Generating... ({seconds}s)
              </span>
              ) : (
                  '✨ Generate Image'
              )}
            </button>

            {/* Error */}
            {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
                  {error}
                </div>
            )}
          </div>

          {/* Result */}
          {result && (
              <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm uppercase tracking-wider text-slate-400">Result</h2>
                  <button
                      onClick={resetAll}
                      className="text-xs text-slate-500 hover:text-white transition"
                  >
                    Clear
                  </button>
                </div>
                <img src={result} alt="result" className="w-full rounded-2xl shadow-2xl" />
                <a
                    href={result}
                    download="ai-result.png"
                    className="block mt-4 text-center bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-2xl text-sm font-medium transition"
                >
                  ⬇ Download
                </a>
              </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-slate-600 mt-6 tracking-wider">
            Powered by Cloudflare Workers AI • Free Tier
          </p>
        </div>
      </main>
  );
}