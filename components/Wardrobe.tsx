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