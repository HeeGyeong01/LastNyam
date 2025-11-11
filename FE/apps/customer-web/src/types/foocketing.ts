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

// 푸켓팅 메뉴 (리스트용)
export interface FoocketingMenu {
  name: string;
  price: number;
  photoUrl: string;
}

// 푸켓팅 메뉴 (상세용 - menuDescription 추가)
export interface FoocketingMenuDetail extends FoocketingMenu {
  menuDescription: string;
}

// 푸켓팅 가게
export interface FoocketingShop {
  shopId: number;
  bannerUrl: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  rating: number;
  ratingCount: number;
}

// 각각의 푸켓팅 아이템
export interface FoocketingItem {
  foocketingId: number;
  openTime: string;
  menu: FoocketingMenu;
  shop: FoocketingShop;
}

// API 응답의 data(푸켓팅 목록) 부분
export interface FoocketingListData {
  content: FoocketingItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

// 전체 API 응답 (ApiResponseWrapper 사용)
export type FoocketingListResponse = FoocketingListData;

// 푸켓팅 상세 조회 응답
// FoocketingItem을 상속받되, menu 타입만 FoocketingMenuDetail로 변경하고 추가 필드 포함
export interface FoocketingDetail extends Omit<FoocketingItem, 'menu'> {
  maxAvailable: number;
  currentViewing: number;
  menu: FoocketingMenuDetail;
}

// 푸켓팅 참여 응답
export interface FoocketingEntryResponse {
  success: boolean;
  entryId: number;
  message: string;
}

// 푸켓팅 결과
export interface FoocketingResult {
  foocketingId: number;
  userId: number;
  isWinner: boolean;
  entryTime: string;
  resultTime?: string;
  message: string;
}

