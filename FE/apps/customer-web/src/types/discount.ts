// 마감세일 관련 타입
export type DiscountCategory = 
  | '베이커리' 
  | '회/초밥' 
  | '김밥/분식' 
  | '샐러드/포케' 
  | '기타';

export type DiscountSortType = 'FAVORITES' | 'RATING' | 'CLOSEST' | 'DISCOUNT' | 'PRICE';

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

