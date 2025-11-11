// 마감세일 관련 타입
export type DiscountCategory = 
  | 1
  | 2  
  | 3
  | 4
  | 5;

// 찜하기순, 별점순, 거리순, 할인율순, 가격순
export type DiscountSortType = 'FAVORITES' | 'RATING' | 'CLOSEST' | 'DISCOUNT' | 'PRICE';

// 각각의 마감세일 아이템(마감세일 중인 가게)
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

// API 응답의 data(마감세일 목록) 부분
export interface DiscountListResponse {
  items: DiscountItem[];
  total: number;
}

