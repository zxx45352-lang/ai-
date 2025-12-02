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