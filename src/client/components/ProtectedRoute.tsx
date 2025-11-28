import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/authStorage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
