import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import OwnerSettingPage from "../domains/settings/pages/OwnerSettingPage";
import ReceiptConfirmPage from "../domains/orders/pages/ReceiptConfirmPage";
import OrderListPage from "../domains/orders/pages/OrderListPage";
import QRScanPage from "../domains/orders/pages/QRScanPage";
import ReportPage from "../domains/insights/pages/ReportPage";
import ManageMenuPage from "../domains/catalog/pages/ManageMenuPage";
import ManageFoocketingPage from "../domains/catalog/pages/ManageFoocketingPage";
import ManageCloseoutSalePage from "../domains/catalog/pages/ManageCloseoutSalePage";
import SignUpPage from "../domains/auth/pages/SignUpPage";
import LoginPage from "../domains/auth/pages/LoginPage";
import StoreInformationStep1InputPage from "../domains/auth/pages/StoreInformation/StoreInformationStep1InputPage";
import StoreInformationStep1DocumentPage from "../domains/auth/pages/StoreInformation/StoreInformationStep1DocumentPage";
import StoreInformationStep2Page from "../domains/auth/pages/StoreInformation/StoreInformationStep2Page";
import ComponentTestPage from "../domains/test/pages/ComponentTestPage";
import HeaderFooterLayout from "../layouts/HeaderFooterLayout";
import FooterOnlyLayout from "../layouts/FooterOnlyLayout";
import QRScanLayout from "../layouts/QRScanLayout";

const router = createBrowserRouter([
  {
    path: "/owner",
    element: <App />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
      {
        element: <FooterOnlyLayout />,
        children: [
          {
            path: "orders",
            children: [
              {
                path: "list",
                element: <OrderListPage />,
              },
            ],
          },
        ],
      },
      {
        element: <QRScanLayout />,
        children: [
          {
            path: "orders/qr-scan",
            element: <QRScanPage />,
          },
        ],
      },
      {
        element: <HeaderFooterLayout />,
        // element: <OwnerLayout />,
        children: [
          {
            path: "orders",
            children: [
              {
                path: "receipt-confirm",
                element: <ReceiptConfirmPage />,
              },
            ],
          },
          {
            path: "catalog",
            children: [
              {
                path: "menu",
                element: <ManageMenuPage />,
              },
              {
                path: "foocketing",
                element: <ManageFoocketingPage />,
              },
              {
                path: "closeout-sale",
                element: <ManageCloseoutSalePage />,
              },
            ],
          },
          {
            path: "insights",
            children: [
              {
                path: "report",
                element: <ReportPage />,
              },
            ],
          },
          {
            path: "settings",
            element: <OwnerSettingPage />,
          },
          {
            path: "store-information",
            children: [
              {
                path: "step1-input",
                element: <StoreInformationStep1InputPage />,
              },
              {
                path: "step1-document",
                element: <StoreInformationStep1DocumentPage />,
              },
              {
                path: "step2",
                element: <StoreInformationStep2Page />,
              },
            ],
          },
          {
            path: "test",
            element: <ComponentTestPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
