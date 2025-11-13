// 주문 관련 타입
export type OrderStatus = 
  | 'pending'      // 대기중
  | 'confirmed'    // 확인됨
  | 'preparing'    // 준비중
  | 'ready'        // 준비완료
  | 'completed'    // 완료
  | 'cancelled';   // 취소됨

export interface OrderItem {
  orderItemId: number;
  menuName: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  orderId: number;
  shopId: number;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  orderDate: string;
  pickupTime?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
}

export interface OrderDetail extends Order {
  orderNumber: string;
  qrCode?: string;
  notes?: string;
}

