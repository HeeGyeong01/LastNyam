import { createBrowserRouter, Outlet } from 'react-router-dom';
import { MainLayout, DetailLayout } from '../components/layout';
import { BottomNavBar } from '../components/common';
import Home from '../pages/home';
import { Login, KakaoCallback, AdditionalInfo, SignupComplete } from '../pages/auth';
import { Foocketing, FoocketingDetail, FoocketingSuccess, FoocketingFail } from '../pages/foocketing';
import { Discount } from '../pages/discount';
import { ShopDetail } from '../pages/shop';
import { Cart, PaymentSuccess } from '../pages/cart';
import { Favorite } from '../pages/favorite';
import { Search, SearchResult } from '../pages/search';
import OrderList from '../pages/order';
import MyPage from '../pages/mypage';
import QR from '../pages/qr';

// Cart 전용 레이아웃 (BottomNavBar는 있지만 padding 없음)
function CartLayout() {
  return (
    <>
      <div className="h-screen max-w-[500px] mx-auto overflow-y-auto">
        <Outlet />
      </div>
      <BottomNavBar />
    </>
  );
}

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
    ],
  },
  
  // Cart route (네비게이션 바는 있지만 padding 없음)
  {
    element: <CartLayout />,
    children: [
      {
        path: '/cart',
        element: <Cart />,
      },
    ],
  },
]);

