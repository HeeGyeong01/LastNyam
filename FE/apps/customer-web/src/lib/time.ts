/**
 * Date 객체란?
 * JavaScript의 내장 객체로, 날짜와 시간을 나타냅니다.
 * 예: new Date() → 현재 시간, new Date("2025-11-10T14:00:00") → 특정 시간
 * Date 객체에서 .getHours(), .getMinutes(), .getFullYear() 등의 메서드로 정보를 가져올 수 있습니다.
 */

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
 * ISO 8601 형식의 시간 문자열을 날짜 형식으로 변환
 * @param timeString ISO 8601 형식의 시간 문자열 (예: "2025-11-10T14:00:00")
 * @returns 날짜 문자열 (예: "2025-11-10")
 */
export function formatISOStringToDate(timeString: string): string {
  const date = new Date(timeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * ISO 8601 형식의 시간 문자열을 "00시 00분 00초" 형식으로 변환
 * @param timeString ISO 8601 형식의 시간 문자열 (예: "2025-11-10T14:00:00")
 * @returns "00시 00분 00초" 형식의 시간 문자열 (예: "14시 30분 45초")
 */
export function formatISOStringToKorean(timeString: string): string {
  const date = new Date(timeString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}시  ${minutes}분  ${seconds}초`;
}

/**
 * Date 객체를 날짜 형식으로 변환
 * @param date Date 객체
 * @returns 날짜 문자열 (예: "2025-11-10")
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Date 객체를 "00시 00분 00초" 형식으로 변환
 * @param date Date 객체
 * @returns "00시 00분 00초" 형식의 시간 문자열 (예: "14시 30분 45초")
 */
export function formatTimeToKorean(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}시  ${minutes}분  ${seconds}초`;
}

/**
 * "HH:mm" 형식의 문자열을 "00시 00분 00초" 형식으로 변환
 * @param hhmm "HH:mm" 형식의 시간 문자열 (예: "14:30")
 * @returns "00시 00분 00초" 형식의 시간 문자열 (예: "14시 30분 00초")
 */
export function formatHHmmToKorean(hhmm: string): string {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  return `${hoursStr}시  ${minutesStr}분  00초`;
}

