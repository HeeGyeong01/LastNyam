import { useLayout } from '@/contexts/LayoutContext';
import BottomSheet from './BottomSheet';
import { CheckIcon } from '@heroicons/react/24/solid';
import type { DiscountSortType } from '@/features/discount/type';
import type { FoocketingSortType } from '@/features/foocketing/type';

interface SortOption {
  label: string;
  description: string;
}

// 마감세일 정렬 옵션
export const discountSortLabels: Record<DiscountSortType, SortOption> = {
  FAVORITES: {
    label: '찜하기순',
    description: '사용자가 많이 찜한 순으로 정렬됩니다',
  },
  RATING: {
    label: '별점순',
    description: '별점이 높은 순으로 정렬됩니다',
  },
  CLOSEST: {
    label: '거리순',
    description: '현재 위치에서 가장 가까운 순으로 정렬됩니다',
  },
  DISCOUNT: {
    label: '할인율순',
    description: '할인율이 높은 순으로 정렬됩니다',
  },
  PRICE: {
    label: '가격순',
    description: '가격이 낮은 순으로 정렬됩니다',
  },
};

// 푸켓팅 정렬 옵션
export const foocketingSortLabels: Record<FoocketingSortType, SortOption> = {
  IMMINENT: {
    label: '마감순',
    description: '푸켓팅 시간이 임박한 순으로 정렬됩니다',
  },
  CLOSEST: {
    label: '거리순',
    description: '현재 위치에서 가장 가까운 순으로 정렬됩니다',
  },
  PRICE: {
    label: '정가순',
    description: '할인 전 기존 판매가가 높은 음식 순으로 정렬됩니다',
  },
};

export default function SortBottomSheet() {
  const { 
    sortBottomSheetType, 
    sortBottomSheetData, 
    closeSortBottomSheet 
  } = useLayout();

  if (!sortBottomSheetType || !sortBottomSheetData) {
    return null;
  }

  // 타입에 따라 sortLabels 선택
  const sortLabels = sortBottomSheetType === 'discount' 
    ? discountSortLabels 
    : foocketingSortLabels;

  const handleSortClick = (sort: string) => {
    // 단방향 데이터 흐름:
    // 부모에서 전달받은 onSortSelect 콜백 호출
    // → 부모의 setSort 실행 → sort 상태 변경 → API 재요청
    sortBottomSheetData.onSortSelect(sort);
    closeSortBottomSheet();
  };

  return (
    <BottomSheet
      showBackdrop={true}
      onBackdropClick={closeSortBottomSheet}
    >
      <div>
        <div className="flex flex-col">
          {Object.entries(sortLabels).map(([sort, option]) => {
            const isSelected = sortBottomSheetData.currentSort === sort;
            return (
              <button
                key={sort}
                onClick={() => handleSortClick(sort)}
                className="self-stretch inline-flex justify-start items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 flex flex-col justify-start items-start gap-1 min-w-0">
                  <div className="p1-b text-primary leading-6 text-left">
                    {option.label}
                  </div>
                  <div className="p3 text-tertiary leading-4 text-left">
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-7 h-7 flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 text-slate-900" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}

