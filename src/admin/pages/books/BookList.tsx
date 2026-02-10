import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import SearchInput from "../../../shared/components/common/SearchInput";

import Pagination from "../../../shared/components/common/Pagination";
import booksData from "../../../shared/data/books.json";

const ITEMS_PER_PAGE = 10;

const BookList = () => {
  const navigate = useNavigate();
  const [books] = useState<Book[]>(booksData as Book[]);
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "author" | "price" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch = searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && book.available) ||
      (availabilityFilter === "unavailable" && !book.available);

    return matchesSearch && matchesAvailability;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
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
  });

  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = sortedBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} on books:`, selectedBooks);
    alert(`선택한 ${selectedBooks.length}권에 ${action} 작업을 수행했습니다.`);
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
          {row.coverImage ? (
            <img
              src={row.coverImage}
              alt={`Cover of ${row.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-gradient-to-br from-[#2f9e5f]/20 to-[#2f9e5f]/5 flex items-center justify-center ${row.coverImage ? 'hidden' : ''}`}>
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
      accessor: (row: Book) => `$${row.price.toFixed(2)}`,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "재고 상태",
      accessor: (row: Book) => (
        <Badge variant={row.available ? "available" : "unavailable"}>
          {row.available ? "재고 있음" : "재고 없음"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">도서 관리</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">등록된 도서를 관리하세요.</p>
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
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleBulkAction("내보내기")}>
                <span className="material-symbols-outlined">download</span>
                내보내기
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleBulkAction("삭제")}>
                <span className="material-symbols-outlined">delete</span>
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <SearchInput
              placeholder="제목·저자·ISBN으로 검색"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
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
            {paginatedBooks.map((book) => (
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
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={books.length}
      />
    </div>
  );
};

export default BookList;
