import React, { useEffect, useState, useRef } from 'react';
import { ClothingItem, ClothingCategory } from '../types';
import { getAllItems, updateItemWearCount } from '../services/storage';
import { RefreshCw, Lock, Unlock, CheckCircle, Share2, Image as ImageIcon } from 'lucide-react';

declare const html2canvas: any;

const ShuffleStudio: React.FC = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [top, setTop] = useState<ClothingItem | null>(null);
  const [bottom, setBottom] = useState<ClothingItem | null>(null);
  const [lockTop, setLockTop] = useState(false);
  const [lockBottom, setLockBottom] = useState(false);
  const [ghostTop, setGhostTop] = useState<string | null>(null);
  
  // Background State
  const [bgStyle, setBgStyle] = useState<string>('bg-white');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await getAllItems();
    const activeItems = data.filter(i => !i.isDeleted);
    setItems(activeItems);
    performShuffle(activeItems, false, false);
  };

  const performShuffle = (allItems: ClothingItem[], keepTop: boolean, keepBottom: boolean) => {
    const tops = allItems.filter(i => i.category === ClothingCategory.TOPS || i.category === ClothingCategory.OUTERWEAR);
    const bottoms = allItems.filter(i => i.category === ClothingCategory.BOTTOMS || i.category === ClothingCategory.DRESSES);

    if (!keepTop) {
        if (tops.length > 0 && Math.random() < 0.15) {
            setTop(null);
            setGhostTop("AI 建议: 搭配一件法式白衬衫");
        } else if (tops.length > 0) {
            setTop(tops[Math.floor(Math.random() * tops.length)]);
            setGhostTop(null);
        }
    }
    if (!keepBottom && bottoms.length > 0) {
        setBottom(bottoms[Math.floor(Math.random() * bottoms.length)]);
    }
  };

  const handleShuffle = () => {
    performShuffle(items, lockTop, lockBottom);
  };

  const handleLogOutfit = async () => {
      if (top) await updateItemWearCount(top.id);
      if (bottom) await updateItemWearCount(bottom.id);
      alert('已记录今日穿搭! (穿着次数 +1)');
  };

  const handleShare = async () => {
      if (!canvasRef.current) return;
      if (typeof html2canvas === 'undefined') {
          alert('Share module loading...');
          return;
      }
      
      try {
          const canvas = await html2canvas(canvasRef.current, { scale: 2 });
          const link = document.createElement('a');
          link.download = 'my-outfit-share.png';
          link.href = canvas.toDataURL();
          link.click();
      } catch (e) {
          console.error(e);
          alert('生成海报失败');
      }
  };

  const backgrounds = [
      { id: 'white', class: 'bg-white', label: '纯白' },
      { id: 'grid', class: 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] bg-white', label: '网格' },
      { id: 'warm', class: 'bg-orange-50', label: '暖调' },
      { id: 'cool', class: 'bg-slate-100', label: '冷调' }
  ];

  return (
    <div className="h-screen bg-[#FAFAFA] flex flex-col pb-[100px]">
        {/* Canvas Ref for Share */}
        <div ref={canvasRef} className={`flex-1 flex flex-col relative transition-colors duration-500 ${bgStyle}`}>
            {/* Top Slot */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-8 group border-b border-gray-50/50">
                <button onClick={() => setLockTop(!lockTop)} className={`absolute top-8 right-8 z-20 transition-all p-3 rounded-full ${lockTop ? 'bg-[#e08e79]/10 text-[#e08e79]' : 'text-gray-200 hover:text-gray-400'}`}>
                    {lockTop ? <Lock size={20} /> : <Unlock size={20} />}
                </button>
                {top ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img src={top.imageUrl} className="max-h-[85%] max-w-[85%] object-contain mix-blend-multiply drop-shadow-2xl animate-fade-in-up" />
                    </div>
                ) : (
                   <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center max-w-xs bg-white/50">
                       <p className="text-gray-400 text-sm font-medium italic font-serif leading-relaxed">{ghostTop || "无上装数据"}</p>
                   </div> 
                )}
            </div>

            {/* Bottom Slot */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-8 group">
                <button onClick={() => setLockBottom(!lockBottom)} className={`absolute top-8 right-8 z-20 transition-all p-3 rounded-full ${lockBottom ? 'bg-[#e08e79]/10 text-[#e08e79]' : 'text-gray-200 hover:text-gray-400'}`}>
                    {lockBottom ? <Lock size={20} /> : <Unlock size={20} />}
                </button>
                {bottom ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img src={bottom.imageUrl} className="max-h-[85%] max-w-[85%] object-contain mix-blend-multiply drop-shadow-2xl animate-fade-in-up" />
                    </div>
                ) : (
                    <div className="text-gray-300 text-sm font-serif italic">无下装数据</div>
                )}
            </div>

            {/* Shuffle Button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <button onClick={handleShuffle} className="bg-[#333333] text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform hover:bg-black ring-8 ring-[#FAFAFA]">
                    <RefreshCw size={28} strokeWidth={1.5} />
                </button>
            </div>
            
            {/* Branding for Share */}
            <div className="absolute bottom-4 right-4 text-[10px] text-gray-300 uppercase tracking-[0.2em] font-bold">
                AI Smart Wardrobe
            </div>
        </div>

        {/* Background Selector */}
        <div className="absolute bottom-32 right-6 flex flex-col gap-2 z-40">
             {backgrounds.map(bg => (
                 <button 
                    key={bg.id}
                    onClick={() => setBgStyle(bg.class)}
                    className={`w-8 h-8 rounded-full shadow-md border-2 ${bg.class.split(' ')[0]} ${bgStyle === bg.class ? 'border-[#333333] scale-110' : 'border-white'}`}
                    title={bg.label}
                 />
             ))}
        </div>

        {/* Action Bar */}
        <div className="px-8 py-6 bg-white/80 backdrop-blur-xl border-t border-white flex justify-between items-center absolute bottom-[100px] left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-[2rem] shadow-lg z-40">
            <button onClick={handleShare} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#333333] transition-colors">
                <Share2 size={18} />
                <span className="text-[10px] uppercase font-bold tracking-wide">分享海报</span>
            </button>
            
            <button onClick={handleLogOutfit} className="bg-[#333333] text-white px-8 py-3 rounded-full text-xs font-bold shadow-lg active:scale-95 flex items-center gap-2 uppercase tracking-wide hover:bg-black">
                <CheckCircle size={14} />
                记录今日 OOTD
            </button>
        </div>
    </div>
  );
};

export default ShuffleStudio;