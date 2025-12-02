import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, Loader2, ArrowLeft, Save, Maximize2, X, RefreshCw, Wand2 } from 'lucide-react';
import { detectAndCrop, generateProductShot } from '../services/geminiService';
import { saveItem } from '../services/storage';
import { ClothingCategory, ClothingItem, AppView } from '../types';

interface MagicEntryProps {
  setView: (view: AppView) => void;
}

// Extend Partial ClothingItem with a UI specific flag
interface DetectedItemState extends Partial<ClothingItem> {
    isGenerating?: boolean;
    isSelected?: boolean;
}

const MagicEntry: React.FC<MagicEntryProps> = ({ setView }) => {
  const [step, setStep] = useState<'UPLOAD' | 'SCANNING' | 'REVIEW'>('UPLOAD');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedItemState[]>([]);
  const [loadingText, setLoadingText] = useState('初始化扫描...');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'SCANNING') {
        const messages = [
            '正在扫描全身穿搭...',
            '识别单品坐标中...', 
            '解构穿搭单品...', 
            'Fashion Knolling 处理中...', 
            '生成电商级白底图...'
        ];
        let i = 0;
        setLoadingText(messages[0]);
        interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingText(messages[i]);
        }, 1500);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setStep('SCANNING');
        processDetection(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cropImage = async (base64Img: string, box: {ymin: number, xmin: number, ymax: number, xmax: number}) => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const x = (box.xmin / 1000) * img.width;
        const y = (box.ymin / 1000) * img.height;
        const w = ((box.xmax - box.xmin) / 1000) * img.width;
        const h = ((box.ymax - box.ymin) / 1000) * img.height;
        
        // Add a slight padding for context if needed, but strict crop is better for generation
        canvas.width = w;
        canvas.height = h;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.src = base64Img;
    });
  };

  const processDetection = async (base64: string) => {
    try {
      // 1. Detect Items
      const results = await detectAndCrop(base64);
      
      if (results.length === 0) {
          alert('未检测到服装，请尝试正面站立拍摄');
          setStep('UPLOAD');
          return;
      }

      // 2. Crop Canvas (Instant Feedback)
      const croppedItems: DetectedItemState[] = await Promise.all(results.map(async (res) => {
        const croppedUrl = await cropImage(base64, res.box2d);
        return {
          id: crypto.randomUUID(),
          imageUrl: croppedUrl, // Initially use the raw crop
          name: res.name,
          category: res.category,
          color: res.color,
          material: res.material,
          price: 0,
          wearCount: 0,
          createdAt: Date.now(),
          box2d: res.box2d,
          isSelected: true,
          isGenerating: true, // Mark as generating high-res
          isDeleted: false,
          isWishlist: false
        };
      }));

      setDetectedItems(croppedItems);
      setStep('REVIEW');

      // 3. Background Process: Generate White Backgrounds (The "Nano Banana" Magic)
      // We do this concurrently and update state as they complete
      results.forEach(async (res, index) => {
          const crop = croppedItems[index].imageUrl;
          // Generate new image
          if (crop) {
            const whiteBgUrl = await generateProductShot(crop, res.name);
            setDetectedItems(prev => {
                const newItems = [...prev];
                if (newItems[index]) {
                    newItems[index] = { 
                        ...newItems[index], 
                        imageUrl: whiteBgUrl,
                        isGenerating: false // Done
                    };
                }
                return newItems;
            });
          }
      });

    } catch (err) {
      console.error(err);
      alert('识别失败，请检查网络或重试');
      setStep('UPLOAD');
    }
  };

  const handleSaveAll = async () => {
    const selected = detectedItems.filter((i) => i.isSelected);
    if (selected.length === 0) return;
    
    setIsSaving(true);

    try {
        for (const item of selected) {
            // Remove UI flags before saving
            const { isSelected, isGenerating, ...cleanItem } = item;
            await saveItem(cleanItem as ClothingItem);
        }
        
        // Show success state briefly then redirect
        setTimeout(() => {
            setView(AppView.WARDROBE);
        }, 800);
    } catch (e) {
        console.error("Save failed", e);
        setIsSaving(false);
        alert('保存失败，请重试');
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
      const updated = [...detectedItems];
      updated[index] = { ...updated[index], [field]: value };
      setDetectedItems(updated);
  };

  const toggleSelection = (index: number) => {
      const updated = [...detectedItems];
      updated[index].isSelected = !updated[index].isSelected;
      setDetectedItems(updated);
  };

  if (step === 'SCANNING') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden">
         {/* Background Image with Overlay */}
         {sourceImage && (
             <div className="absolute inset-0 opacity-50">
                 <img src={sourceImage} className="w-full h-full object-cover blur-sm" />
             </div>
         )}
         
         {/* Laser Scanner Effect */}
         <div className="absolute inset-0 z-10">
             <div className="w-full h-1 bg-[#e08e79] shadow-[0_0_20px_#e08e79] animate-[scan_2s_ease-in-out_infinite]"></div>
         </div>

         <div className="relative z-20 bg-white/10 backdrop-blur-md px-8 py-6 rounded-[2rem] border border-white/20 text-center shadow-2xl">
            <Loader2 className="animate-spin text-[#e08e79] mx-auto mb-4" size={48} />
            <p className="text-white font-medium tracking-[0.2em] uppercase text-sm animate-pulse">{loadingText}</p>
         </div>

         <style>{`
            @keyframes scan {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
            }
         `}</style>
      </div>
    );
  }

  if (step === 'REVIEW') {
      return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-40">
             {/* Sticky Header */}
             <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur z-20 px-6 py-6 flex justify-between items-center shadow-sm">
                <button onClick={() => setStep('UPLOAD')} className="text-gray-400 hover:text-[#333333] transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-lg font-light text-[#333333]">发现 {detectedItems.length} 件单品</h2>
                <div className="w-6"></div>
             </div>

             {/* Content Grid */}
             <div className="p-6 grid grid-cols-2 gap-4">
                 {detectedItems.length === 0 && <p className="col-span-2 text-center text-gray-400 mt-10">未检测到服饰，请尝试更清晰的全身照。</p>}
                 
                 {detectedItems.map((item, index) => {
                     const isSelected = item.isSelected;
                     return (
                         <div key={item.id || index} className={`bg-white rounded-[1.5rem] p-3 shadow-soft transition-all duration-300 relative group border border-transparent hover:border-[#e08e79]/30 ${!isSelected ? 'opacity-50 grayscale' : ''}`}>
                             {/* Selection Toggle */}
                             <button 
                                onClick={() => toggleSelection(index)}
                                className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-md ${isSelected ? 'bg-[#e08e79] text-white' : 'bg-gray-100 text-gray-300'}`}
                             >
                                 <Check size={14} strokeWidth={3} />
                             </button>

                             {/* Image Area */}
                             <div 
                                className="aspect-[1/1] w-full bg-white rounded-xl mb-3 relative overflow-hidden flex items-center justify-center cursor-zoom-in group-hover:shadow-inner transition-shadow" 
                                onClick={() => setZoomedImage(item.imageUrl || null)}
                             >
                                 {/* Loading State Overlay */}
                                 {item.isGenerating && (
                                     <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-[#e08e79]">
                                         <Wand2 size={20} className="animate-pulse mb-1" />
                                         <span className="text-[10px] font-bold uppercase tracking-wider">AI Refining</span>
                                     </div>
                                 )}

                                 {item.imageUrl ? (
                                    <img 
                                        src={item.imageUrl} 
                                        className="w-[90%] h-[90%] object-contain mix-blend-multiply transition-transform duration-500 hover:scale-110" 
                                        alt={item.name}
                                    />
                                 ) : (
                                     <div className="animate-pulse bg-gray-50 w-full h-full" />
                                 )}
                                 
                                 <div className="absolute bottom-2 right-2 bg-black/5 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Maximize2 size={14} className="text-gray-500" />
                                 </div>
                             </div>

                             {/* Info Input */}
                             <div className="space-y-2 px-1">
                                 <input 
                                    value={item.name}
                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                    className="w-full text-xs font-bold text-[#333333] bg-transparent outline-none truncate placeholder-gray-300 border-b border-transparent hover:border-gray-100 focus:border-[#e08e79] transition-colors pb-1"
                                    placeholder="输入单品名称"
                                 />
                                 <div className="flex justify-between items-center">
                                     <select 
                                        value={item.category}
                                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                                        className="text-[10px] bg-gray-50 rounded px-2 py-1 text-gray-500 outline-none appearance-none hover:bg-gray-100 transition-colors cursor-pointer"
                                     >
                                         {Object.values(ClothingCategory).map(cat => (
                                             <option key={cat} value={cat}>{cat}</option>
                                         ))}
                                     </select>
                                     <span className="text-[10px] text-gray-300">{item.color}</span>
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>

             {/* Fixed Bottom Action Bar */}
             {/* z-index set to 60 to override NavBar's 50 */}
             <div className="fixed bottom-0 left-0 w-full px-6 py-4 bg-white border-t border-gray-100 z-[60] pb-8 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                 <button 
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="w-full bg-[#333333] text-white py-4 rounded-[1.2rem] font-bold tracking-widest uppercase shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-black disabled:opacity-80"
                 >
                     {isSaving ? (
                         <>
                            <Loader2 size={18} className="animate-spin" />
                            正在分类归档...
                         </>
                     ) : (
                         <>
                            <Save size={18} />
                            确定录入衣橱
                         </>
                     )}
                 </button>
             </div>

             {/* Zoom Modal */}
             {zoomedImage && (
                 <div className="fixed inset-0 z-[70] bg-white/95 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in-up" onClick={() => setZoomedImage(null)}>
                     <button className="absolute top-6 right-6 p-4 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                         <X size={24} />
                     </button>
                     <div className="relative w-full max-w-lg aspect-square bg-white rounded-[2rem] shadow-2xl p-8 flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <img src={zoomedImage} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                     </div>
                 </div>
             )}
        </div>
      );
  }

  return (
    <div className="h-screen bg-[#FAFAFA] p-8 flex flex-col relative">
        <button onClick={() => setView(AppView.HOME)} className="absolute top-8 left-8 p-2 -ml-2 text-gray-400 hover:text-[#333333] transition-colors">
            <ArrowLeft size={24} />
        </button>
        
        <div className="flex-1 flex flex-col justify-center items-center animate-fade-in-up">
            <h1 className="text-4xl font-light text-[#333333] mb-4">Magic Entry</h1>
            <p className="text-gray-400 mb-12 text-center text-sm font-light leading-relaxed">
                拍摄 OOTD <br/> 瞬间生成电商级商品库
            </p>
            
            <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xs aspect-[3/4] rounded-[3rem] border-2 border-dashed border-gray-200 bg-white hover:bg-white hover:border-[#e08e79] transition-all duration-500 flex flex-col items-center justify-center group shadow-soft hover:shadow-xl cursor-pointer relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[#e08e79]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-24 h-24 rounded-full bg-[#FAFAFA] shadow-inner flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Camera size={32} className="text-[#e08e79]" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-[#333333] tracking-[0.2em] uppercase relative z-10">Tap to Scan</span>
            </button>
        </div>
    </div>
  );
};

export default MagicEntry;