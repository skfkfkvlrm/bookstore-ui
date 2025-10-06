import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../../types";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import FilterButton from "../../components/common/FilterButton";
import Table from "../../components/common/Table";

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

  const columns = [
    {
      header: "Title",
      accessor: "title" as keyof Book,
      className: "font-medium text-gray-900 dark:text-white",
    },
    {
      header: "Author",
      accessor: "author" as keyof Book,
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "ISBN",
      accessor: "isbn" as keyof Book,
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Price",
      accessor: (row: Book) => `$${row.price.toFixed(2)}`,
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Availability",
      accessor: (row: Book) => (
        <Badge variant={row.available ? "available" : "unavailable"}>
          {row.available ? "Available" : "Unavailable"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: Book) => (
        <button
          onClick={() => navigate(`/books/${row.id}`)}
          className="text-[#1173d4] font-medium hover:underline"
        >
          Edit
        </button>
      ),
      className: "text-right",
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

      <Table data={books} columns={columns} />
    </div>
  );
};

export default BookList;
