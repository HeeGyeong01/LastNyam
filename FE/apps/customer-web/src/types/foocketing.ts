// 푸켓팅 관련 타입
export type FoocketingSortType = 'distance' | 'deadline' | 'popularity';

export interface FoocketingItem {
  foocketingId: number;
  shopId: number;
  shopName: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  imageUrl: string;
  distance?: number;
  deadline: string;
  currentParticipants: number;
  maxParticipants: number;
  status: 'active' | 'closed' | 'completed';
}

export interface FoocketingListResponse {
  items: FoocketingItem[];
  total: number;
}

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

