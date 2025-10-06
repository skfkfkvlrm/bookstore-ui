import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Loan } from "../../types";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import FilterButton from "../../components/common/FilterButton";

// Mock data
const mockLoans: Loan[] = [
  {
    id: 1,
    bookId: 1,
    bookTitle: "The Secret Garden",
    bookAuthor: "Frances Bennett",
    memberId: 1,
    memberName: "Sophia Clark",
    memberEmail: "sophia.clark@email.com",
    loanDate: "2025-09-10T10:00:00",
    dueDate: "2025-09-24T10:00:00",
    returnDate: "2025-09-22T14:30:00",
    status: "RETURNED",
  },
  {
    id: 2,
    bookId: 2,
    bookTitle: "1984",
    bookAuthor: "George Orwell",
    memberId: 2,
    memberName: "Ethan Bennett",
    memberEmail: "ethan.bennett@email.com",
    loanDate: "2025-09-15T11:00:00",
    dueDate: "2025-09-29T11:00:00",
    status: "ACTIVE",
  },
  {
    id: 3,
    bookId: 3,
    bookTitle: "To Kill a Mockingbird",
    bookAuthor: "Harper Lee",
    memberId: 3,
    memberName: "Olivia Carter",
    memberEmail: "olivia.carter@email.com",
    loanDate: "2025-08-20T09:00:00",
    dueDate: "2025-09-03T09:00:00",
    status: "OVERDUE",
  },
];

const LoanList = () => {
  const navigate = useNavigate();
  const [loans] = useState<Loan[]>(mockLoans);
  const [selectedLoans, setSelectedLoans] = useState<number[]>([]);

  const getStatusVariant = (status: Loan["status"]) => {
    const statusMap = {
      ACTIVE: "active" as const,
      RETURNED: "returned" as const,
      OVERDUE: "overdue" as const,
    };
    return statusMap[status];
  };

  const handleSelectAll = () => {
    if (selectedLoans.length === loans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(loans.map((loan) => loan.id));
    }
  };

  const handleSelectLoan = (loanId: number) => {
    if (selectedLoans.includes(loanId)) {
      setSelectedLoans(selectedLoans.filter((id) => id !== loanId));
    } else {
      setSelectedLoans([...selectedLoans, loanId]);
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} on loans:`, selectedLoans);
    alert(`${action} on ${selectedLoans.length} selected loan(s)`);
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedLoans.length === loans.length && loans.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-[#1173d4] focus:ring-[#1173d4]"
        />
      ),
      accessor: (row: Loan) => (
        <input
          type="checkbox"
          checked={selectedLoans.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleSelectLoan(row.id);
          }}
          className="rounded border-gray-300 text-[#1173d4] focus:ring-[#1173d4]"
        />
      ),
    },
    {
      header: "Book",
      accessor: (row: Loan) => (
        <button
          onClick={() => navigate(`/loans/${row.id}`)}
          className="text-left"
        >
          <p className="font-medium text-[#1173d4] hover:underline">{row.bookTitle}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">by {row.bookAuthor}</p>
        </button>
      ),
    },
    {
      header: "Member",
      accessor: (row: Loan) => (
        <div className="cursor-pointer">
          <p className="font-medium text-gray-900 dark:text-white">{row.memberName}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{row.memberEmail}</p>
        </div>
      ),
    },
    {
      header: "Loan Date",
      accessor: (row: Loan) => new Date(row.loanDate).toLocaleDateString(),
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "Due Date",
      accessor: (row: Loan) => new Date(row.dueDate).toLocaleDateString(),
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "Return Date",
      accessor: (row: Loan) =>
        row.returnDate ? new Date(row.returnDate).toLocaleDateString() : "-",
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "Status",
      accessor: (row: Loan) => (
        <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loan Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage book loans and returns.
          </p>
        </div>
        <Button onClick={() => navigate("/loans/add")}>
          <span className="material-symbols-outlined">add</span>
          New Loan
        </Button>
      </div>

      {selectedLoans.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedLoans.length} loan(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleBulkAction("Export")}>
                <span className="material-symbols-outlined">download</span>
                Export
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleBulkAction("Mark as Returned")}
              >
                <span className="material-symbols-outlined">check_circle</span>
                Mark as Returned
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <SearchInput placeholder="Search by book title or member name" />
          </div>
          <div className="md:col-span-2 flex items-center gap-4 justify-end">
            <FilterButton label="Status" />
            <FilterButton label="Due Date" />
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
            {loans.map((loan) => (
              <tr
                key={loan.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    !target.closest('input[type="checkbox"]') &&
                    !target.closest("button")
                  ) {
                    navigate(`/loans/${loan.id}`);
                  }
                }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 ${col.className || ""}`}>
                    {typeof col.accessor === "function" ? col.accessor(loan) : loan[col.accessor]}
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

export default LoanList;
