import { useState, useEffect, useRef, useCallback } from 'react';
import { getServerTime } from '@/features/foocketing/api/foocketing';

/**
 * 서버 시간을 동기화하여 사용하는 커스텀 훅
 * 
 * 티켓팅 수준의 정확도를 위해:
 * 1. 초기 로드 시 서버 시간을 가져와서 클라이언트 시간과의 오프셋을 계산
 * 2. 클라이언트 시간 + 오프셋으로 실시간 카운팅
 * 3. 주기적으로(30초마다) 서버 시간을 다시 가져와서 오프셋 갱신
 * 
 * @param syncInterval 서버 시간 동기화 주기 (밀리초, 기본값: 30000ms = 30초)
 * @returns 동기화된 서버 시간 (Date 객체)
 */
export function useServerTime(syncInterval: number = 30000) {
  const [serverTime, setServerTime] = useState<Date>(new Date());
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const offsetRef = useRef<number>(0); // 클라이언트 시간과 서버 시간의 오프셋 (밀리초)
  const syncTimerRef = useRef<number | null>(null);
  const updateTimerRef = useRef<number | null>(null);

  // 서버 시간 동기화 함수
  const syncServerTime = useCallback(async () => {
    try {
      const serverTimeString = await getServerTime();
      const serverTimeMs = new Date(serverTimeString).getTime();
      const clientTimeMs = Date.now();
      
      // 오프셋 = 서버 시간 - 클라이언트 시간
      offsetRef.current = serverTimeMs - clientTimeMs;
      
      // 즉시 서버 시간 업데이트
      setServerTime(new Date(serverTimeMs));
      
      setIsInitialized((prev) => {
        if (!prev) {
          return true;
        }
        return prev;
      });
    } catch (error) {
      console.error('서버 시간 동기화 실패:', error);
      // 실패 시 클라이언트 시간 사용 (오프셋 0)
      setIsInitialized((prev) => {
        if (!prev) {
          offsetRef.current = 0;
          setServerTime(new Date());
          return true;
        }
        return prev;
      });
    }
  }, []);

  // 초기 서버 시간 동기화
  useEffect(() => {
    syncServerTime();

    // 주기적으로 서버 시간 동기화
    syncTimerRef.current = window.setInterval(() => {
      syncServerTime();
    }, syncInterval);

    return () => {
      if (syncTimerRef.current !== null) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [syncInterval, syncServerTime]);

  // 1초마다 클라이언트 시간 + 오프셋으로 서버 시간 업데이트
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    updateTimerRef.current = window.setInterval(() => {
      const currentServerTime = new Date(Date.now() + offsetRef.current);
      setServerTime(currentServerTime);
    }, 1000);

    return () => {
      if (updateTimerRef.current !== null) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, [isInitialized]);

  return serverTime;
}

