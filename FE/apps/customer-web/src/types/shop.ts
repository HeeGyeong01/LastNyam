// 가게 관련 타입
export interface ShopDetail {
  shopId: number;
  shopName: string;
  description: string;
  address: string;
  phone: string;
  imageUrl: string;
  category: string;
  rating: number;
  reviewCount: number;
  openTime: string;
  closeTime: string;
  discountItems: Array<{
    discountId: number;
    menuName: string;
    originalPrice: number;
    discountPrice: number;
    discountRate: number;
    imageUrl: string;
    stock: number;
    deadline: string;
  }>;
}

export interface Shop {
  shopId: number;
  shopName: string;
  category: string;
  imageUrl: string;
  rating: number;
  distance?: number;
  address: string;
}

