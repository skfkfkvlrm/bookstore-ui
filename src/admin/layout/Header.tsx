const Header = () => {
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
            className="bg-gray-100 dark:bg-[#101922] border-none rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-[#1173d4] focus:outline-none"
          />
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#101922]">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
            notifications
          </span>
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"
          style={{ backgroundImage: 'url("https://i.pravatar.cc/40?u=sarah")' }}
        />
      </div>
    </header>
  );
};

export default Header;
