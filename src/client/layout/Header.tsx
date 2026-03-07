import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getCurrentUser, clearAuth } from "../utils/authStorage";
import { getCart } from "../utils/cartStorage";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(() => getCurrentUser());
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Update user state on location change (page navigation)
  useEffect(() => {
    setUser(getCurrentUser());
  }, [location]);

  useEffect(() => {
    // Update cart count on mount
    setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));

    // Listen for cart changes
    const handleCartChange = () => {
      setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
    };

    // Listen for auth changes
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener('cartChange', handleCartChange);
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleCartChange);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('cartChange', handleCartChange);
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleCartChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/client/books?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("로그아웃하시겠습니까?");
    if (confirmed) {
      clearAuth();
      setUser(null);
      setShowUserMenu(false);
      navigate("/client/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#f6f7f8]/80 dark:bg-[#101922]/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/client" className="flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="material-symbols-outlined text-[#2f9e5f] text-3xl">local_library</span>
              <span className="text-xl font-bold">스프링 도서관</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/client"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#2f9e5f] dark:hover:text-[#2f9e5f] transition-colors"
              >
                홈
              </Link>
              <Link
                to="/client/books"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#2f9e5f] dark:hover:text-[#2f9e5f] transition-colors"
              >
                도서
              </Link>
              <Link
                to="/client/my-loans"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#2f9e5f] dark:hover:text-[#2f9e5f] transition-colors"
              >
                내 대출
              </Link>
              <Link
                to="/client/cart"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#2f9e5f] dark:hover:text-[#2f9e5f] transition-colors"
              >
                장바구니
              </Link>
              <Link
                to="/client/orders"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#2f9e5f] dark:hover:text-[#2f9e5f] transition-colors"
              >
                주문 내역
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
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 border-transparent focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent transition-colors text-gray-900 dark:text-gray-100"
                placeholder="도서를 검색하세요"
              />
            </form>
            <Link
              to="/client/cart"
              className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2f9e5f] text-xs font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2f9e5f] flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name}
                  </span>
                  <span className="material-symbols-outlined text-sm">
                    {showUserMenu ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 z-50 bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                        user.membershipType === 'PREMIUM'
                          ? 'bg-[#2f9e5f] text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {user.membershipType === 'PREMIUM' ? '프리미엄' : '일반'} 회원
                      </span>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/client/account"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">account_circle</span>
                        내 계정
                      </Link>
                      <Link
                        to="/client/my-loans"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">auto_stories</span>
                        내 대출
                      </Link>
                      <Link
                        to="/client/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">shopping_bag</span>
                        내 주문
                      </Link>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/client/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#2f9e5f] dark:hover:text-[#2f9e5f] transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/client/register"
                  className="px-4 py-2 rounded-lg bg-[#2f9e5f] text-white text-sm font-medium hover:bg-[#2f9e5f]/90 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
