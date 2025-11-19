import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFoocketingResult } from '@/features/foocketing/api';
import { PageHeader } from '@/shared/components';
import FoocketingCard from '@/features/foocketing/component/FoocketingCard';
import sadCatImage from '@/shared/assets/lastnyam-cat-sad.png';

export default function FoocketingFail() {
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

  // 성공 응답인 경우 성공 페이지로 리다이렉트
  if (result.status === 'SUCCESS') {
    navigate(`/foocketing-success/${id}`, { replace: true });
    return null;
  }

  // 실패 응답인 경우 (WAITING 상태도 포함)
  if (result.status === 'WAITING') {
    // 대기 중인 경우는 상세 페이지로 리다이렉트하거나 에러 표시
    return (
      <div className="flex items-center justify-center h-screen">
        <p>결과를 확인하는 중입니다...</p>
      </div>
    );
  }

  // FAIL 상태인 경우
  const { rank, otherFoocketingsOfShop, recommendedFoocketings } = result;

  return (
    <>
      <PageHeader title="푸켓팅"/>
      
      <div className="flex flex-col gap-6 p-4 pt-6">
        {/* 실패 메시지 카드 */}
        <div className="w-80 p-7 bg-bg-2 rounded-3xl flex flex-col items-center gap-5 mx-auto">
          {/* 제목 */}
          <div className="self-stretch py-2 bg-white rounded-full flex justify-center items-center">
            <div className="text-secondary font-kr-h4 text-kr-h4">
              푸켓팅 실패...
            </div>
          </div>
          
          {/* 이미지 및 순위 영역 */}
          <img 
            className="w-28 h-28" 
            src={sadCatImage} 
            alt="슬픈 고양이"
          />
          {/* 순위 및 메시지 */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-secondary font-kr-h1 text-kr-h1">
              {rank}번
            </div>
            <div className="text-secondary text-p2-b">
              아쉽지만 이번엔 놓쳤어요ㅠㅠㅠ
            </div>
          </div>
        </div>

        {/* 이 가게의 다른 푸켓팅 섹션 */}
        {otherFoocketingsOfShop && otherFoocketingsOfShop.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            <h2 className="text-primary p1-b px-1">
              이 가게의 다른 푸켓팅
            </h2>
            <div className="flex gap-3 overflow-x-auto flex-nowrap -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {otherFoocketingsOfShop.map((item) => (
                <FoocketingCard
                  openTime={item.openTime}
                  menuName={item.menu.name}
                  originalPrice={item.menu.price}
                  shopName={item.shop.name}
                  menuProfileImage={item.menu.photoUrl}
                  distance={item.shop.distance}
                  rating={item.shop.rating}
                  reviewCount={item.shop.ratingCount}
                  discountedPrice={0}
                  onClick={() => {
                    navigate(`/foocketing/${item.foocketingId}`);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 추천 푸켓팅 섹션 */}
        {recommendedFoocketings && recommendedFoocketings.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            <h2 className="text-primary p1-b px-1">
              이 푸켓팅들은 어때요?
            </h2>
            <div className="flex gap-3 overflow-x-auto flex-nowrap -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {recommendedFoocketings.map((item) => (
                  <FoocketingCard
                    openTime={item.openTime}
                    menuName={item.menu.name}
                    originalPrice={item.menu.price}
                    shopName={item.shop.name}
                    menuProfileImage={item.menu.photoUrl}
                    distance={item.shop.distance}
                    rating={item.shop.rating}
                    reviewCount={item.shop.ratingCount}
                    discountedPrice={0}
                    onClick={() => {
                      navigate(`/foocketing/${item.foocketingId}`);
                    }}
                  />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

