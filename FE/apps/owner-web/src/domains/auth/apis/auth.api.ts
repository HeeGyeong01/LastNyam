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
  code?: number;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    email?: string;
    ownerId?: number;
  };
}

export interface Shop {
  shopId: number;
  shopName: string;
  shopLat: number;
  shopLng: number;
  shopAddress: string;
  shopDescription?: string;
  shopBanner?: string;
  shopCloses?: string;
  shopPickupEndTime?: string;
  categoryName?: string;
}

export interface ShopListResponse {
  status: string;
  message: string;
  data?: {
    shops?: Shop[];
  };
}

export interface OwnerProfileResponse {
  status: string;
  message: string;
  data?: {
    ownerId?: number;
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

    // form-urlencoded 형식으로 변환
    const formData = new URLSearchParams();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include', // 쿠키를 받기 위해 필요 (refreshToken은 쿠키로 옴)
      body: formData.toString(),
    });

    const responseBody = await response.json().catch(() => null) as AuthResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.'
      );
    }

    // ✨ 백엔드에서 헤더로 토큰을 보냄
    // - accessToken: Authorization 헤더
    // - refreshToken: 쿠키 (자동 저장됨)
    const accessToken = response.headers.get('authorization') || response.headers.get('Authorization');

    // 응답 body의 data에 토큰 정보 추가
    if (accessToken) {
      if (!responseBody.data) {
        responseBody.data = {};
      }
      responseBody.data.accessToken = accessToken;
    } else {
      console.warn('⚠️ Authorization 헤더에 accessToken이 없습니다!');
      console.warn('⚠️ 브라우저가 Authorization 헤더를 차단했을 수 있습니다 (CORS)');
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

  // 프로필 조회
  getProfile: async (accessToken: string): Promise<OwnerProfileResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/auth/profile`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    const responseBody = await response.json().catch(() => null) as OwnerProfileResponse | null;

    if (!response.ok || responseBody?.status !== 'SUCCESS') {
      throw new Error(
        responseBody?.message || '프로필 조회에 실패했습니다.'
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
      credentials: 'include',
    });

    const responseBody = await response.json().catch(() => null) as ShopListResponse | null;

    // FAIL 응답도 정상적으로 반환 (404는 점주를 찾을 수 없는 경우)
    if (!response.ok && response.status !== 404) {
      throw new Error(
        responseBody?.message || '가게 목록 조회에 실패했습니다.'
      );
    }

    // 404 또는 FAIL 상태도 responseBody를 반환하여 상위에서 처리
    return responseBody || { status: 'FAIL', message: '가게 목록 조회에 실패했습니다.' };
  },
};

