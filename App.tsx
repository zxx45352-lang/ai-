import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import MagicEntry from './components/MagicEntry';
import FairPriceLens from './components/FairPriceLens';
import Wardrobe from './components/Wardrobe';
import ShuffleStudio from './components/ShuffleStudio';
import Settings from './components/Settings';
import { AppView, ClothingItem } from './types';
import { initDB, getAllItems } from './services/storage';
import { getDailyRecommendation } from './services/geminiService';
import { Sparkles, Camera, ArrowRight, Sun, Trophy, CheckCircle, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [recommendation, setRecommendation] = useState<string>('');
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [bestCPWItem, setBestCPWItem] = useState<ClothingItem | null>(null);
  const [dailyQuestCompleted, setDailyQuestCompleted] = useState(false);

  useEffect(() => {
    const init = async () => {
        await initDB();
        const items = await getAllItems();
        const activeItems = items.filter(i => !i.isDeleted && !i.isWishlist);
        setWardrobeCount(activeItems.length);
        
        // Asset Calculation
        const total = activeItems.reduce((sum, item) => sum + (item.price || 0), 0);
        setTotalValue(total);

        // CPW Calculation
        let bestItem: ClothingItem | null = null;
        let lowestCPW = Infinity;
        
        activeItems.forEach(item => {
            if(item.price > 0 && item.wearCount > 0) {
                const cpw = item.price / item.wearCount;
                if(cpw < lowestCPW) {
                    lowestCPW = cpw;
                    bestItem = item;
                }
            }
        });
        setBestCPWItem(bestItem);
        
        // 模拟位置和天气数据 (实际应用中应使用 navigator.geolocation 和天气 API)
        const mockWeather = "15°C 多云转阴"; 
        
        try {
            // 调用 Gemini 生成每日穿搭建议
            const rec = await getDailyRecommendation(activeItems, mockWeather);
            setRecommendation(rec.suggestion);
        } catch (e) {
            setRecommendation("今天也是光彩照人的一天，记得自信微笑！");
        }
    };
    init();
  }, [currentView]); // Re-run when view changes to update stats

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <div className="min-h-screen bg-[#FAFAFA] flex flex-col p-8 pt-12 relative overflow-hidden pb-32">
             {/* Abstract Background Element */}
             <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#e08e79]/10 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute top-[20%] left-[-10%] w-64 h-64 bg-blue-50/50 rounded-full blur-[80px] pointer-events-none" />

             {/* Header */}
             <header className="mb-8 relative z-10 animate-fade-in-up">
               <div className="flex justify-between items-start mb-6">
                   <div>
                        <p className="text-xs text-gray-400 font-medium tracking-[0.2em] mb-3 uppercase">TODAY</p>
                        <h1 className="text-4xl font-light text-[#333333] leading-[1.2]">
                            早安, <br/>穿搭灵感<span className="text-[#e08e79]">.</span>
                        </h1>
                   </div>
                   <div className="flex flex-col items-end">
                        <Sun className="text-[#e08e79] mb-1" size={24} strokeWidth={1.5} />
                        <span className="text-sm font-medium text-gray-500">15°C</span>
                   </div>
               </div>
               
               {/* AI Bubble */}
               <div className="bg-white/60 backdrop-blur-md border border-white/50 p-6 rounded-[20px] shadow-soft relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#e08e79]"></div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-[#e08e79]/10 rounded-full text-[#e08e79] shrink-0">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">AI Stylist Assistant</p>
                            <p className="text-sm text-[#333333] font-light leading-relaxed italic font-serif">
                                "{recommendation || '正在分析天气与衣橱数据...'}"
                            </p>
                        </div>
                    </div>
               </div>
             </header>

             {/* Asset Insights */}
             <div className="grid grid-cols-2 gap-4 mb-6 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-white p-5 rounded-3xl shadow-soft flex flex-col justify-between h-36">
                    <div>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-1">Total Value</span>
                        <span className="text-2xl font-light text-[#333333]">¥{totalValue.toLocaleString()}</span>
                    </div>
                    <div>
                         <div className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">Total Items</div>
                         <div className="text-lg font-medium">{wardrobeCount}</div>
                    </div>
                </div>
                 <div className="bg-[#333333] p-5 rounded-3xl shadow-soft flex flex-col justify-between h-36 text-white relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                        <TrendingUp size={80} />
                    </div>
                    <div>
                         <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-1">CPW King</span>
                         <span className="text-lg font-light truncate w-full block">{bestCPWItem ? bestCPWItem.name : "暂无数据"}</span>
                    </div>
                    <div className="mt-2">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Cost Per Wear</div>
                        <div className="text-2xl font-medium text-[#e08e79]">
                            {bestCPWItem ? `¥${Math.round(bestCPWItem.price / bestCPWItem.wearCount)}` : "-"}
                        </div>
                    </div>
                </div>
             </div>

             {/* Daily Quest */}
             <div className="bg-gradient-to-r from-orange-50 to-white p-5 rounded-[2rem] border border-orange-100 mb-8 flex items-center justify-between shadow-sm animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                 <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-[#e08e79] rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-200">
                         <Trophy size={18} />
                     </div>
                     <div>
                         <h4 className="text-sm font-bold text-[#333333]">今日任务</h4>
                         <p className="text-xs text-gray-500">记录一次 OOTD (+50积分)</p>
                     </div>
                 </div>
                 <button 
                    onClick={() => setDailyQuestCompleted(!dailyQuestCompleted)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${dailyQuestCompleted ? 'bg-[#e08e79] border-[#e08e79] text-white' : 'border-gray-200 text-transparent'}`}
                 >
                     <CheckCircle size={16} fill="currentColor" className={dailyQuestCompleted ? 'text-white' : 'text-transparent'} />
                 </button>
             </div>

             {/* Actions */}
             <div className="space-y-4 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <button 
                  onClick={() => setCurrentView(AppView.ADD)}
                  className="w-full bg-white p-1 rounded-[2rem] shadow-soft group transition-all duration-300 hover:shadow-lg pr-6 flex items-center gap-6"
                >
                   <div className="w-20 h-20 bg-[#FAFAFA] rounded-[1.8rem] flex items-center justify-center text-[#e08e79] relative overflow-hidden">
                      <Camera size={28} strokeWidth={1.5} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-[#e08e79]/5 rounded-[1.8rem]"></div>
                   </div>
                   <div className="flex-1 text-left py-2">
                        <h3 className="text-base font-medium text-[#333333] mb-0.5">智能录入</h3>
                        <p className="text-[10px] text-gray-400 font-light">上传全身照，自动提取单品</p>
                   </div>
                   <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-[#e08e79] group-hover:text-[#e08e79] transition-colors">
                        <ArrowRight size={14} />
                   </div>
                </button>

                <button 
                   onClick={() => setCurrentView(AppView.INSPIRATION)}
                   className="w-full bg-white p-1 rounded-[2rem] shadow-soft group transition-all duration-300 hover:shadow-lg pr-6 flex items-center gap-6"
                >
                   <div className="w-20 h-20 bg-[#FAFAFA] rounded-[1.8rem] flex items-center justify-center text-purple-400 relative overflow-hidden">
                      <Sparkles size={28} strokeWidth={1.5} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-purple-50 rounded-[1.8rem]"></div>
                   </div>
                   <div className="flex-1 text-left py-2">
                        <h3 className="text-base font-medium text-[#333333] mb-0.5">灵感搭配</h3>
                        <p className="text-[10px] text-gray-400 font-light">AI 帮你寻找穿搭灵感</p>
                   </div>
                   <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-purple-300 group-hover:text-purple-400 transition-colors">
                        <ArrowRight size={14} />
                   </div>
                </button>
             </div>
          </div>
        );
      case AppView.WARDROBE:
        return <Wardrobe />;
      case AppView.ADD:
        return <MagicEntry setView={setCurrentView} />;
      case AppView.FAIR_PRICE:
        return <FairPriceLens />;
      case AppView.INSPIRATION:
        return <ShuffleStudio />;
      case AppView.SETTINGS:
        return <Settings />;
      default:
        return <Wardrobe />;
    }
  };

  return (
    <div className="font-sans text-[#333333] antialiased bg-[#FAFAFA] min-h-screen">
      {currentView === AppView.INSPIRATION ? <ShuffleStudio /> : renderView()}
      <NavBar currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;