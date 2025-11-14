import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFoocketingDetail, getFoocketingList } from '@/features/foocketing/api';
import { PageHeader } from '@/shared/components';
import FoocketingCardHorizontal from '@/features/foocketing/component/FoocketingCardHorizontal';

export default function FoocketingFail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 푸켓팅 상세 정보 조회
  const {
    data: detail,
    isLoading: loading,
  } = useQuery({
    queryKey: ['foocketing', 'detail', id],
    queryFn: () => {
      if (!id) {
        throw new Error('푸켓팅 ID가 없습니다.');
      }
      return getFoocketingDetail(Number(id));
    },
    enabled: !!id,
  });

  // 같은 가게의 다른 푸켓팅 목록 조회
  const {
    data: sameShopFoocketings,
  } = useQuery({
    queryKey: ['foocketing', 'list', 'same-shop', detail?.shop.shopId],
    queryFn: () => getFoocketingList({}),
    enabled: !!detail,
    select: (data) => {
      // 같은 가게의 다른 푸켓팅만 필터링 (현재 푸켓팅 제외)
      return data.content.filter(
        (item) => item.shop.shopId === detail?.shop.shopId && item.foocketingId !== Number(id)
      );
    },
  });

  // 추천 푸켓팅 목록 조회
  const {
    data: recommendedFoocketings,
  } = useQuery({
    queryKey: ['foocketing', 'list', 'recommended'],
    queryFn: () => getFoocketingList({}),
    enabled: true,
    select: (data) => {
      // 현재 푸켓팅 제외하고 최대 3개만 반환
      return data.content
        .filter((item) => item.foocketingId !== Number(id))
        .slice(0, 3);
    },
  });

  // TODO: API에서 실제 순위 정보를 받아와야 함
  const failRank = 8888; // 임시 값

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-bg-1">
      <PageHeader title="" showCart={false} />
      
      <div className="flex flex-col gap-6 p-4 pt-6">
        {/* 실패 메시지 카드 */}
        <div className="w-full p-6 rounded-2xl bg-bg-0 flex flex-col items-center gap-4">
          {/* 제목 */}
          <h1 className="text-primary h4-b text-center">
            푸켓팅 실패...
          </h1>
          
          {/* 슬픈 고양이 캐릭터 이미지 */}
          <div className="w-32 h-32 rounded-full bg-bg-2 flex items-center justify-center">
            {/* TODO: 실제 슬픈 고양이 캐릭터 이미지로 교체 */}
            <div className="w-24 h-24 rounded-full bg-bg-3 flex items-center justify-center">
              <span className="text-4xl">😿</span>
            </div>
          </div>
          
          {/* 실패 순위 */}
          <div className="text-primary h2-b">
            {failRank}번
          </div>
          
          {/* 메시지 */}
          <div className="text-secondary p1 text-center">
            아쉽지만 이번엔 놓쳤어요ㅠㅠㅠ
          </div>
        </div>

        {/* 이 가게의 다른 푸켓팅 섹션 */}
        {sameShopFoocketings && sameShopFoocketings.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            <h2 className="text-primary p1-b px-1">
              이 가게의 다른 푸켓팅
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {sameShopFoocketings.map((item) => (
                <div key={item.foocketingId} className="flex-shrink-0 w-[calc(100vw-2rem)]">
                  <FoocketingCardHorizontal
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
                </div>
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
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recommendedFoocketings.map((item) => (
                <div key={item.foocketingId} className="flex-shrink-0 w-[calc(100vw-2rem)]">
                  <FoocketingCardHorizontal
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

