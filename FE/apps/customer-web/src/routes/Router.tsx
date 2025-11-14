import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, DetailLayout } from '@/shared/layout';
// import { BottomNavBar } from '@/shared/components';
import Home from '@/features/home/pages/Home';
import Login from '@/features/auth/pages/Login';
import KakaoCallback from '@/features/auth/pages/KakaoCallback';
import AdditionalInfo from '@/features/auth/pages/AdditionalInfo';
import SignupComplete from '@/features/auth/pages/SignupComplete';
import Foocketing from '@/features/foocketing/pages/Foocketing';
import FoocketingDetail from '@/features/foocketing/pages/FoocketingDetail';
import FoocketingSuccess from '@/features/foocketing/pages/FoocketingSuccess';
import FoocketingFail from '@/features/foocketing/pages/FoocketingFail';
import Discount from '@/features/discount/pages/Discount';
import ShopDetail from '@/features/shop/pages/ShopDetail';
import { Cart, PaymentSuccess } from '../pages/cart';
import Favorite from '@/features/favorite/pages/Favorite';
import Search from '@/features/search/pages/Search';
import SearchResult from '@/features/search/pages/SearchResult';
import OrderList from '@/features/order/pages/OrderList';
import MyPage from '@/features/mypage/pages/MyPage';
import QR from '@/features/qr/pages/QR';

// Cart 전용 레이아웃 (BottomNavBar는 있지만 padding 없음)
// function CartLayout() {
//   return (
//     <>
//       <div className="h-screen max-w-[500px] mx-auto overflow-y-auto">
//         <Outlet />
//       </div>
//       <BottomNavBar />
//     </>
//   );
// }

export const router = createBrowserRouter([
  // Auth routes (네비게이션 바 없음)
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/auth/kakao/callback',
    element: <KakaoCallback />,
  },
  {
    path: '/auth/additional-info',
    element: <AdditionalInfo />,
  },
  {
    path: '/auth/signup-complete',
    element: <SignupComplete />,
  },
  
  // Main routes (네비게이션 바 있음)
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/foocketing',
        element: <Foocketing />,
      },
      {
        path: '/foocketing-success',
        element: <FoocketingSuccess />,
      },
      {
        path: '/foocketing-fail',
        element: <FoocketingFail />,
      },
      {
        path: '/discount',
        element: <Discount />,
      },
      {
        path: '/payment-success',
        element: <PaymentSuccess />,
      },
      {
        path: '/favorite',
        element: <Favorite />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/search-result',
        element: <SearchResult />,
      },
      {
        path: '/order-list',
        element: <OrderList />,
      },
      {
        path: '/mypage',
        element: <MyPage />,
      },
      {
        path: '/qr',
        element: <QR />,
      },
    ],
  },
  
  // Detail routes (네비게이션 바 없음)
  {
    element: <DetailLayout />,
    children: [
      {
        path: '/foocketing/:id',
        element: <FoocketingDetail />,
      },
      {
        path: '/shop/:id',
        element: <ShopDetail />,
      },
      {
        path: '/cart',
        element: <Cart />,
      },
    ],
  },
  
  // Cart route (네비게이션 바는 있지만 padding 없음)
  // {
  //   element: <CartLayout />,
  //   children: [
  //     {
  //       path: '/cart',
  //       element: <Cart />,
  //     },
  //   ],
  // },
]);

