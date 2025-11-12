/**
 * ISO 8601 형식의 시간 문자열을 "HH:mm" 형식으로 변환
 * @param timeString ISO 8601 형식의 시간 문자열 (예: "2025-11-10T14:00:00")
 * @returns "HH:mm" 형식의 시간 문자열 (예: "14:00")
 */
export function formatTimeToHHmm(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
}

/**
 * Date 객체를 "HH:mm" 형식으로 변환
 * @param date Date 객체
 * @returns "HH:mm" 형식의 시간 문자열 (예: "14:00")
 */
export function formatDateToHHmm(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
}

