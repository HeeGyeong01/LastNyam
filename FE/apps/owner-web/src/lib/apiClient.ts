import { useOwnerStore } from '@/store/useOwnerStore';

const DEFAULT_OWNER_API_BASE_URL = 'https://k13a101.p.ssafy.io';
const OWNER_API_BASE_URL =
  import.meta.env.VITE_OWNER_API_BASE_URL ?? DEFAULT_OWNER_API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// 토큰 재발급을 기다리는 요청들을 관리
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// 토큰 재발급 API
async function refreshAccessToken(): Promise<string | null> {
  const url = `${OWNER_API_BASE_URL.replace(/\/$/, '')}/api/owner/auth/refresh`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키에서 refreshToken 자동 전송
    });

    if (!response.ok) {
      return null;
    }

    const responseBody = await response.json().catch(() => null);

    // 새로운 accessToken 가져오기
    const newAccessToken = response.headers.get('authorization') || response.headers.get('Authorization');
    
    if (newAccessToken && responseBody?.status === 'SUCCESS') {
      // 스토어에 새 토큰 저장
      useOwnerStore.getState().updateTokens(newAccessToken);
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error('토큰 재발급 실패:', error);
    return null;
  }
}

interface FetchWithAuthOptions extends RequestInit {
  skipAuth?: boolean; // 인증이 필요없는 요청인 경우
  skipRetry?: boolean; // 재시도를 하지 않을 경우
}

/**
 * 인증이 필요한 fetch 요청을 처리하는 유틸 함수
 * - 자동으로 Authorization 헤더 추가
 * - 401 에러 시 토큰 재발급 후 재시도
 */
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { skipAuth = false, skipRetry = false, headers = {}, ...restOptions } = options;

  // Authorization 헤더 추가
  const requestHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  
  if (!skipAuth) {
    const accessToken = useOwnerStore.getState().accessToken;
    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  // 첫 번째 요청
  let response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
    credentials: 'include',
  });

  // 401 에러가 아니거나, 재시도를 하지 않는 경우 그대로 반환
  if (response.status !== 401 || skipRetry || skipAuth) {
    return response;
  }

  // 401 에러 발생 - 토큰 재발급 시도
  console.log('401 에러 발생, 토큰 재발급 시도...');

  // 이미 토큰 재발급 중이면 대기
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        // 토큰 재발급 완료 후 재시도
        const retryHeaders: Record<string, string> = { ...requestHeaders };
        retryHeaders['Authorization'] = `Bearer ${token}`;
        
        fetch(url, {
          ...restOptions,
          headers: retryHeaders,
          credentials: 'include',
        }).then(resolve);
      });
    });
  }

  // 토큰 재발급 시작
  isRefreshing = true;

  const newToken = await refreshAccessToken();

  isRefreshing = false;

  if (!newToken) {
    // 토큰 재발급 실패 - 로그아웃 처리
    console.error('토큰 재발급 실패, 로그아웃 처리');
    useOwnerStore.getState().logout();
    
    // 로그인 페이지로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/owner/login';
    }
    
    return response;
  }

  // 대기 중인 요청들에게 새 토큰 전달
  onRefreshed(newToken);

  // 새 토큰으로 재시도
  const retryHeaders: Record<string, string> = { ...requestHeaders };
  retryHeaders['Authorization'] = `Bearer ${newToken}`;
  
  response = await fetch(url, {
    ...restOptions,
    headers: retryHeaders,
    credentials: 'include',
  });

  return response;
}

/**
 * JSON 응답을 자동으로 파싱하는 헬퍼 함수
 */
export async function fetchWithAuthJSON<T = any>(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options);
  
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message || `HTTP 에러! 상태: ${response.status}`
    );
  }
  
  return response.json();
}

export { OWNER_API_BASE_URL };

