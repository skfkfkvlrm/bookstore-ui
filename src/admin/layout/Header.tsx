import { useNavigate } from "react-router-dom";
import { clearAuth, getCurrentUser } from "../../client/utils/authStorage";

const Header = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    if (!window.confirm("로그아웃하시겠습니까?")) return;
    clearAuth();
    navigate("/admin/login");
  };

  return (
    <header className="h-16 flex items-center justify-end px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2632] flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="검색"
            className="bg-gray-100 dark:bg-[#101922] border-none rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
          />
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#101922]">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
            notifications
          </span>
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name ?? '관리자'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={handleLogout}
            title="로그아웃"
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#101922] hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
