import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { DiscountSortType } from '@/types';

interface DiscountListHeaderProps {
  sort: DiscountSortType;
  sortLabels: Record<DiscountSortType, string>;
  onSortClick?: () => void;
}

export default function DiscountListHeader({
  sort,
  sortLabels,
  onSortClick,
}: DiscountListHeaderProps) {

  return (
    <div className="bg-white flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
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

