import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import OwnerSettingPage from "../domains/settings/pages/OwnerSettingPage";
import ShopManagePage from "../domains/settings/pages/ShopManagePage";
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
import LargeHeaderOnlyLayout from "../layouts/LargeHeaderOnlyLayout";
import QRScanLayout from "@/layouts/QRScanLayout";
import PrivateRoute from "./guards/PrivateRoute";
import PublicRoute from "./guards/PublicRoute";
import { useOwnerStore } from "@/store/useOwnerStore";

const OwnerRootRedirect = () => {
  const isAuthenticated = useOwnerStore((state) => state.isAuthenticated);

  return (
    <Navigate
      to={isAuthenticated ? "/owner/orders/list" : "/owner/login"}
      replace
    />
  );
};

const router = createBrowserRouter([
  {
    path: "/owner",
    element: <App />,
    children: [
      {
        index: true,
        element: <OwnerRootRedirect />,
      },
      {
        element: <PublicRoute />,
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
            element: <HeaderFooterLayout />,
            children: [
              {
                path: "test",
                element: <ComponentTestPage />,
              },
            ],
          },
        ],
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "store-information",
            children: [
              {
                element: (
                  <LargeHeaderOnlyLayout
                    headerProps={{
                      pageName: "가게 등록하기",
                      pageExplanation: "가게 정보를 입력하고 서비스를 이용하세요",
                      currentStep: 1,
                      totalSteps: 2,
                    }}
                  />
                ),
                children: [
                  {
                    path: "step1-input",
                    element: <StoreInformationStep1InputPage />,
                  },
                  {
                    path: "step1-document",
                    element: <StoreInformationStep1DocumentPage />,
                  },
                ],
              },
              {
                element: (
                  <LargeHeaderOnlyLayout
                    headerProps={{
                      pageName: "가게 등록하기",
                      pageExplanation: "가게 정보를 입력하고 서비스를 이용하세요",
                      currentStep: 2,
                      totalSteps: 2,
                    }}
                  />
                ),
                children: [
                  {
                    path: "step2",
                    element: <StoreInformationStep2Page />,
                  },
                ],
              },
            ],
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
                  {
                    path: "receipt-confirm",
                    element: <ReceiptConfirmPage />,
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
            children: [
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
                children: [
                  {
                    index: true,
                    element: <OwnerSettingPage />,
                  },
                  {
                    path: "shop",
                    element: <ShopManagePage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
