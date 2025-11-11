import { ClockIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { FoocketingSortType } from '@/types';

interface FoocketingListHeaderProps {
  currentTime: Date;
  sort: FoocketingSortType;
  sortLabels: Record<FoocketingSortType, string>;
  onSortClick?: () => void;
}

export default function FoocketingListHeader({
  currentTime,
  sort,
  sortLabels,
  onSortClick,
}: FoocketingListHeaderProps) {
  const formatCurrentTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours}시  ${minutes}분  ${seconds}초`;
  };

  return (
    <div className="bg-white flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
      {/* 현재 시간 */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          <ClockIcon className="w-4 h-4 text-amber-500" />
          <span className="p2-b text-brand-subtle">현재시간 :</span>
        </div>
        <span className="p2-b text-primary">
          {formatCurrentTime(currentTime)}
        </span>
      </div>

      {/* 정렬 옵션 */}
      <button 
        className="flex items-center gap-1 text-slate-500 text-sm font-semibold"
        onClick={onSortClick}
      >
        <span>{sortLabels[sort]}</span>
        <ChevronDownIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

