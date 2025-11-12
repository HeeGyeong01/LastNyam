import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
      gcTime: 1000 * 60 * 10, // 10분간 캐시 유지 (이전 cacheTime)
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페칭 비활성화
      refetchOnReconnect: true, // 네트워크 재연결 시 자동 리페칭
    },
  },
});

