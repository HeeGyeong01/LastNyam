import { ClockIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { FoocketingSortType } from '../type/foocketing';
import { formatTimeToKorean } from '@/shared/lib/time';
import { Button } from '@shared/components/Button';
import { useLayout } from '@/contexts/LayoutContext';
import { foocketingSortLabels } from '@/shared/components/SortBottomSheet';
import { useServerTime } from '@/shared/hooks/useServerTime';

interface FoocketingListHeaderProps {
  sort: FoocketingSortType;
  onSortSelect: (sort: FoocketingSortType) => void;
}

export default function FoocketingListHeader({
  sort,
  onSortSelect,
}: FoocketingListHeaderProps) {
  const { openSortBottomSheet } = useLayout();

  const handleSortClick = () => {
    // 단방향 데이터 흐름 (각 페이지에서 sort 상태 소유):
    // 1. 부모(Foocketing.tsx)에서 sort 상태와 setSort(onSortSelect)를 props로 받음
    // 2. Context에 현재 sort와 콜백을 전달하여 바텀시트 열기 (UI 상태만 Context에서 관리)
    // 3. SortBottomSheet에서 선택 시 콜백 호출 → 부모의 setSort 실행
    // 4. 부모의 sort 상태 변경 → useFoocketingList의 queryKey 변경 → API 재요청
    openSortBottomSheet('foocketing', {
      currentSort: sort,
      onSortSelect: (selectedSort) => onSortSelect(selectedSort as FoocketingSortType),
    });
  };
  
  // 서버 시간 동기화 훅 사용 (30초마다 서버 시간과 동기화)
  const currentTime = useServerTime(30000);

  return (
    <div className="bg-white flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
      {/* 현재 시간 */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          <ClockIcon className="w-4 h-4 text-amber-500" />
          <span className="p2-b text-brand-subtle">현재시간 :</span>
        </div>
        <span className="p2-b text-primary">
          {formatTimeToKorean(currentTime)}
        </span>
      </div>

      {/* 정렬 옵션 */}
      <Button btnStyle="ghost" size="default" onClick={handleSortClick} className="px-0">
        <span>{foocketingSortLabels[sort].label}</span>
        <ChevronDownIcon className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

