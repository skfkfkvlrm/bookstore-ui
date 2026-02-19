import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import AdminLogin from "./pages/AdminLogin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Dashboard from "./pages/Dashboard";
import MemberList from "./pages/members/MemberList";
import MemberAdd from "./pages/members/MemberAdd";
import MemberDetail from "./pages/members/MemberDetail";
import BookList from "./pages/books/BookList";
import BookAdd from "./pages/books/BookAdd";
import BookDetail from "./pages/books/BookDetail";
import OrderList from "./pages/orders/OrderList";
import OrderAdd from "./pages/orders/OrderAdd";
import OrderDetail from "./pages/orders/OrderDetail";
import LoanList from "./pages/loans/LoanList";
import LoanAdd from "./pages/loans/LoanAdd";
import LoanDetail from "./pages/loans/LoanDetail";
import Settings from "./pages/Settings";

function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/*"
        element={
          <AdminProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/members" element={<MemberList />} />
                <Route path="/members/add" element={<MemberAdd />} />
                <Route path="/members/:id" element={<MemberDetail />} />
                <Route path="/books" element={<BookList />} />
                <Route path="/books/add" element={<BookAdd />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/loans" element={<LoanList />} />
                <Route path="/loans/add" element={<LoanAdd />} />
                <Route path="/loans/:id" element={<LoanDetail />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/orders/add" element={<OrderAdd />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </AdminProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AdminApp;
