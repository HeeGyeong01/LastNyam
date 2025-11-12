import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useOwnerStore } from "@/store/useOwnerStore";

const PublicRoute = () => {
  const isAuthenticated = useOwnerStore((state) => state.isAuthenticated);
  const { pathname } = useLocation();

  const shouldRedirectAuthenticatedUser =
    pathname === "/owner/login" || pathname === "/owner/signup";

  if (isAuthenticated && shouldRedirectAuthenticatedUser) {
    return <Navigate to="/owner/orders/list" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

