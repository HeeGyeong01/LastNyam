// 마감세일 관련 타입
// 1. 베이커리 2. 회/초밥 3. 김밥/분식 4. 샐러드/포케 5. 기타
export type FoocketingCategory = 
  | 1
  | 2 
  | 3
  | 4
  | 5;

// 마감순, 거리순, 정가순
export type FoocketingSortType = 'IMMINENT' | 'CLOSEST' | 'PRICE ' ;

// 실제 API 응답 구조에 맞춘 타입
export interface FoocketingMenu {
  name: string;
  price: number;
  photoUrl: string;
}

export interface FoocketingShop {
  name: string;
  lat: number;
  lng: number;
  distance: number;
  rating: number;
  ratingCount: number;
}

export interface FoocketingItem {
  foocketingId: number;
  openTime: string;
  menu: FoocketingMenu;
  shop: FoocketingShop;
}

// API 응답의 data 부분
export interface FoocketingListData {
  content: FoocketingItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

// 전체 API 응답 (ApiResponseWrapper 사용)
export type FoocketingListResponse = FoocketingListData;

export interface FoocketingDetail extends FoocketingItem {
  shopAddress: string;
  shopPhone: string;
  menuItems: Array<{
    menuId: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  }>;
  terms: string;
}

export interface FoocketingEntryResponse {
  success: boolean;
  entryId: number;
  message: string;
}

export interface FoocketingResult {
  foocketingId: number;
  userId: number;
  isWinner: boolean;
  entryTime: string;
  resultTime?: string;
  message: string;
}

