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
  shopPickupEndTime: string; // "20:30:00" 형식
  categoryId: number;
  ownerId: number;
  rating: number;
  ratingCount: number;
  distanceMeters: number;
  discounts: Array<{
    discountId: number;
    menuName: string;
    originalPrice: number;
    discountRate: number;
    price: number; // 할인된 가격
    menuImage: string | null;
    menuDescription: string;
    stock: number;
  }>;
  foocketings: Array<{
    foocketingId: number;
    openTime: string; // ISO 8601 형식
    menuName: string;
    originalPrice: number;
    price: number;
  }>;
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


