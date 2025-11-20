import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { DiscountSortType } from '../type/discount';
import { Button } from '@shared/components/Button';
import { useLayout } from '@/contexts/LayoutContext';
import { discountSortLabels } from '@/shared/components/SortBottomSheet';

interface DiscountListHeaderProps {
  sort: DiscountSortType;
  onSortSelect: (sort: DiscountSortType) => void;
}

export default function DiscountListHeader({
  sort,
  onSortSelect,
}: DiscountListHeaderProps) {
  const { openSortBottomSheet } = useLayout();

  const handleSortClick = () => {
    // 단방향 데이터 흐름 (각 페이지에서 sort 상태 소유):
    // 1. 부모(Discount.tsx)에서 sort 상태와 setSort(onSortSelect)를 props로 받음
    // 2. Context에 현재 sort와 콜백을 전달하여 바텀시트 열기 (UI 상태만 Context에서 관리)
    // 3. SortBottomSheet에서 선택 시 콜백 호출 → 부모의 setSort 실행
    // 4. 부모의 sort 상태 변경 → useDiscountList의 queryKey 변경 → API 재요청
    openSortBottomSheet('discount', {
      currentSort: sort,
      onSortSelect: (selectedSort) => onSortSelect(selectedSort as DiscountSortType),
    });
  };

  return (
    <div className="bg-white flex justify-center mb-1 sticky top-0 bg-white z-10">
      {/* 정렬 옵션 */}
      <Button btnStyle="ghost" size="default" onClick={handleSortClick} className="px-0">
        <span>{discountSortLabels[sort].label}</span>
        <ChevronDownIcon className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

