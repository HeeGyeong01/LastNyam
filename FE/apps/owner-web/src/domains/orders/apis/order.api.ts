const DEFAULT_OWNER_API_BASE_URL = "https://lastnyam.co.kr";
const OWNER_API_BASE_URL =
  import.meta.env.VITE_OWNER_API_BASE_URL ?? DEFAULT_OWNER_API_BASE_URL;

export type TransactionStatus =
  | "PENDING_APPROVAL"
  | "REJECTED"
  | "PREPARING_FOOD"
  | "WAITING_PICKUP"
  | "COMPLETED_PICKUP"
  | "NO_SHOW";

export type TransactionType = "DISCOUNT" | "FOOCKETING";

interface TransactionItemDto {
  menuName: string;
  menuPrice?: number;
  amount?: number;
  subtotal?: number;
}

export interface TransactionDto {
  transactionId: number | string;
  transactionStatus: TransactionStatus;
  createdAt: string;
  transactionType: TransactionType;
  itemDtos: TransactionItemDto[];
  totalAmount?: number;
}

export interface TransactionsResponse {
  data?: {
    transactions?: TransactionDto[];
  };
  status: string;
  code?: number;
  message?: string;
}

export interface UpdateOrderStatusRequest {
  transactionType: TransactionType;
  status: TransactionStatus;
}

export interface UpdateOrderStatusResponse {
  data?: {
    transactionId: number;
    status: TransactionStatus;
    transactionType: TransactionType;
  };
  status: string;
  code?: number;
  message?: string;
}

export interface DiscountItem {
  transactionItemId: number;
  transactionAmount: number;
  discountId: number;
  discountRate: number;
  discountPrice: number;
  menuId: number;
  menuName: string;
  menuPrice: number;
  menuImage: string;
}

export interface FoocketingDetail {
  foocketingId: number;
  foocketingTime: string;
  foocketingAmount: number;
  menuId: number;
  menuName: string;
  menuPrice: number;
  menuImage: string;
}

export interface TransactionDetailResponse {
  data?: {
    transactionId: number;
    transactionStatus: TransactionStatus;
    transactionQrImage: string;
    createdAt: string;
    transactionType: TransactionType;
    userId: number;
    userNickname: string;
    userProfile: string;
    shopId: number;
    shopName: string;
    shopAddress: string;
    discountItems: DiscountItem[] | null;
    foocketingDetail: FoocketingDetail | null;
  };
  status: string;
  code?: number;
  message?: string;
}

const sanitizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, "");

export const orderApi = {
  async getTransactions(
    ownerId: number,
    shopId: number,
    accessToken: string,
  ): Promise<TransactionsResponse> {
    const url = `${sanitizeBaseUrl(
      OWNER_API_BASE_URL,
    )}/api/owner/${ownerId}/shop/${shopId}/transaction`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    const body = (await response
      .json()
      .catch(() => null)) as TransactionsResponse | null;

    if (!response.ok || body?.status !== "SUCCESS") {
      throw new Error(
        body?.message ?? "주문 목록을 불러오는 중 문제가 발생했습니다.",
      );
    }

    return body;
  },

  async updateOrderStatus(
    ownerId: number,
    transactionId: number | string,
    requestData: UpdateOrderStatusRequest,
    accessToken: string,
  ): Promise<UpdateOrderStatusResponse> {
    const url = `${sanitizeBaseUrl(
      OWNER_API_BASE_URL,
    )}/api/owner/${ownerId}/transaction/${transactionId}/status`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(requestData),
    });

    const body = (await response
      .json()
      .catch(() => null)) as UpdateOrderStatusResponse | null;

    if (!response.ok || body?.status !== "SUCCESS") {
      throw new Error(
        body?.message ?? "주문 상태를 변경하는 중 문제가 발생했습니다.",
      );
    }

    return body;
  },

  async getTransactionDetail(
    ownerId: number,
    transactionId: number,
    transactionType: TransactionType,
    accessToken: string,
  ): Promise<TransactionDetailResponse> {
    const url = `${sanitizeBaseUrl(
      OWNER_API_BASE_URL,
    )}/api/owner/${ownerId}/transaction/${transactionId}?type=${transactionType}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    const body = (await response
      .json()
      .catch(() => null)) as TransactionDetailResponse | null;

    if (!response.ok || body?.status !== "SUCCESS") {
      throw new Error(
        body?.message ?? "거래 상세 정보를 불러오는 중 문제가 발생했습니다.",
      );
    }

    return body;
  },
};


