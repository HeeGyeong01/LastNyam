const DEFAULT_OWNER_API_BASE_URL = 'https://k13a101.p.ssafy.io';
const OWNER_API_BASE_URL =
  import.meta.env.VITE_OWNER_API_BASE_URL ?? DEFAULT_OWNER_API_BASE_URL;

export interface Foocketing {
  foocketingId: number;
  foocketingTime: string;
  foocketingAmount: number;
  foocketingCloseTime: string;
  foocketingPickupEndTime: string;
  menuId: number;
  menuName: string;
  menuPrice: number;
  menuImage: string;
}

export interface GetFoocketingsResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  code?: number;
  data?: {
    foocketings?: Foocketing[];
  };
}

export interface CreateFoocketingRequest {
  foocketingTime: string; // "HH:mm:ss" 형식
  foocketingAmount: number;
  menuId: number;
}

export interface CreateFoocketingResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  code?: number;
  data?: {
    foocketingId?: number;
  };
}

export const foocketingApi = {
  // 푸켓팅 목록 조회
  getFoocketings: async (
    ownerId: number,
    shopId: number,
    accessToken: string
  ): Promise<GetFoocketingsResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/${ownerId}/shop/${shopId}/foocketing`;

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
      .catch(() => null)) as GetFoocketingsResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '푸켓팅 목록 조회에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }

    return responseBody;
  },

  // 푸켓팅 추가
  createFoocketing: async (
    ownerId: number,
    shopId: number,
    data: CreateFoocketingRequest,
    accessToken: string
  ): Promise<CreateFoocketingResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/${ownerId}/shop/${shopId}/foocketing`;

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
      .catch(() => null)) as CreateFoocketingResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '푸켓팅 등록에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }

    return responseBody;
  },
};

