import { Navigate } from "react-router-dom";
import { getToken, isAdmin } from "../../client/utils/authStorage";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!getToken() || !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export default AdminProtectedRoute;
