import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useOwnerStore } from "@/store/useOwnerStore";

const PrivateRoute = () => {
  const isAuthenticated = useOwnerStore((state) => state.isAuthenticated);
  const setPostAuthRedirect = useOwnerStore(
    (state) => state.setPostAuthRedirect
  );
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setPostAuthRedirect(location.pathname + location.search);
    }
  }, [isAuthenticated, location.pathname, location.search, setPostAuthRedirect]);

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

