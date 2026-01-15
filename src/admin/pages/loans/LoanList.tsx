import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Loan } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import SearchInput from "../../../shared/components/common/SearchInput";
import Pagination from "../../../shared/components/common/Pagination";
import { getLoans, updateLoan } from "../../../shared/utils/mockLoanApi";

const ITEMS_PER_PAGE = 10;

const LoanList = () => {
  const navigate = useNavigate();
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof Loan>("loanDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | Loan["status"]>("all");

  useEffect(() => {
    const loansFromApi = getLoans({
      searchQuery,
      statusFilter,
      sortKey: sortBy,
      sortOrder,
    });
    setAllLoans(loansFromApi);
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  const getStatusVariant = (status: Loan["status"]) => {
    const statusMap = {
      ACTIVE: "active" as const,
      RETURNED: "returned" as const,
      OVERDUE: "overdue" as const,
    };
    return statusMap[status];
  };

  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allLoans.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allLoans, currentPage]);

  const totalPages = Math.ceil(allLoans.length / ITEMS_PER_PAGE);

  const handleSelectAll = () => {
    if (selectedLoans.length === paginatedLoans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(paginatedLoans.map((loan) => loan.id));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedLoans([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectLoan = (loanId: number) => {
    if (selectedLoans.includes(loanId)) {
      setSelectedLoans(selectedLoans.filter((id) => id !== loanId));
    } else {
      setSelectedLoans([...selectedLoans, loanId]);
    }
  };

  const handleBulkAction = (action: string) => {
    if (action === "Mark as Returned") {
      selectedLoans.forEach(id => {
        updateLoan(id, { status: "RETURNED", returnDate: new Date().toISOString() });
      });
      // Refresh data
      const loansFromApi = getLoans({ searchQuery, statusFilter, sortKey: sortBy, sortOrder });
      setAllLoans(loansFromApi);
      setSelectedLoans([]);
    } else {
      console.log(`Bulk action ${action} on loans:`, selectedLoans);
      alert(`${action} on ${selectedLoans.length} selected loan(s)`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedLoans.length === paginatedLoans.length && paginatedLoans.length > 0}
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
          onClick={() => navigate(`/admin/loans/${row.id}`)}
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
        <div className="cursor-pointer" onClick={() => navigate(`/admin/members/${row.memberId}`)}>
          <p className="font-medium text-gray-900 dark:text-white">{row.memberName}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{row.memberEmail}</p>
        </div>
      ),
    },
    {
      header: "Loan Date",
      accessor: (row: Loan) => new Date(row.loanDate).toLocaleDateString(),
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Due Date",
      accessor: (row: Loan) => new Date(row.dueDate).toLocaleDateString(),
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Return Date",
      accessor: (row: Loan) =>
        row.returnDate ? new Date(row.returnDate).toLocaleDateString() : "-",
      className: "text-gray-600 dark:text-gray-400",
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
        <Button onClick={() => navigate("/admin/loans/add")}>
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <SearchInput
              placeholder="Search by book or member"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="md:col-span-8 flex items-center gap-3 justify-end flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#1173d4] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="RETURNED">Returned</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as typeof sortBy);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#1173d4] focus:border-transparent"
              >
                <option value="loanDate">Loan Date</option>
                <option value="dueDate">Due Date</option>
                <option value="bookTitle">Book Title</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
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
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedLoans.map((loan) => (
              <tr
                key={loan.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    !target.closest('input[type="checkbox"]') &&
                    !target.closest("button")
                  ) {
                    navigate(`/admin/loans/${loan.id}`);
                  }
                }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 ${col.className || ""}`}>
                    {typeof col.accessor === "function" ? col.accessor(loan) : loan[col.accessor as keyof Loan]}
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
        totalItems={allLoans.length}
      />
    </div>
  );
};

export default LoanList;
