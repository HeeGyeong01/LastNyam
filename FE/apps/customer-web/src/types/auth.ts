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

