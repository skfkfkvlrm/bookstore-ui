import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import BookList from "./pages/BookList";
import BookDetail from "./pages/BookDetail";
import MyLoans from "./pages/MyLoans";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";

function ClientApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/my-loans" element={<MyLoans />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<MyOrders />} />
        {/* Placeholder routes */}
        <Route path="/account" element={<div className="text-center py-16"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Account - Coming Soon</h2></div>} />
        <Route path="/about" element={<div className="text-center py-16"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">About Us - Coming Soon</h2></div>} />
        <Route path="/contact" element={<div className="text-center py-16"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact - Coming Soon</h2></div>} />
        <Route path="/privacy" element={<div className="text-center py-16"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy - Coming Soon</h2></div>} />
        <Route path="/authors/:name" element={<div className="text-center py-16"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Author Page - Coming Soon</h2></div>} />
      </Routes>
    </Layout>
  );
}

export default ClientApp;
