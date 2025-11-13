// 찜하기 관련 타입
export type FavoriteType = 'shop' | 'foocketing' | 'discount';

// 기존 찜한 가게 타입 (다른 용도로 사용될 수 있음)
export interface LikedShop {
  shopId: number;
  shopName: string;
  category: string;
  imageUrl: string;
  rating: number;
  distance: number;
  address: string;
  likedAt: string;
}

export interface FavoriteFoocketing {
  foocketingId: number;
  shopId: number;
  shopName: string;
  title: string;
  discountRate: number;
  imageUrl: string;
  deadline: string;
  status: 'active' | 'closed' | 'completed';
  likedAt: string;
}

export interface FavoriteDiscount {
  discountId: number;
  shopId: number;
  shopName: string;
  menuName: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  imageUrl: string;
  deadline: string;
  stock: number;
  likedAt: string;
}

export interface FavoriteResponse {
  shops: LikedShop[];
  foocketings: FavoriteFoocketing[];
  discounts: FavoriteDiscount[];
}

// 찜한 가게 목록 API 응답 타입
export interface FavoriteShop {
  shopId: number;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  rating: number;
  ratingCount: number;
  onSaleMenus: string[];
  bannerUrl: string;
}

// 찜한 가게 목록 데이터 (커서 기반 페이지네이션)
export interface FavoriteShopListData {
  content: FavoriteShop[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

