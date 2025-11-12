import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useOwnerStore } from "@/store/useOwnerStore";

const PrivateRoute = () => {
  const isAuthenticated = useOwnerStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/owner/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
