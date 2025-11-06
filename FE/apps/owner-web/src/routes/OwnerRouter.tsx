import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import OwnerLayout from '../layouts/OwnerLayout';
import OwnerSettingPage from '../domains/settings/pages/OwnerSettingPage';
import ReceiptConfirmPage from '../domains/orders/pages/ReceiptConfirmPage';
import OrderListPage from '../domains/orders/pages/OrderListPage';
import QRScanPage from '../domains/orders/pages/QRScanPage';
import ReportPage from '../domains/insights/pages/ReportPage';
import ManageMenuPage from '../domains/catalog/pages/ManageMenuPage';
import ManageFoocketingPage from '../domains/catalog/pages/ManageFoocketingPage';
import ManageCloseoutSalePage from '../domains/catalog/pages/ManageCloseoutSalePage';
import SignUpPage from '../domains/auth/pages/SignUpPage';
import LoginPage from '../domains/auth/pages/LoginPage';
import ComponentTestPage from '../domains/test/pages/ComponentTestPage';

const router = createBrowserRouter([
  {
    path: '/owner',
    element: <App />,
    children: [
      {
        element: <OwnerLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'signup',
            element: <SignUpPage />,
          },
          {
            path: 'orders',
            children: [
              {
                path: 'list',
                element: <OrderListPage />,
              },
              {
                path: 'qr-scan',
                element: <QRScanPage />,
              },
              {
                path: 'receipt-confirm',
                element: <ReceiptConfirmPage />,
              },
            ],
          },
          {
            path: 'catalog',
            children: [
              {
                path: 'menu',
                element: <ManageMenuPage />,
              },
              {
                path: 'foocketing',
                element: <ManageFoocketingPage />,
              },
              {
                path: 'closeout-sale',
                element: <ManageCloseoutSalePage />,
              },
            ],
          },
          {
            path: 'insights',
            children: [
              {
                path: 'report',
                element: <ReportPage />,
              },
            ],
          },
          {
            path: 'settings',
            element: <OwnerSettingPage />,
          },
          {
            path: 'test',
            element: <ComponentTestPage />,
          },
        ],
      },
    ],
  },
]);

export default router;

