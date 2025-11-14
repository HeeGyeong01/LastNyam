// 인증 관련 타입 (응답)
export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: {
    userId: number;
    email: string;
    name: string;
    nickname: string;
  };
}

export interface KakaoAuthResponse {
  code: string;
  state?: string;
}

export interface SignupResponse {
  success: boolean;
  userId: number;
  message: string;
}

export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
}

// 카카오 소셜 로그인 응답
export interface KakaoLoginResponse {
  token: string;
  refreshToken: string;
  isNewUser: boolean; // 신규 회원 여부
  user?: {
    userId: number;
    email: string;
    name: string;
    nickname: string;
  };
}

