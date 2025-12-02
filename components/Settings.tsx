import React, { useState, useEffect } from 'react';
import { Save, Key } from 'lucide-react';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('CUSTOM_API_KEY');
    if (saved) setApiKey(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem('CUSTOM_API_KEY', apiKey);
    alert('API Key Saved');
  };

  return (
    <div className="p-8 pt-20 max-w-md mx-auto min-h-screen bg-[#FAFAFA]">
      <h1 className="text-4xl font-light text-[#333333] mb-12">Settings</h1>
      
      <div className="bg-white p-8 rounded-[2.5rem] shadow-soft mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-center gap-4 mb-8 text-[#333333] relative z-10">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
             <Key size={18} className="text-gray-400" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest">Google API Key</h2>
        </div>
        
        <p className="text-xs text-gray-400 mb-8 leading-relaxed font-light">
          Your key is stored locally in your browser to power the Gemini AI features. We never send it to any external server other than Google.
        </p>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste API Key here"
          className="w-full bg-gray-50 border-b border-gray-200 rounded-t-xl px-6 py-4 text-sm focus:outline-none focus:border-[#e08e79] focus:bg-white transition-all mb-8 text-[#333333] font-mono"
        />

        <button
          onClick={handleSave}
          className="w-full bg-[#333333] text-white py-5 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-black shadow-lg"
        >
          <Save size={16} />
          Save Configuration
        </button>
      </div>

      <div className="mt-16 text-center">
         <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em] mb-3">Designed for</p>
         <p className="text-sm font-medium text-gray-400">AI Smart Wardrobe 2.0</p>
      </div>
    </div>
  );
};

export default Settings;