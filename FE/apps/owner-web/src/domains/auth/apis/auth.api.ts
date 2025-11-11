const DEFAULT_OWNER_API_BASE_URL = 'https://k13a101.p.ssafy.io';
const OWNER_API_BASE_URL =
  import.meta.env.VITE_OWNER_API_BASE_URL ?? DEFAULT_OWNER_API_BASE_URL;

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    email?: string;
    ownerId?: number;
  };
}

export interface Shop {
  id: number;
  name: string;
  address?: string;
  phoneNumber?: string;
}

export interface ShopListResponse {
  status: string;
  message: string;
  data?: {
    shops?: Shop[];
  };
}

export const authApi = {
  // 회원가입
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/auth/register`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseBody = await response.json().catch(() => null) as AuthResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }

    return responseBody;
  },

  // 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/auth/login`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseBody = await response.json().catch(() => null) as AuthResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.'
      );
    }

    return responseBody;
  },

  // 로그아웃
  logout: async (accessToken: string): Promise<void> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/auth/logout`;
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },

  // 액세스 토큰 재발급
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/auth/refresh`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const responseBody = await response.json().catch(() => null) as AuthResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '토큰 재발급에 실패했습니다.'
      );
    }

    return responseBody;
  },

  // 가게 목록 조회
  getShops: async (ownerId: number, accessToken: string): Promise<ShopListResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/auth/${ownerId}/shop`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const responseBody = await response.json().catch(() => null) as ShopListResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '가게 목록 조회에 실패했습니다.'
      );
    }

    return responseBody;
  },
};

