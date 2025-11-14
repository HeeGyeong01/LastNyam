import { useEffect, useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { FoocketingSortType } from '../type/foocketing';
import { formatTimeToKorean } from '@/shared/lib/time';
import { Button } from '@shared/components/Button';

interface FoocketingListHeaderProps {
  sort: FoocketingSortType;
  sortLabels: Record<FoocketingSortType, string>;
  onSortClick?: () => void;
}

export default function FoocketingListHeader({
  sort,
  sortLabels,
  onSortClick,
}: FoocketingListHeaderProps) {
  // 현재 시간 상태 관리
  const [currentTime, setCurrentTime] = useState(new Date());

  // 현재 시간 업데이트 (1초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
      <Button btnStyle="ghost" size="default" onClick={onSortClick}>
        <span>{sortLabels[sort]}</span>
        <ChevronDownIcon className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

