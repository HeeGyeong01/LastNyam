import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getFoocketingResult } from '@/features/foocketing/api';
import { PageHeader } from '@/shared/components';
import { ShopCardHorizontal } from '@/features/shop/component';
import NaverMap from '@/shared/components/NaverMap';
import lastnyamCatImage from '@/shared/assets/lastnyam-cat.png';
import { Badge } from '@shared/components/Badge';
import ConfettiFireworks from '@/shared/components/ConfettiFireworks';

export default function FoocketingSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 푸켓팅 결과 조회
  const {
    data: result,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['foocketing', 'result', id],
    queryFn: () => {
      if (!id) {
        throw new Error('푸켓팅 ID가 없습니다.');
      }
      return getFoocketingResult(Number(id));
    },
    enabled: !!id,
  });


  // 성공하지 않은 경우 (실패 응답 또는 대기 중) - 실패 페이지로 리다이렉트
  useEffect(() => {
    if (result && result.status !== 'SUCCESS') {
      navigate(`/foocketing-fail/${id}`, { replace: true });
    }
  }, [result, id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 성공하지 않은 경우 (실패 응답 또는 대기 중) - 리다이렉트 중
  if (result.status !== 'SUCCESS') {
    return null;
  }

  // 성공 응답인 경우
  const { rank, shopInfo } = result;

  return (
    <>
      {/* 폭죽 애니메이션 - 페이지 진입 시 한 번만 재생 */}
      {result.status === 'SUCCESS' && <ConfettiFireworks fireOnMount={true} />}

      <PageHeader title="푸켓팅"/>
      
      <div className="flex flex-col gap-10 p-4">
        {/* 성공 메시지 카드 */}
        <div className="w-80 p-7 bg-brand-bg-1 rounded-3xl flex flex-col items-center gap-5 mx-auto">
          {/* 제목 */}
          <div className="self-stretch py-2 bg-white rounded-full flex justify-center items-center">
            <div className="text-brand font-kr-h4 text-kr-h4">
              축하해요! 푸켓팅 성공!
            </div>
          </div>
          
          {/* 이미지 및 순위 영역 */}
            {/* 고양이 캐릭터 이미지 */}
          <img 
            className="w-28 h-28" 
            src={lastnyamCatImage} 
            alt="성공한 고양이"
          />
          
          {/* 순위 및 메시지 */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-brand font-kr-h1 text-kr-h1">
              {rank}번
            </div>
            <div className="text-brand text-p2-b">
              🔥 째로 득템했어요!🔥
            </div>
          </div>
        </div>

        {/* QR 코드 안내 카드 */}
        <div className="w-full rounded-2xl bg-bg-0 flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <Badge badgeStyle="red" size="lg">
              NOTICE
            </Badge>
            <p className="text-primary p1-b pt-2">
              음식 수령 시 사장님께 QR을 제시해 주세요
            </p>
            <p className="text-secondary p3">
              QR은 주문내역에서 확인할 수 있습니다
            </p>
          </div>
          <p className="text-brand p3-b">
            픽업 마감시간 이후에는 당첨이 취소되니 꼭 시간 내 방문해주세요!
          </p>
        </div>

        {/* 가게 정보 및 지도 카드 */}
        <div className="w-full p-5 rounded-2xl border border-stroke-subtle flex flex-col gap-4">
          {/* 가게 정보 */}
          <ShopCardHorizontal
            storeName={shopInfo.name}
            storeProfileImage={shopInfo.bannerUrl}
            rating={shopInfo.rating}
            reviewCount={shopInfo.ratingCount}
            saleMenu={shopInfo.salesMenu.join(', ')}
            distance={`${shopInfo.distance.toFixed(1)} km`}
            onClick={() => {
              navigate(`/shop/${shopInfo.shopId}`);
            }}
          />
          
          {/* 지도 */}
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <NaverMap
              center={{ lat: shopInfo.lat, lng: shopInfo.lng }}
              markers={[{ lat: shopInfo.lat, lng: shopInfo.lng, title: shopInfo.name }]}
              zoom={16}
              zoomControl={false}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </>
  );
}

