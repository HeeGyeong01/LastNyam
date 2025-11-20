const DEFAULT_OWNER_API_BASE_URL = 'https://lastnyam.co.kr';
const OWNER_API_BASE_URL =
  import.meta.env.VITE_OWNER_API_BASE_URL ?? DEFAULT_OWNER_API_BASE_URL;

export interface Menu {
  menuId: number;
  menuName: string;
  menuDescription: string;
  menuImage: string;
  menuPrice: number;
  categoryName: string;
}

export interface GetMenusResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  code?: number;
  data?: {
    menus?: Menu[];
  };
}

export interface CreateMenuRequest {
  menuName: string;
  menuDescription: string;
  menuImage: string;
  menuPrice: number;
  category: string;
}

export interface CreateMenuResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  code?: number;
  data?: {
    menuId?: number;
  };
}

export interface Discount {
  discountId: number;
  discountDate: string;
  discountRate: number;
  discountPrice: number;
  discountMenuAmount: number;
  discountCloseTime: string;
  discountPickupEndTime: string;
  menuId: number;
  menuName: string;
  menuPrice: number;
  menuImage: string;
}

export interface GetDiscountsResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  code?: number;
  data?: {
    discounts?: Discount[];
  };
}

export interface CreateDiscountRequest {
  menuId: number;
  discountPrice: number;
  discountMenuAmount: number;
}

export interface CreateDiscountResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  code?: number;
  data?: {
    discountId?: number;
  };
}

export const menuApi = {
  // 메뉴 목록 조회
  getMenus: async (
    ownerId: number,
    shopId: number,
    accessToken: string
  ): Promise<GetMenusResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/${ownerId}/shop/${shopId}/menu`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    const responseBody = (await response
      .json()
      .catch(() => null)) as GetMenusResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '메뉴 목록 조회에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }

    return responseBody;
  },

  // 메뉴 생성
  createMenu: async (
    ownerId: number,
    shopId: number,
    data: CreateMenuRequest,
    accessToken: string
  ): Promise<CreateMenuResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/${ownerId}/shop/${shopId}/menu`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const responseBody = (await response
      .json()
      .catch(() => null)) as CreateMenuResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '메뉴 등록에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }

    return responseBody;
  },

  // 마감세일 목록 조회
  getDiscounts: async (
    ownerId: number,
    shopId: number,
    accessToken: string
  ): Promise<GetDiscountsResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/${ownerId}/shop/${shopId}/discount`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    const responseBody = (await response
      .json()
      .catch(() => null)) as GetDiscountsResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '마감세일 목록 조회에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }

    return responseBody;
  },

  // 마감세일 생성
  createDiscount: async (
    ownerId: number,
    shopId: number,
    data: CreateDiscountRequest,
    accessToken: string
  ): Promise<CreateDiscountResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/${ownerId}/shop/${shopId}/discount`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const responseBody = (await response
      .json()
      .catch(() => null)) as CreateDiscountResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '마감세일 등록에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }

    return responseBody;
  },
};

