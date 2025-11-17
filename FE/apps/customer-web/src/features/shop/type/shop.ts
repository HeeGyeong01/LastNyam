// ShopDetail의 discount 타입
export interface ShopDetailDiscount {
  discountId: number;
  menuName: string;
  originalPrice: number;
  discountRate: number;
  price: number; // 할인된 가격
  menuImage: string;
  menuDescription: string;
  stock: number;
}

// ShopDetail의 foocketing 타입
export interface ShopDetailFoocketing {
  foocketingId: number;
  openTime: string; // ISO 8601 형식 (예: "2025-11-12T16:00:00")
  menuName: string;
  menuImage: string;
  originalPrice: number;
  price: number;
}

// 가게 관련 타입
export interface ShopDetail {
  shopId: number;
  shopName: string;
  shopLat: number;
  shopLng: number;
  shopAddress: string;
  shopDescription: string;
  shopBanner: string;
  shopCloses: string; // "21:00:00" 형식
  shopPickupEndTime: string; // "20:00:00" 형식
  categoryId: number;
  ownerId: number;
  rating: number;
  ratingCount: number;
  distanceMeters: number;
  favorited?: boolean; // 찜하기 여부 (선택적)
  discounts: ShopDetailDiscount[];
  foocketings: ShopDetailFoocketing[];
}

// export interface Shop {
//   shopId: number;
//   shopName: string;
//   category: string;
//   imageUrl: string;
//   rating: number;
//   distance?: number;
//   address: string;
// }


