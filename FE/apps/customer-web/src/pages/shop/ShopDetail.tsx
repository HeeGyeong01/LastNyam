import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PhoneIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { PageHeader } from '@/components/common';
import { DiscountList } from '@/components/discount';
import { FoocketingList } from '@/components/foocketing';
import { useShopDetail } from '@/hooks';
import ShopInfoTabs from './components/ShopInfoTabs';

export default function ShopDetail() {
  const { id } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    shopDetail: detail,
    loading,
    error,
  } = useShopDetail({
    shopId: id ? Number(id) : 0, // id가 없으면 0 (enabled: !!shopId로 쿼리 실행 안됨)
  });

  if (error) {
    console.log('가게 상세 조회 에러:', error);
  }

  if (!detail && !loading) {
    console.log('가게 상세 데이터가 없습니다.');
  }

  // 스크롤 이벤트 감지 (DetailLayout의 스크롤 컨테이너)
  useEffect(() => {
    const handleScroll = () => {
      // DetailLayout의 스크롤 컨테이너 찾기
      const scrollContainer = document.querySelector('.h-screen.overflow-y-auto');
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop;
        setIsScrolled(scrollTop > 100); // 100px 이상 스크롤 시 light로 변경
      } else {
        // fallback: window scroll
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        setIsScrolled(scrollTop > 100);
      }
    };

    const scrollContainer = document.querySelector('.h-screen.overflow-y-auto');
    const target = scrollContainer || window;
    
    target.addEventListener('scroll', handleScroll);
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      {/* Header - 화면 최상단에 고정 */}
      <div className="fixed top-0 left-0 right-0 max-w-[500px] mx-auto z-50">
        <PageHeader 
          title={isScrolled ? (detail?.shopName || '가게 상세') : undefined} 
          variant={isScrolled ? 'light' : 'dark'} 
          className="sticky top-0"
        />
      </div>
      
      {/* 배너 이미지 - 스크롤 시 같이 움직임 */}
      {detail && !loading && (
        <div className="relative w-full h-40">
          <img
            className="w-full h-full object-cover"
            src={detail.shopBanner || 'https://placehold.co/400x200'}
            alt={detail.shopName}
          />
          {/* 그라데이션 오버레이 - 위는 어둡고 아래는 투명 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          
          {/* 가게 프로필 - 배너 이미지 위에 겹쳐서 배치 */}
          <div className="absolute top-28 left-4 right-4">
            <div className="flex flex-col self-stretch p-5 rounded-2xl border border-stroke-subtle bg-white justify-start items-start gap-4">
              {/* 가게이름 */}
              <div className="self-stretch text-center text-primary h4-b">
                {detail.shopName}
              </div>

              {/* 별점과 리뷰 수 */}
              <div className="self-stretch flex justify-center items-center gap-2">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-[#F79616]" />
                  <span className="text-primary p2-b">{detail.rating.toFixed(1)}</span>
                </div>
                <div className="w-px h-4 bg-stroke-subtle" />
                <span className="text-secondary p2">{detail.ratingCount.toLocaleString('ko-KR')}명 참여</span>
              </div>
              
              {/* 전화, 찜, 공유 버튼 */}
              <div className="self-stretch flex justify-center items-center gap-8 pt-2 border-t border-stroke-subtle">
                <div className="flex flex-col items-center gap-1">
                  <PhoneIcon className="w-5 h-5 text-primary" />
                  <span className="text-secondary caption2">전화</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <HeartIcon className="w-5 h-5 text-red-500" />
                  <span className="text-secondary caption2">{detail.ratingCount.toLocaleString('ko-KR')}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShareIcon className="w-5 h-5 text-primary" />
                  <span className="text-secondary caption2">공유</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {loading && <p>로딩 중...</p>}
      
      {(error || !detail) && !loading && (
        <p>페이지를 찾을 수 없습니다</p>
      )}
      
      {detail && !loading && (
        <div className="w-full p-4 flex flex-col justify-center items-start gap-6">
          {/* 가게 정보 탭 (노쇼 시간, 가게 위치, 가게 소개) */}
          <div className="w-full mt-28">
            <ShopInfoTabs
              shopDescription={detail.shopDescription}
              shopLat={detail.shopLat}
              shopLng={detail.shopLng}
              shopName={detail.shopName}
              shopAddress={detail.shopAddress}
              distanceMeters={detail.distanceMeters}
            />
          </div>
          {/* 마감세일 목록 */}
          {detail.discounts && detail.discounts.length > 0 && (
            <div className="self-stretch pt-3 bg-white flex flex-col justify-start items-start gap-3">
              <div className="self-stretch px-4 inline-flex justify-start items-center gap-36">
                <div className="text-center justify-start text-black text-lg font-bold font-['Pretendard'] leading-7">
                  마감세일 중인 메뉴
                </div>
              </div>
                <DiscountList
                  discounts={detail.discounts}
                />
            </div>
          )}

          {/* 푸켓팅 목록 */}
          {detail.foocketings && detail.foocketings.length > 0 && (
            <div className="self-stretch pt-3 bg-white flex flex-col justify-start items-start gap-3">
              <div className="self-stretch px-4 inline-flex justify-start items-center gap-36">
                <div className="text-center justify-start text-black text-lg font-bold font-['Pretendard'] leading-7">
                  푸켓팅 중인 메뉴
                </div>
              </div>
              <div className="px-4 flex flex-col justify-start items-start gap-5">
                <FoocketingList
                  foocketings={detail.foocketings}
                  shopInfo={{
                    name: detail.shopName,
                    distance: detail.distanceMeters / 1000, // 미터를 km로 변환
                    rating: detail.rating,
                    ratingCount: detail.ratingCount,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
