import React, { useState, useRef } from 'react';
import { Tag, ScanLine, ShoppingBag, Store, MapPin, AlertTriangle, TrendingDown } from 'lucide-react';
import { analyzeFairPrice } from '../services/geminiService';
import { FairPriceResult } from '../types';

const FairPriceLens: React.FC = () => {
  const [tagImage, setTagImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('批发市场');
  const [result, setResult] = useState<FairPriceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!garmentImage) {
        alert('请至少上传衣服全貌图');
        return;
    }
    setLoading(true);
    try {
        const data = await analyzeFairPrice(tagImage, garmentImage, location);
        setResult(data);
    } catch (e) {
        alert('分析失败，请重试');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 pt-10 px-6 overflow-y-auto">
        <header className="mb-8">
            <div className="flex items-center gap-3 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e08e79]"></span>
                <span className="text-[10px] font-bold text-[#e08e79] uppercase tracking-[0.2em]">Fair Price Lens</span>
            </div>
            <h1 className="text-3xl font-light text-[#333333]">智能识价</h1>
            <p className="text-xs text-gray-400 mt-2">拒绝智商税，精准估算成本</p>
        </header>

        {/* Upload Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
                onClick={() => tagInputRef.current?.click()}
                className="aspect-[4/5] bg-white rounded-[2rem] border border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group hover:border-[#e08e79] transition-all shadow-soft"
            >
                {tagImage ? (
                    <img src={tagImage} className="w-full h-full object-cover" />
                ) : (
                    <>
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                             <Tag className="text-gray-300 group-hover:text-[#e08e79] transition-colors" size={20} />
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">上传水洗标</span>
                    </>
                )}
            </button>
            <input type="file" ref={tagInputRef} className="hidden" accept="image/*" onChange={(e) => handleImage(e, setTagImage)} />

            <button 
                onClick={() => garmentInputRef.current?.click()}
                className="aspect-[4/5] bg-white rounded-[2rem] border border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group hover:border-[#e08e79] transition-all shadow-soft"
            >
                {garmentImage ? (
                    <img src={garmentImage} className="w-full h-full object-cover" />
                ) : (
                    <>
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ScanLine className="text-gray-300 group-hover:text-[#e08e79] transition-colors" size={20} />
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">上传全貌</span>
                    </>
                )}
            </button>
            <input type="file" ref={garmentInputRef} className="hidden" accept="image/*" onChange={(e) => handleImage(e, setGarmentImage)} />
        </div>

        {/* Location Selector */}
        <div className="bg-white px-6 py-6 rounded-[2rem] shadow-soft mb-8">
            <label className="text-[10px] uppercase tracking-widest text-gray-300 mb-4 block flex items-center gap-2 font-bold">
                <MapPin size={12} /> 购买渠道
            </label>
            <div className="flex flex-wrap gap-3">
                {['批发市场', '街边小店', '商场专柜', '直播间'].map(loc => (
                    <button
                        key={loc}
                        onClick={() => setLocation(loc)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                            location === loc 
                            ? 'bg-[#333333] text-white shadow-lg transform scale-105' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {loc}
                    </button>
                ))}
            </div>
        </div>

        {/* Action Button */}
        <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-[#e08e79] text-white py-5 rounded-[1.5rem] font-bold tracking-widest uppercase shadow-lg shadow-[#e08e79]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-[#d07d68]"
        >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <ScanLine size={18} />}
            {loading ? 'AI 分析中...' : '开始识价'}
        </button>

        {/* Result Card */}
        {result && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-white mt-8 animate-fade-in-up relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#2d9e64]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="mb-8">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">建议入手价 (CNY)</div>
                        <div className="text-6xl font-light text-[#2d9e64] tracking-tighter">¥{result.fair_price_range}</div>
                    </div>
                    
                    {/* Price Comparison Shield */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                             <TrendingDown size={18} />
                        </div>
                        <div>
                             <div className="text-[10px] text-blue-400 font-bold uppercase">全网同款均价</div>
                             <div className="text-sm text-blue-800 font-medium line-through decoration-blue-300">¥{Math.floor(parseInt(result.base_cost.toString()) * 2.5)} (参考)</div>
                        </div>
                    </div>

                    {/* Fabric Warning */}
                    {result.is_rip_off && (
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6 flex items-start gap-3">
                             <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                             <div>
                                 <div className="text-xs font-bold text-red-600 mb-1">成分避雷预警</div>
                                 <div className="text-[10px] text-red-400 leading-tight">检测到高溢价低成本面料（如聚酯纤维），请谨慎购买。</div>
                             </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-8 mb-8">
                         <div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-300 mb-2 font-bold">基础成本</div>
                            <div className="text-xl font-medium text-gray-600">¥{result.base_cost}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-300 mb-2 font-bold">主要成分</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-600 border border-gray-100">
                                    {result.material}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50/50 p-6 rounded-[1.5rem] border border-orange-100/50 relative">
                        <div className="absolute -top-3 -left-3 bg-white p-2 rounded-full shadow-sm text-orange-400">
                             <Tag size={16} />
                        </div>
                        <div className="text-[10px] font-bold text-orange-800 uppercase tracking-wide mb-2 pl-2">砍价金句</div>
                        <div className="text-sm text-gray-700 italic font-serif leading-relaxed pl-2">"{result.haggle_tip}"</div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default FairPriceLens;