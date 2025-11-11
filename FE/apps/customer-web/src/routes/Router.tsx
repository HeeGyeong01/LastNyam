import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import Home from '../pages/home';
import { Login, KakaoCallback, AdditionalInfo, SignupComplete } from '../pages/auth';
import { Foocketing, FoocketingDetail, FoocketingSuccess, FoocketingFail } from '../pages/foocketing';
import { Discount } from '../pages/discount';
import { ShopDetail } from '../pages/shop';
import { Cart, PaymentSuccess } from '../pages/cart';
import Likes from '../pages/likes';
import { Search, SearchResult } from '../pages/search';
import OrderList from '../pages/order';
import MyPage from '../pages/mypage';
import QR from '../pages/qr';

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
        path: '/foocketing/:id',
        element: <FoocketingDetail />,
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
        path: '/shop/:id',
        element: <ShopDetail />,
      },
      {
        path: '/cart',
        element: <Cart />,
      },
      {
        path: '/payment-success',
        element: <PaymentSuccess />,
      },
      {
        path: '/likes',
        element: <Likes />,
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
]);

