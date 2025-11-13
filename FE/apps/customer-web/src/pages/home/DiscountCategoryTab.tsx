import { useNavigate } from 'react-router-dom';
import type { DiscountCategory } from '@/types';
import BakeryIcon from '@/components/icons/BakeryIcon';
import SushiIcon from '@/components/icons/SushiIcon';
import KimbapIcon from '@/components/icons/KimbapIcon';
import SaladIcon from '@/components/icons/SaladIcon';
import EtcIcon from '@/components/icons/EtcIcon';

interface CategoryButton {
  id: DiscountCategory;
  label: string;
  IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const categories: CategoryButton[] = [
  { id: 1, label: '베이커리', IconComponent: BakeryIcon },
  { id: 2, label: '회/초밥', IconComponent: SushiIcon },
  { id: 3, label: '김밥/분식', IconComponent: KimbapIcon },
  { id: 4, label: '샐러드/포케', IconComponent: SaladIcon },
  { id: 5, label: '기타', IconComponent: EtcIcon },
];

interface DiscountCategoryTabProps {
  onCategoryChange?: (category: DiscountCategory) => void;
}

export default function DiscountCategoryTab({
  onCategoryChange,
}: DiscountCategoryTabProps) {
  const navigate = useNavigate();

  const handleCategoryClick = (category: DiscountCategory) => {
    onCategoryChange?.(category);
    // discount 페이지로 이동하면서 카테고리 쿼리 파라미터 전달
    navigate(`/discount?category=${category}`);
  };

  return (
    <div className="flex gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className="flex-1 py-4 rounded-[28px] inline-flex flex-col justify-start items-center gap-1 bg-brand-bg-2"
        >
          {/* 아이콘 */}
          <div className="w-7.5 h-7.5 relative flex items-center justify-center">
            <category.IconComponent className="w-7.5 h-7.5 text-brand" />
          </div>

          {/* 라벨 */}
          <div className="text-center leading-3 caption2 text-brand-strong">
            {category.label}
          </div>
        </button>
      ))}
    </div>
  );
}

