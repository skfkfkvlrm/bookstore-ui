import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import SearchInput from "../../../shared/components/common/SearchInput";
import Pagination from "../../../shared/components/common/Pagination";
import { bookService } from "../../../services/bookService";

const ITEMS_PER_PAGE = 10;

const BookList = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "author" | "price" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");

  const fetchBooks = useCallback(async (keyword: string, page: number) => {
    setLoading(true);
    setError(null);
    try {
      const apiPage = page - 1;
      const response = keyword
        ? await bookService.searchByKeyword(keyword, apiPage, 100)
        : await bookService.getBooks(apiPage, 100);
      setBooks(response.content);
      setTotalItems(response.totalElements);
      setTotalPages(response.totalPages);
    } catch {
      setError("도서 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks(searchQuery, currentPage);
  }, [searchQuery, currentPage, fetchBooks]);

  const filteredBooks = useMemo(() => {
    if (availabilityFilter === "all") return books;
    return books.filter((book) =>
      availabilityFilter === "available" ? book.available : !book.available
    );
  }, [books, availabilityFilter]);

  const sortedBooks = useMemo(() => [...filteredBooks].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "author":
        comparison = a.author.localeCompare(b.author);
        break;
      case "price":
        comparison = a.price - b.price;
        break;
      case "date":
        comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  }), [filteredBooks, sortBy, sortOrder]);

  const pagedTotalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = useMemo(
    () => sortedBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [sortedBooks, startIndex]
  );

  const handleSelectAll = () => {
    if (selectedBooks.length === paginatedBooks.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(paginatedBooks.map((book) => book.id));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedBooks([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch.trim());
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSelectBook = (bookId: number) => {
    if (selectedBooks.includes(bookId)) {
      setSelectedBooks(selectedBooks.filter((id) => id !== bookId));
    } else {
      setSelectedBooks([...selectedBooks, bookId]);
    }
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedBooks.length === paginatedBooks.length && paginatedBooks.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-[#2f9e5f] focus:ring-[#2f9e5f]"
        />
      ),
      accessor: (row: Book) => (
        <input
          type="checkbox"
          checked={selectedBooks.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleSelectBook(row.id);
          }}
          className="rounded border-gray-300 text-[#2f9e5f] focus:ring-[#2f9e5f]"
        />
      ),
    },
    {
      header: "표지",
      accessor: (row: Book) => (
        <div className="w-12 h-16 overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
          {row.coverImageUrl ? (
            <img
              src={row.coverImageUrl}
              alt={`Cover of ${row.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-gradient-to-br from-[#2f9e5f]/20 to-[#2f9e5f]/5 flex items-center justify-center ${row.coverImageUrl ? 'hidden' : ''}`}>
            <span className="material-symbols-outlined text-2xl text-[#2f9e5f]/40">
              book
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "도서명",
      accessor: (row: Book) => (
        <button
          onClick={() => navigate(`/admin/books/${row.id}`)}
          className="font-medium text-[#2f9e5f] hover:underline text-left"
        >
          {row.title}
        </button>
      ),
    },
    {
      header: "저자",
      accessor: "author" as keyof Book,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "ISBN",
      accessor: "isbn" as keyof Book,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "가격",
      accessor: (row: Book) => `${row.price.toLocaleString()}원`,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer whitespace-nowrap",
    },
    {
      header: "재고 상태",
      accessor: (row: Book) => (
        <Badge variant={row.available ? "available" : "unavailable"}>
          {row.available ? "재고 있음" : "재고 없음"}
        </Badge>
      ),
      className: "whitespace-nowrap",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">도서 관리</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            등록된 도서를 관리하세요. {!loading && `(총 ${totalItems.toLocaleString()}권)`}
          </p>
        </div>
        <Button onClick={() => navigate("/admin/books/add")}>
          <span className="material-symbols-outlined">add</span>
          도서 등록
        </Button>
      </div>

      {selectedBooks.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              선택된 도서 {selectedBooks.length}권
            </span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <form onSubmit={handleSearch} className="md:col-span-4">
            <SearchInput
              placeholder="제목·저자·ISBN으로 검색 후 Enter"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </form>
          <div className="md:col-span-8 flex items-center gap-3 justify-end flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">필터:</span>
              <select
                value={availabilityFilter}
                onChange={(e) => {
                  setAvailabilityFilter(e.target.value as typeof availabilityFilter);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
              >
                <option value="all">전체 도서</option>
                <option value="available">재고 있음</option>
                <option value="unavailable">재고 없음</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as typeof sortBy);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
              >
                <option value="date">등록일순</option>
                <option value="title">도서명</option>
                <option value="author">저자</option>
                <option value="price">가격</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={sortOrder === "asc" ? "내림차순으로 정렬" : "오름차순으로 정렬"}
              >
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                  {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                </span>
              </button>
            </div>
          </div>
        </div>
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
          <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} scope="col" className="px-6 py-3">
                      {typeof col.header === "function" ? col.header : col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedBooks.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                      조건에 맞는 도서가 없습니다.
                    </td>
                  </tr>
                ) : (
                  paginatedBooks.map((book) => (
                    <tr
                      key={book.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (
                          !target.closest('input[type="checkbox"]') &&
                          !target.closest("button")
                        ) {
                          navigate(`/admin/books/${book.id}`);
                        }
                      }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className={`px-6 py-4 ${col.className || ""}`}>
                          {typeof col.accessor === "function" ? col.accessor(book) : book[col.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={availabilityFilter !== "all" ? pagedTotalPages : totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={availabilityFilter !== "all" ? sortedBooks.length : totalItems}
          />
        </>
      )}
    </div>
  );
};

export default BookList;
