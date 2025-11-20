// 검색 관련 타입
export type SearchType = 'all' | 'shop' | 'menu' | 'foocketing';

export interface SearchShopResult {
  shopId: number;
  shopName: string;
  category: string;
  imageUrl: string;
  rating: number;
  distance?: number;
  address: string;
}

export interface SearchMenuResult {
  menuId: number;
  shopId: number;
  shopName: string;
  menuName: string;
  price: number;
  imageUrl: string;
  isDiscount: boolean;
  discountPrice?: number;
  discountRate?: number;
}

export interface SearchFoocketingResult {
  foocketingId: number;
  shopId: number;
  shopName: string;
  title: string;
  discountRate: number;
  imageUrl: string;
  deadline: string;
  status: 'active' | 'closed' | 'completed';
}

export interface SearchResponse {
  shops: SearchShopResult[];
  menus: SearchMenuResult[];
  foocketings: SearchFoocketingResult[];
  total: number;
}

export interface RecentSearch {
  keyword: string;
  searchedAt: string;
}

export interface PopularSearch {
  keyword: string;
  rank: number;
}

