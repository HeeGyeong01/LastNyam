// 마이페이지 관련 타입

/**
 * 사용자 정보 조회 응답 타입
 */
export interface UserInfo {
  userId: number;
  email: string;
  nickname: string;
  profileImage: string;
  role: 'USER' | 'ADMIN';
}

