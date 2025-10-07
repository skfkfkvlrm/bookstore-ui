import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Book } from "../../shared/types";
import booksData from "../../shared/data/books.json";
import Pagination from "../../shared/components/common/Pagination";

const ITEMS_PER_PAGE = 12;

const BookList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const pageParam = searchParams.get("page") || "1";
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(parseInt(pageParam));

  useEffect(() => {
    setCurrentPage(parseInt(pageParam));
  }, [pageParam]);

  useEffect(() => {
    setLocalSearch(searchQuery);
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ search: localSearch, page: "1" });
    } else {
      setSearchParams({ page: "1" });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params: Record<string, string> = { page: page.toString() };
    if (searchQuery) {
      params.search = searchQuery;
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredBooks = (booksData as Book[]).filter((book) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.isbn.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] py-3 pl-12 pr-4 text-base placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#1173d4] focus:ring-[#1173d4] text-gray-900 dark:text-gray-100"
            placeholder="Search by title, author, or ISBN"
          />
        </form>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {searchQuery ? `Search Results for "${searchQuery}"` : "All Books"}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"} found
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {paginatedBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => navigate(`/client/books/${book.id}`)}
            className="group flex cursor-pointer flex-col gap-2"
          >
            <div className="w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 transition-shadow duration-300 group-hover:shadow-xl">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`aspect-[3/4] w-full bg-gradient-to-br from-[#1173d4]/20 to-[#1173d4]/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${book.coverImage ? 'hidden' : ''}`}>
                <span className="material-symbols-outlined text-6xl text-[#1173d4]/40">
                  book
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">by {book.author}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm font-bold text-[#1173d4]">${book.price}</p>
                {book.available ? (
                  <span className="text-xs text-green-600 dark:text-green-400">In Stock</span>
                ) : (
                  <span className="text-xs text-red-600 dark:text-red-400">Out of Stock</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
            search_off
          </span>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No books found matching your search.
          </p>
        </div>
      )}

      {filteredBooks.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredBooks.length}
        />
      )}
    </div>
  );
};

export default BookList;
