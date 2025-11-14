import { useLocation } from 'react-router-dom';
import { FaceSmileIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { HomeIcon, HeartIcon, OrderListIcon } from '../assets/icons';
import BottomNavItem from './BottomNavItem';

const navItems = [
  { icon: HomeIcon, label: '홈', path: '/' },
  { icon: HeartIcon, label: '찜', path: '/favorite' },
  { icon: MagnifyingGlassIcon, label: '검색', path: '/search', strokeWidth: 3 },
  { icon: OrderListIcon, label: '주문내역', path: '/order-list' },
  { icon: FaceSmileIcon, label: '마이페이지', path: '/login' },
];

export default function BottomNavBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-0 z-[888]">
      <div className="flex w-full max-w-[500px] mx-auto px-6 py-4 justify-between items-start">
        {navItems.map((item) => (
          <BottomNavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={location.pathname === item.path}
            strokeWidth={item.strokeWidth}
          />
        ))}
      </div>
    </nav>
  );
}

