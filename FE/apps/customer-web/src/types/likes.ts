// 찜하기 관련 타입
export type LikeType = 'shop' | 'foocketing' | 'discount';

export interface LikedShop {
  shopId: number;
  shopName: string;
  category: string;
  imageUrl: string;
  rating: number;
  distance?: number;
  address: string;
  likedAt: string;
}

export interface LikedFoocketing {
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

export interface LikedDiscount {
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

export interface LikesResponse {
  shops: LikedShop[];
  foocketings: LikedFoocketing[];
  discounts: LikedDiscount[];
}

