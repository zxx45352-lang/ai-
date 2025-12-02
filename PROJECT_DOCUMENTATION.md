# AI Smart Wardrobe 2.0 - Codebase Export

**Project Description**: A high-end, AI-powered digital wardrobe application featuring smart item entry (Magic Entry), fair price analysis, and outfit inspiration, built with React, Tailwind CSS, and Google Gemini API.

**Generated Date**: Current

---

## 1. Metadata (metadata.json)

```json
{
  "name": "Copy of AI Smart Wardrobe 2.0",
  "description": "A high-end, AI-powered digital wardrobe application featuring smart item entry, fair price analysis, and outfit inspiration.",
  "requestFramePermissions": [
    "camera"
  ]
}
```

---

## 2. HTML Entry (index.html)

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>AI Smart Wardrobe 2.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
      /* Hide scrollbar for Chrome, Safari and Opera */
      .no-scrollbar::-webkit-scrollbar {
          display: none;
      }
      /* Hide scrollbar for IE, Edge and Firefox */
      .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
      }
      /* Safe area for iPhone X+ */
      .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
      }
      .pb-safe {
          padding-bottom: calc(90px + env(safe-area-inset-bottom));
      }
      @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 20px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      body {
        background-color: #FAFAFA;
        color: #333333;
        -webkit-font-smoothing: antialiased;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      }
      /* Soft premium shadow */
      .shadow-soft {
        box-shadow: 0 8px 30px rgba(0,0,0,0.04);
      }
      .mask-linear-fade {
        mask-image: linear-gradient(to right, black 85%, transparent 100%);
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.30.0",
    "lucide-react": "https://aistudiocdn.com/lucide-react@^0.555.0"
  }
}
</script>
</head>
  <body class="bg-[#FAFAFA]">
    <div id="root"></div>
  </body>
</html>
```

---

## 3. TypeScript Entry (index.tsx)

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 4. Type Definitions (types.ts)

```typescript
export enum ClothingCategory {
  TOPS = '上装',
  BOTTOMS = '下装',
  OUTERWEAR = '外套',
  SHOES = '鞋履',
  DRESSES = '连衣裙',
  ACCESSORIES = '配饰',
}

export enum AppView {
  HOME = 'HOME',
  WARDROBE = 'WARDROBE',
  ADD = 'ADD',
  FAIR_PRICE = 'FAIR_PRICE',
  INSPIRATION = 'INSPIRATION',
  SETTINGS = 'SETTINGS',
}

export interface Box2D {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface ClothingItem {
  id: string;
  imageUrl: string; // Base64
  category: ClothingCategory;
  name: string;
  color: string;
  material: string;
  price: number; // 入手价格
  wearCount: number; // 穿着次数
  createdAt: number;
  box2d?: Box2D;
  isDeleted?: boolean; // For Recycle Bin
  deletedAt?: number;
  isWishlist?: boolean; // For Wishlist
}

export interface FairPriceResult {
  material: string;
  base_cost: number;
  fair_price_range: string;
  haggle_tip: string;
  is_rip_off?: boolean; // Component warning flag
}
```

---

## 5. Storage Service (services/storage.ts)

```typescript
import { ClothingItem } from '../types';

const DB_NAME = 'AI_Wardrobe_DB';
const STORE_NAME = 'clothing_items';
const DB_VERSION = 1;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Database error');

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve();
  });
};

export const saveItem = (item: ClothingItem): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      // Ensure defaults
      if (item.isDeleted === undefined) item.isDeleted = false;
      if (item.isWishlist === undefined) item.isWishlist = false;
      
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject('Save failed');
    };
  });
};

export const getAllItems = (): Promise<ClothingItem[]> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const items = getAllReq.result as ClothingItem[];
        items.sort((a, b) => b.createdAt - a.createdAt);
        resolve(items);
      };
      getAllReq.onerror = () => reject('Get all failed');
    };
  });
};

export const softDeleteItem = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                const item = getReq.result as ClothingItem;
                if(item) {
                    item.isDeleted = true;
                    item.deletedAt = Date.now();
                    store.put(item);
                }
                resolve();
            };
        };
    });
};

export const restoreItem = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                const item = getReq.result as ClothingItem;
                if(item) {
                    item.isDeleted = false;
                    item.deletedAt = undefined;
                    store.put(item);
                }
                resolve();
            };
        };
    });
};

export const permanentDeleteItem = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
    };
  });
};

export const updateItemWearCount = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);
        
        getReq.onsuccess = () => {
            const item = getReq.result as ClothingItem;
            if(item) {
                item.wearCount = (item.wearCount || 0) + 1;
                store.put(item);
            }
            resolve();
        }
        tx.onerror = () => reject('Update failed');
      };
    });
  };

export const toggleWishlist = (id: string, isWishlist: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                const item = getReq.result as ClothingItem;
                if(item) {
                    item.isWishlist = isWishlist;
                    // If moving to wishlist, ensure it's not deleted and vice versa logic if needed
                    store.put(item);
                }
                resolve();
            };
        };
    });
};
```

---

## 6. AI Service (services/geminiService.ts)

```typescript
import { GoogleGenAI, Type } from '@google/genai';
import { Box2D, ClothingCategory, FairPriceResult, ClothingItem } from '../types';

const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const cleanBase64 = (b64: string) => {
    if (b64.includes(',')) return b64.split(',')[1];
    return b64;
};

export const detectAndCrop = async (base64Image: string): Promise<{
    box2d: Box2D, 
    name: string, 
    category: ClothingCategory,
    color: string,
    material: string
}[]> => {
  try {
    const ai = getClient();
    // Prompt optimized for extraction
    const prompt = `Analyze this outfit photo. Detect INDIVIDUAL clothing items (Outerwear, Tops, Bottoms, Shoes, Bags, Accessories, Jewelry).
    
    For EACH item:
    1. Return a TIGHT bounding box [ymin, xmin, ymax, xmax] (0-1000). The box must strictly enclose the visible garment.
    2. Name it (e.g., "棕色皮衣", "蓝色牛仔裤").
    3. Categorize it ("上装", "下装", "外套", "鞋履", "连衣裙", "配饰").
    4. Identify color and material.
    
    Ignore skin, background, or body parts where possible. Focus on the garment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [
              { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(base64Image) } },
              { text: prompt }
          ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    color: { type: Type.STRING },
                    material: { type: Type.STRING },
                    box_2d: {
                        type: Type.ARRAY,
                        items: { type: Type.INTEGER } // [ymin, xmin, ymax, xmax]
                    }
                }
            }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    
    return data.map((item: any) => ({
        name: item.name,
        category: item.category as ClothingCategory,
        color: item.color,
        material: item.material,
        box2d: {
            ymin: item.box_2d[0],
            xmin: item.box_2d[1],
            ymax: item.box_2d[2],
            xmax: item.box_2d[3],
        }
    }));

  } catch (error) {
    console.error("Gemini Detection Error:", error);
    throw error;
  }
};

export const generateProductShot = async (croppedImageBase64: string, itemDescription: string): Promise<string> => {
    try {
        const ai = getClient();
        // Updated Prompt for Nano Banana (gemini-2.5-flash-image)
        // Emphasizing "Pixel-Level Precise Cutout" and "Clean Edges"
        const prompt = `Task: Generate a high-fidelity, stand-alone e-commerce product shot of the ${itemDescription}.
        
        CRITICAL REQUIREMENTS:
        1. **Solid White Background**: The background must be pure hex #FFFFFF.
        2. **Pixel-Perfect Isolation**: The item must be cleanly separated from the original background. No artifacts, no blurry edges.
        3. **Remove Distractions**: Remove all human skin, hands, body parts, and hangers. The item should look like it's floating or on a ghost mannequin.
        4. **High Definition**: Sharp details, texture, and studio lighting.
        5. **Respect Original**: Maintain the original color, texture, and shape of the item exactly.
        
        Output: A single square image of the item.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Nano Banana
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: cleanBase64(croppedImageBase64) } },
                    { text: prompt }
                ]
            }
        });

        // Loop to find image part
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        
        // Fallback if no image generated (rare)
        return croppedImageBase64;

    } catch (error) {
        console.warn("Product Shot Generation Failed, using crop:", error);
        return croppedImageBase64;
    }
};

export const analyzeFairPrice = async (
  tagImage: string | null,
  garmentImage: string,
  location: string
): Promise<FairPriceResult> => {
  try {
    const ai = getClient();
    const parts: any[] = [
        { text: `你是一位专业的服装买手。请分析这件衣服在"${location}"的合理入手价格 (CNY)。
        
        严格规则:
        1. 如果提供了水洗标图片，必须严格读取上面的材质成分（如"100% 聚酯纤维"），严禁瞎编。
        2. 如果没有水洗标，根据衣服全貌图预估材质和工艺。
        3. 计算公式参考：基础成本 * 渠道倍率。
        4. 检测是否是高溢价的"智商税"面料（例如聚酯纤维、腈纶、人造棉卖高价）。如果是，设置 is_rip_off 为 true。
        5. 提供一句中文砍价话术 (haggle_tip)。
        
        输出 JSON.` }
    ];

    parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64(garmentImage) } });
    if (tagImage) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64(tagImage) } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                material: { type: Type.STRING },
                base_cost: { type: Type.NUMBER },
                fair_price_range: { type: Type.STRING, description: "e.g. '150-200'" },
                haggle_tip: { type: Type.STRING },
                is_rip_off: { type: Type.BOOLEAN, description: "True if synthetic fabric is priced too high" }
            }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Price Analysis Error:", error);
    throw error;
  }
};

export const getDailyRecommendation = async (
    items: ClothingItem[], 
    weather: string
): Promise<{ suggestion: string }> => {
    try {
        const ai = getClient();
        if (items.length === 0) return { suggestion: "衣橱还是空的，快去录入你的第一件单品吧！" };

        // Filter out deleted items just in case
        const activeItems = items.filter(i => !i.isDeleted);
        if (activeItems.length === 0) return { suggestion: "衣橱里没有可穿的衣服哦。" };

        const itemSummary = activeItems.slice(0, 30).map(i => `${i.category}: ${i.name}`).join(', ');
        
        const prompt = `Role: Personal Stylist Assistant.
        Context: User's Wardrobe: [${itemSummary}].
        Environment: Weather is "${weather}".
        
        Task: Suggest a specific outfit combination from the wardrobe for tomorrow. 
        Tone: Warm, encouraging, concise (max 2 sentences). Chinese language.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { text: prompt },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING }
                    }
                }
            }
        });

        return JSON.parse(response.text || '{"suggestion": "明天天气不错，穿得舒适一点吧！"}');
    } catch (error) {
        console.error("Gemini Recommendation Error:", error);
        return { suggestion: "今天不如试试经典的黑白搭配？" };
    }
}
```

---

## 7. App Component (App.tsx)

```tsx
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
```

---

## 8. Magic Entry Component (components/MagicEntry.tsx)

```tsx
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
```

---

## 9. NavBar Component (components/NavBar.tsx)

```tsx
import React from 'react';
import { Home, Shirt, Plus, ScanLine, User } from 'lucide-react';
import { AppView } from '../types';

interface NavBarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  const navItem = (view: AppView, icon: React.ReactNode, label: string, isMain = false) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setView(view)}
        className={`flex flex-col items-center justify-center transition-all duration-300 group ${
          isMain ? '-mt-10' : ''
        }`}
      >
        <div
          className={`${
            isMain
              ? 'w-16 h-16 bg-[#e08e79] text-white rounded-full shadow-lg shadow-[#e08e79]/40 flex items-center justify-center transform active:scale-95 transition-transform duration-300 ring-4 ring-[#FAFAFA]'
              : isActive
              ? 'text-[#e08e79] transform -translate-y-1'
              : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          {icon}
        </div>
      </button>
    );
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/50 h-[80px] z-50 flex justify-between items-center px-8 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
      {navItem(AppView.HOME, <Home size={22} strokeWidth={isActive => isActive ? 2.5 : 2} />, '首页')}
      {navItem(AppView.WARDROBE, <Shirt size={22} strokeWidth={isActive => isActive ? 2.5 : 2} />, '衣橱')}
      {navItem(AppView.ADD, <Plus size={32} strokeWidth={2.5} />, '录入', true)}
      {navItem(AppView.FAIR_PRICE, <ScanLine size={22} strokeWidth={isActive => isActive ? 2.5 : 2} />, '识价')}
      {navItem(AppView.SETTINGS, <User size={22} strokeWidth={isActive => isActive ? 2.5 : 2} />, '我的')}
    </div>
  );
};

export default NavBar;
```

---

## 10. Wardrobe Component (components/Wardrobe.tsx)

```tsx
import React, { useEffect, useState } from 'react';
import { getAllItems, softDeleteItem, restoreItem, permanentDeleteItem, toggleWishlist } from '../services/storage';
import { ClothingItem, ClothingCategory } from '../types';
import { Grid, Layers, Trash2, Flame, Save, X, RotateCcw, Heart, PieChart, Info } from 'lucide-react';

const Wardrobe: React.FC = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [viewMode, setViewMode] = useState<'GRID' | 'CANVAS'>('GRID');
  const [tab, setTab] = useState<'WARDROBE' | 'WISHLIST' | 'BIN'>('WARDROBE');
  const [filter, setFilter] = useState<string>('ALL');
  const [zoomedItem, setZoomedItem] = useState<ClothingItem | null>(null);
  const [showStats, setShowStats] = useState(false);
  
  // Canvas State
  const [canvasItems, setCanvasItems] = useState<{id: string, item: ClothingItem, x: number, y: number, z: number}[]>([]);
  const [draggedItem, setDraggedItem] = useState<ClothingItem | null>(null);
  const [draggedCanvasIndex, setDraggedCanvasIndex] = useState<number | null>(null);

  useEffect(() => {
    loadItems();
  }, [tab]);

  const loadItems = async () => {
    const data = await getAllItems();
    // Filter based on tab
    if (tab === 'WARDROBE') {
        setItems(data.filter(i => !i.isDeleted && !i.isWishlist));
    } else if (tab === 'WISHLIST') {
        setItems(data.filter(i => !i.isDeleted && i.isWishlist));
    } else if (tab === 'BIN') {
        setItems(data.filter(i => i.isDeleted));
    }
  };

  const handleAction = async (e: React.MouseEvent, id: string, action: 'DELETE' | 'RESTORE' | 'PERMANENT' | 'TO_WISHLIST' | 'TO_WARDROBE') => {
    e.stopPropagation();
    if (action === 'DELETE') {
        if(confirm('移入回收站? (30天后自动清除)')) await softDeleteItem(id);
    } else if (action === 'RESTORE') {
        await restoreItem(id);
    } else if (action === 'PERMANENT') {
        if(confirm('彻底删除? 无法恢复!')) await permanentDeleteItem(id);
    } else if (action === 'TO_WISHLIST') {
        await toggleWishlist(id, true);
    } else if (action === 'TO_WARDROBE') {
        await toggleWishlist(id, false);
    }
    loadItems();
  };

  const getFilteredItems = () => {
    if (filter === 'ALL') return items;
    return items.filter(i => i.category === filter);
  };

  const calculateCPW = (price: number, count: number) => {
    if (price === 0) return 0;
    return Math.round(price / (count + 1));
  };

  // --- Drag & Drop Logic (Same as before) ---
  const handleSidebarDragStart = (e: React.DragEvent, item: ClothingItem) => {
      setDraggedItem(item);
      setDraggedCanvasIndex(null);
      e.dataTransfer.effectAllowed = "copy";
  };
  const handleCanvasDragStart = (e: React.DragEvent, index: number) => {
      setDraggedCanvasIndex(index);
      setDraggedItem(null);
      e.dataTransfer.effectAllowed = "move";
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      e.dataTransfer.setData("offset", JSON.stringify({ x: e.clientX - rect.left, y: e.clientY - rect.top }));
  };
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let x = e.clientX - canvasRect.left;
      let y = e.clientY - canvasRect.top;

      if (draggedItem) {
          setCanvasItems([...canvasItems, { id: crypto.randomUUID(), item: draggedItem, x: x - 50, y: y - 50, z: canvasItems.length + 1 }]);
      } else if (draggedCanvasIndex !== null) {
          const offset = JSON.parse(e.dataTransfer.getData("offset") || '{"x":50,"y":50}');
          const newItems = [...canvasItems];
          newItems[draggedCanvasIndex] = { ...newItems[draggedCanvasIndex], x: x - offset.x, y: y - offset.y, z: Math.max(...canvasItems.map(i => i.z), 0) + 1 };
          setCanvasItems(newItems);
      }
      setDraggedItem(null);
      setDraggedCanvasIndex(null);
  };
  const removeFromCanvas = (index: number) => {
      const newItems = [...canvasItems];
      newItems.splice(index, 1);
      setCanvasItems(newItems);
  };

  // Stats Components
  const StatsModal = () => {
      // Simple aggregation
      const catCount: Record<string, number> = {};
      items.forEach(i => catCount[i.category] = (catCount[i.category] || 0) + 1);
      const total = items.length;
      
      return (
          <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowStats(false)}>
              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-[#333333]">衣橱数据透视</h2>
                      <button onClick={() => setShowStats(false)} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
                  </div>
                  
                  {/* Simple Bar Chart Visualization */}
                  <div className="space-y-4">
                      {Object.keys(catCount).map(cat => (
                          <div key={cat}>
                              <div className="flex justify-between text-xs mb-1 text-gray-500">
                                  <span>{cat}</span>
                                  <span>{catCount[cat]}件 ({Math.round(catCount[cat]/total*100)}%)</span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#e08e79] rounded-full" 
                                    style={{ width: `${(catCount[cat]/total)*100}%` }}
                                  />
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                      <p className="text-sm text-gray-400">主要颜色分布: 黑色 (Mock Data)</p>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="h-screen bg-[#FAFAFA] flex flex-col">
        {/* Header */}
        <div className="pt-8 px-6 bg-[#FAFAFA]/95 backdrop-blur-sm sticky top-0 z-30 flex-none">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-light text-[#333333]">
                    {tab === 'WARDROBE' ? '我的衣橱' : tab === 'WISHLIST' ? '许愿清单' : '回收站'}
                </h1>
                <div className="flex gap-2">
                    {tab === 'WARDROBE' && (
                        <button onClick={() => setShowStats(true)} className="p-3 bg-white rounded-xl text-gray-400 hover:text-[#e08e79] shadow-sm">
                            <PieChart size={18} />
                        </button>
                    )}
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-50">
                        <button onClick={() => setViewMode('GRID')} className={`p-3 rounded-xl transition-all ${viewMode === 'GRID' ? 'bg-[#333333] text-white shadow-lg' : 'text-gray-300'}`}><Grid size={18} /></button>
                        <button onClick={() => setViewMode('CANVAS')} className={`p-3 rounded-xl transition-all ${viewMode === 'CANVAS' ? 'bg-[#333333] text-white shadow-lg' : 'text-gray-300'}`}><Layers size={18} /></button>
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-4 mb-4 border-b border-gray-100 pb-2">
                <button onClick={() => setTab('WARDROBE')} className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${tab === 'WARDROBE' ? 'text-[#e08e79] border-[#e08e79]' : 'text-gray-300 border-transparent'}`}>Items</button>
                <button onClick={() => setTab('WISHLIST')} className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${tab === 'WISHLIST' ? 'text-[#e08e79] border-[#e08e79]' : 'text-gray-300 border-transparent'}`}>Wishlist</button>
                <button onClick={() => setTab('BIN')} className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${tab === 'BIN' ? 'text-[#e08e79] border-[#e08e79]' : 'text-gray-300 border-transparent'}`}>Trash</button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mask-linear-fade">
                <button onClick={() => setFilter('ALL')} className={`whitespace-nowrap px-5 py-1.5 rounded-full text-[10px] font-bold tracking-wide border ${filter === 'ALL' ? 'bg-[#333333] text-white' : 'border-gray-200 text-gray-400'}`}>全部</button>
                {Object.values(ClothingCategory).map(cat => (
                     <button key={cat} onClick={() => setFilter(cat)} className={`whitespace-nowrap px-5 py-1.5 rounded-full text-[10px] font-bold tracking-wide border ${filter === cat ? 'bg-[#333333] text-white' : 'border-gray-200 text-gray-400'}`}>{cat}</button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
            {viewMode === 'GRID' ? (
                <div className="h-full overflow-y-auto px-6 pb-32">
                    <div className="columns-2 gap-4 space-y-4">
                        {getFilteredItems().map(item => {
                            const cpw = calculateCPW(item.price, item.wearCount);
                            const isHot = cpw < 50 && item.wearCount > 5;
                            return (
                                <div key={item.id} className="break-inside-avoid relative group transition-transform hover:-translate-y-1 duration-500 cursor-pointer" onClick={() => setZoomedItem(item)}>
                                    <div className="relative rounded-[1.5rem] bg-white shadow-soft overflow-hidden mb-2 aspect-[4/5] flex items-center justify-center p-4">
                                        <img src={item.imageUrl} className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110 ${tab === 'BIN' ? 'grayscale opacity-50' : ''}`} loading="lazy" />
                                        
                                        {/* Corner Badges */}
                                        {isHot && tab === 'WARDROBE' && (
                                            <div className="absolute top-3 right-3 text-[#e08e79] bg-white/80 backdrop-blur rounded-full p-1.5 shadow-sm"><Flame size={12} fill="currentColor" /></div>
                                        )}

                                        {/* Hover Actions */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                                            {tab === 'WARDROBE' && (
                                                <>
                                                    <button onClick={(e) => handleAction(e, item.id, 'DELETE')} className="p-2 bg-white/90 rounded-full text-red-400 hover:scale-110 shadow-sm"><Trash2 size={14} /></button>
                                                    <button onClick={(e) => handleAction(e, item.id, 'TO_WISHLIST')} className="p-2 bg-white/90 rounded-full text-gray-400 hover:text-pink-400 hover:scale-110 shadow-sm"><Heart size={14} /></button>
                                                </>
                                            )}
                                            {tab === 'WISHLIST' && (
                                                <>
                                                    <button onClick={(e) => handleAction(e, item.id, 'TO_WARDROBE')} className="p-2 bg-white/90 rounded-full text-green-500 hover:scale-110 shadow-sm"><Save size={14} /></button>
                                                    <button onClick={(e) => handleAction(e, item.id, 'DELETE')} className="p-2 bg-white/90 rounded-full text-red-400 hover:scale-110 shadow-sm"><Trash2 size={14} /></button>
                                                </>
                                            )}
                                            {tab === 'BIN' && (
                                                <>
                                                    <button onClick={(e) => handleAction(e, item.id, 'RESTORE')} className="p-2 bg-white/90 rounded-full text-green-500 hover:scale-110 shadow-sm"><RotateCcw size={14} /></button>
                                                    <button onClick={(e) => handleAction(e, item.id, 'PERMANENT')} className="p-2 bg-white/90 rounded-full text-red-600 hover:scale-110 shadow-sm"><X size={14} /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <div className="text-xs font-bold text-[#333333] truncate">{item.name}</div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                                            {item.price > 0 && <span className="text-[10px] text-gray-300">¥{item.price}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col pb-24">
                    {/* Canvas Area */}
                    <div className="flex-1 px-4 relative mb-4">
                        <div 
                            className="w-full h-full bg-white rounded-[2.5rem] shadow-soft relative overflow-hidden border border-gray-100"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>
                             {canvasItems.length === 0 && (
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-200 text-center pointer-events-none">
                                     <div className="text-4xl font-light tracking-[0.2em] uppercase mb-2">Canvas</div>
                                     <div className="text-xs">Drag items here</div>
                                 </div>
                             )}
                             {canvasItems.map((ci, idx) => (
                                 <div key={ci.id} draggable onDragStart={(e) => handleCanvasDragStart(e, idx)} style={{ left: ci.x, top: ci.y, zIndex: ci.z }} className="absolute w-40 cursor-move group">
                                     <button onClick={() => removeFromCanvas(idx)} className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md"><X size={10} /></button>
                                     <img src={ci.item.imageUrl} className="w-full h-auto mix-blend-multiply drop-shadow-xl select-none pointer-events-none" />
                                 </div>
                             ))}
                        </div>
                    </div>
                    {/* Sidebar */}
                    <div className="h-24 flex-none px-4">
                        <div className="h-full overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                            {getFilteredItems().map(item => (
                                <div key={item.id} draggable onDragStart={(e) => handleSidebarDragStart(e, item)} className="inline-block w-20 h-20 bg-white rounded-2xl mr-3 shadow-sm border border-gray-100 overflow-hidden relative cursor-grab active:cursor-grabbing hover:border-[#e08e79] transition-colors">
                                    <img src={item.imageUrl} className="w-full h-full object-contain p-2 mix-blend-multiply pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Modal */}
            {showStats && <StatsModal />}

            {/* Zoom Modal */}
            {zoomedItem && (
                 <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in-up" onClick={() => setZoomedItem(null)}>
                     <div className="relative w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="aspect-[3/4] flex items-center justify-center mb-6">
                            <img src={zoomedItem.imageUrl} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-light text-[#333333] mb-2">{zoomedItem.name}</h2>
                            <span className="px-4 py-1 bg-gray-100 rounded-full text-xs text-gray-500 uppercase tracking-wider">{zoomedItem.category}</span>
                            <div className="mt-6 grid grid-cols-2 gap-4 text-left border-t border-gray-100 pt-6">
                                <div>
                                    <span className="text-[10px] uppercase text-gray-300 font-bold block mb-1">Material</span>
                                    <span className="text-sm text-gray-600">{zoomedItem.material || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-gray-300 font-bold block mb-1">Cost Per Wear</span>
                                    <span className="text-sm text-gray-600">¥{calculateCPW(zoomedItem.price, zoomedItem.wearCount)}</span>
                                </div>
                            </div>
                        </div>
                        <button className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400" onClick={() => setZoomedItem(null)}><X size={20}/></button>
                     </div>
                 </div>
             )}
        </div>
    </div>
  );
};

export default Wardrobe;
```

---

## 11. FairPriceLens Component (components/FairPriceLens.tsx)

```tsx
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
```

---

## 12. ShuffleStudio Component (components/ShuffleStudio.tsx)

```tsx
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
```

---

## 13. Settings Component (components/Settings.tsx)

```tsx
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
```
