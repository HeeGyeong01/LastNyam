// 푸켓팅 조회
// 1. 베이커리 2. 회/초밥 3. 김밥/분식 4. 샐러드/포케 5. 기타
export type FoocketingCategory = 
  | 1
  | 2 
  | 3
  | 4
  | 5;

// 마감순, 거리순, 정가순
export type FoocketingSortType = 'IMMINENT' | 'CLOSEST' | 'PRICE' ;

// 푸켓팅 메뉴 (리스트용)
export interface FoocketingMenu {
  name: string;
  description: string | null;
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
  bannerUrl: string | null;
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
  hasParticipated: boolean;
  currentViewing: number;
  menu: FoocketingMenuDetail;
}



//////////////////////////////////////////////////////////////
// 푸켓팅 참여, 결과 조회

// 푸켓팅 참여 응답
export interface FoocketingEntryResponse {
  success: boolean;
}

// 푸켓팅 결과 조회 - 성공 시 shopInfo
export interface FoocketingResultShopInfo {
  shopId: number;
  salesMenu: string[];
  bannerUrl: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  rating: number;
  ratingCount: number;
}

// 푸켓팅 결과 조회 - 성공 시
export interface FoocketingResultSuccess {
  success: true;
  rank: number;
  shopInfo: FoocketingResultShopInfo;
}

// 푸켓팅 결과 조회 - 실패 시
export interface FoocketingResultFailure {
  success: false;
  rank: number;
  otherFoocketingsOfShop: FoocketingItem[];
  recommendedFoocketings: FoocketingItem[];
}

// 푸켓팅 참여 결과 (성공/실패 union type)
export type FoocketingResult = FoocketingResultSuccess | FoocketingResultFailure;



//////////////////////////////////////////////////////////////
// 푸켓팅 검색

// 푸켓팅 검색용 가게 정보 (shopId, bannerUrl 없음)
export interface FoocketingSearchShop {
  name: string;
  lat: number;
  lng: number;
  distance: number;
  rating: number;
  ratingCount: number;
}

// 푸켓팅 검색 결과 아이템
export interface FoocketingSearchItem {
  foocketingId: number;
  openTime: string;
  menu: FoocketingMenu;
  shop: FoocketingSearchShop;
}

// 푸켓팅 검색 결과 데이터 (커서 기반 페이지네이션)
export interface FoocketingSearchData {
  content: FoocketingSearchItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}


//////////////////////////////////////////////////////////////
// 푸켓팅 추천 목록

// 푸켓팅 추천 아이템
export interface RecommendedFoocketingItem {
  foocketing: FoocketingItem;
  visitedShop: boolean;
  purchasedMenu: boolean;
}

// 푸켓팅 추천 목록 데이터
export type RecommendedFoocketingListData = RecommendedFoocketingItem[];

