// 마감세일 관련 타입
export type DiscountCategory = 
  | 'all' 
  | 'korean' 
  | 'chinese' 
  | 'japanese' 
  | 'western' 
  | 'cafe' 
  | 'etc';

export type DiscountSortType = 'distance' | 'discount' | 'deadline';

export interface DiscountItem {
  discountId: number;
  shopId: number;
  shopName: string;
  menuName: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  imageUrl: string;
  distance?: number;
  deadline: string;
  stock: number;
  category: DiscountCategory;
}

export interface DiscountListResponse {
  items: DiscountItem[];
  total: number;
}

