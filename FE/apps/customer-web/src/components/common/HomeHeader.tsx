import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import TypoLogo from '@/assets/typo-logo.svg?react';

export default function HomeHeader() {
  const navigate = useNavigate();

  return (
    <header className="w-full h-12 px-4 py-2 bg-white flex justify-between items-center">
      {/* 로고 */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center"
      >
        <TypoLogo className="h-4" />
      </button>

      {/* 아이콘 버튼들 */}
      <div className="flex items-center gap-1">
        {/* 알림 버튼 */}
        <button
          onClick={() => navigate('/notifications')}
          className="w-8 h-8 flex justify-center items-center"
        >
          <BellIcon className="w-5 h-5 text-primary" strokeWidth={2} />
        </button>

        {/* 장바구니 버튼 */}
        <button
          onClick={() => navigate('/cart')}
          className="w-8 h-8 flex justify-center items-center"
        >
          <ShoppingBagIcon className="w-5 h-5 text-primary" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}