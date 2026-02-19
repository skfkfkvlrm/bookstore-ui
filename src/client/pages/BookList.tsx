import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Book } from "../../shared/types";
import { bookService } from "../../services/bookService";
import Pagination from "../../shared/components/common/Pagination";

const ITEMS_PER_PAGE = 12;

const BookList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const pageParam = parseInt(searchParams.get("page") || "1");

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async (keyword: string, page: number) => {
    setLoading(true);
    setError(null);
    try {
      const apiPage = page - 1; // API는 0-indexed
      const response = keyword
        ? await bookService.searchByKeyword(keyword, apiPage, ITEMS_PER_PAGE)
        : await bookService.getBooks(apiPage, ITEMS_PER_PAGE);
      setBooks(response.content);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalElements);
    } catch {
      setError("도서 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLocalSearch(searchQuery);
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(pageParam);
  }, [pageParam]);

  useEffect(() => {
    fetchBooks(searchQuery, currentPage);
  }, [searchQuery, currentPage, fetchBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ search: localSearch.trim(), page: "1" });
    } else {
      setSearchParams({ page: "1" });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params: Record<string, string> = { page: page.toString() };
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto">
      <div className="mb-8 max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">search</span>
          </div>
          <input
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] py-3 pl-12 pr-4 text-base placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#2f9e5f] focus:ring-[#2f9e5f] text-gray-900 dark:text-gray-100"
            placeholder="제목·저자·ISBN으로 검색"
          />
        </form>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {searchQuery ? `"${searchQuery}" 검색 결과` : "전체 도서"}
        </h2>
        {!loading && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            총 {totalItems}권이 검색되었습니다
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-4xl text-[#2f9e5f] animate-spin">progress_activity</span>
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
          <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchBooks(searchQuery, currentPage)}
            className="mt-4 px-6 py-2 rounded-lg bg-[#2f9e5f] text-white font-medium hover:bg-[#2f9e5f]/90"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/client/books/${book.id}`)}
                className="group flex cursor-pointer flex-col gap-2"
              >
                <div className="w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 transition-shadow duration-300 group-hover:shadow-xl">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={`${book.title} 표지 이미지`}
                      className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`aspect-[3/4] w-full bg-gradient-to-br from-[#2f9e5f]/20 to-[#2f9e5f]/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${book.coverImage ? "hidden" : ""}`}>
                    <span className="material-symbols-outlined text-6xl text-[#2f9e5f]/40">book</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">저자 {book.author}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm font-bold text-[#2f9e5f]">{book.price.toLocaleString()}원</p>
                    {book.available ? (
                      <span className="text-xs text-green-600 dark:text-green-400">재고 있음</span>
                    ) : (
                      <span className="text-xs text-red-600 dark:text-red-400">재고 없음</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {books.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
                search_off
              </span>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                조건에 맞는 도서를 찾지 못했습니다.
              </p>
            </div>
          )}

          {books.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalItems}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BookList;
