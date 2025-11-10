// 사용자 관련 타입 (응답)
export interface User {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  profileImageUrl?: string;
  address?: string;
  createdAt: string;
}

export interface UserStats {
  totalOrders: number;
  totalSavings: number;
  foocketingWins: number;
  reviewCount: number;
}

export interface UserProfile extends User {
  stats: UserStats;
}

export interface Review {
  reviewId: number;
  shopId: number;
  shopName: string;
  orderId: number;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
}

