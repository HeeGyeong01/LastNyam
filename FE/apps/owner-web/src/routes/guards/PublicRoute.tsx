import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useOwnerStore } from "@/store/useOwnerStore";

const PublicRoute = () => {
  const isAuthenticated = useOwnerStore((state) => state.isAuthenticated);
  const postAuthRedirectPath = useOwnerStore(
    (state) => state.postAuthRedirectPath
  );
  const setPostAuthRedirect = useOwnerStore(
    (state) => state.setPostAuthRedirect
  );
  const shouldPreventPublicRedirect = useOwnerStore(
    (state) => state.shouldPreventPublicRedirect
  );
  const { pathname } = useLocation();

  const shouldRedirectAuthenticatedUser =
    pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (
      isAuthenticated &&
      shouldRedirectAuthenticatedUser &&
      postAuthRedirectPath
    ) {
      setPostAuthRedirect(null);
    }
  }, [
    isAuthenticated,
    shouldRedirectAuthenticatedUser,
    postAuthRedirectPath,
    setPostAuthRedirect,
  ]);

  if (
    isAuthenticated &&
    shouldRedirectAuthenticatedUser &&
    !shouldPreventPublicRedirect
  ) {
    return (
      <Navigate
        to={postAuthRedirectPath ?? "/orders/list"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default PublicRoute;

