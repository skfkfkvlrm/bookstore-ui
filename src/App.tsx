import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
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

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
  );
}

export default App;
