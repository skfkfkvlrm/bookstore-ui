import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../../types";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import FilterButton from "../../components/common/FilterButton";

// Mock data
const mockBooks: Book[] = [
  {
    id: 1,
    title: "The Secret Garden",
    author: "Frances Bennett",
    isbn: "978-0140620100",
    price: 9.99,
    available: true,
    createdDate: "2023-01-10T09:00:00",
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0061120084",
    price: 12.5,
    available: false,
    createdDate: "2023-02-15T10:30:00",
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524935",
    price: 14.99,
    available: true,
    createdDate: "2023-03-20T14:15:00",
  },
];

const BookList = () => {
  const navigate = useNavigate();
  const [books] = useState<Book[]>(mockBooks);
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map((book) => book.id));
    }
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
    alert(`${action} on ${selectedBooks.length} selected book(s)`);
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedBooks.length === books.length && books.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-[#1173d4] focus:ring-[#1173d4]"
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
          className="rounded border-gray-300 text-[#1173d4] focus:ring-[#1173d4]"
        />
      ),
    },
    {
      header: "Title",
      accessor: (row: Book) => (
        <button
          onClick={() => navigate(`/books/${row.id}`)}
          className="font-medium text-[#1173d4] hover:underline text-left"
        >
          {row.title}
        </button>
      ),
    },
    {
      header: "Author",
      accessor: "author" as keyof Book,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "ISBN",
      accessor: "isbn" as keyof Book,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "Price",
      accessor: (row: Book) => `$${row.price.toFixed(2)}`,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "Availability",
      accessor: (row: Book) => (
        <Badge variant={row.available ? "available" : "unavailable"}>
          {row.available ? "Available" : "Unavailable"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Book Catalog</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your books.</p>
        </div>
        <Button onClick={() => navigate("/books/add")}>
          <span className="material-symbols-outlined">add</span>
          Add New Book
        </Button>
      </div>

      {selectedBooks.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedBooks.length} book(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleBulkAction("Export")}>
                <span className="material-symbols-outlined">download</span>
                Export
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleBulkAction("Delete")}>
                <span className="material-symbols-outlined">delete</span>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <SearchInput placeholder="Search by title, author, or ISBN" />
          </div>
          <div className="md:col-span-2 flex items-center gap-4 justify-end">
            <FilterButton label="Availability" />
            <FilterButton label="Genre" />
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
            {books.map((book) => (
              <tr
                key={book.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    !target.closest('input[type="checkbox"]') &&
                    !target.closest("button")
                  ) {
                    navigate(`/books/${book.id}`);
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
    </div>
  );
};

export default BookList;
