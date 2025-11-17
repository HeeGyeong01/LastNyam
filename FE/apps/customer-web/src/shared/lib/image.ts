import defaultProfileImage from '@/shared/assets/default-profile.png';

/**
 * 가게 배너 이미지 URL을 반환합니다.
 * bannerUrl이 null이거나 빈 문자열이면 기본 이미지를 반환합니다.
 * 
 * @param bannerUrl - 가게 배너 이미지 URL (null 가능)
 * @returns 이미지 URL (기본 이미지 또는 실제 URL)
 */
export function getShopBannerUrl(bannerUrl: string | null | undefined): string {
  return bannerUrl || defaultProfileImage;
}

/**
 * 메뉴/음식 이미지 URL을 반환합니다.
 * imageUrl이 null이거나 빈 문자열이면 기본 이미지를 반환합니다.
 * 
 * @param imageUrl - 메뉴/음식 이미지 URL (null 가능)
 * @returns 이미지 URL (기본 이미지 또는 실제 URL)
 */
export function getMenuImageUrl(imageUrl: string | null | undefined): string {
  return imageUrl || defaultProfileImage;
}

