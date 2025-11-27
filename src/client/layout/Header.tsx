import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/client/books?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-[#f6f7f8]/80 dark:bg-[#101922]/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/client" className="flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="material-symbols-outlined text-[#1173d4] text-3xl">local_library</span>
              <span className="text-xl font-bold">Spring Library</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/client"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1173d4] dark:hover:text-[#1173d4] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/client/books"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1173d4] dark:hover:text-[#1173d4] transition-colors"
              >
                Books
              </Link>
              <Link
                to="/client/my-loans"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1173d4] dark:hover:text-[#1173d4] transition-colors"
              >
                My Loans
              </Link>
              <Link
                to="/client/cart"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1173d4] dark:hover:text-[#1173d4] transition-colors"
              >
                Cart
              </Link>
              <Link
                to="/client/orders"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1173d4] dark:hover:text-[#1173d4] transition-colors"
              >
                Orders
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 border-transparent focus:ring-2 focus:ring-[#1173d4] focus:border-transparent transition-colors text-gray-900 dark:text-gray-100"
                placeholder="Search books..."
              />
            </form>
            <Link
              to="/client/cart"
              className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1173d4] text-xs font-bold text-white">
                0
              </span>
            </Link>
            <Link
              to="/client/account"
              className="w-10 h-10 rounded-full bg-[#1173d4] flex items-center justify-center text-white font-bold"
            >
              <span className="material-symbols-outlined">person</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
