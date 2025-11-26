import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Loan } from "../../shared/types";
import loansData from "../../shared/data/loans.json";
import { getUserLoans, getCurrentMemberId, returnBook, deleteLoan } from "../utils/loanStorage";

type FilterStatus = "ALL" | "ACTIVE" | "OVERDUE" | "RETURNED";

const MyLoans = () => {
  const currentMemberId = getCurrentMemberId();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [userLoans, setUserLoans] = useState<Loan[]>([]);

  useEffect(() => {
    setUserLoans(getUserLoans());
  }, []);

  const myLoans = useMemo(() => {
    const jsonLoans = (loansData as Loan[]).filter(loan => loan.memberId === currentMemberId);
    const localStorageLoans = userLoans.filter(loan => loan.memberId === currentMemberId);
    return [...localStorageLoans, ...jsonLoans];
  }, [currentMemberId, userLoans]);

  const filteredLoans = useMemo(() => {
    if (filterStatus === "ALL") return myLoans;
    return myLoans.filter(loan => loan.status === filterStatus);
  }, [myLoans, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: myLoans.length,
      active: myLoans.filter(l => l.status === "ACTIVE").length,
      overdue: myLoans.filter(l => l.status === "OVERDUE").length,
      returned: myLoans.filter(l => l.status === "RETURNED").length,
    };
  }, [myLoans]);

  const handleReturnBook = (loan: Loan) => {
    const confirmed = window.confirm(
      `Are you sure you want to return "${loan.bookTitle}"?`
    );

    if (confirmed) {
      // If loan is from JSON data, copy it to localStorage first
      const isInLocalStorage = userLoans.some(l => l.id === loan.id);
      if (!isInLocalStorage) {
        // Copy JSON loan to localStorage before returning
        const loanCopy = { ...loan };
        const existingLoans = getUserLoans();
        localStorage.setItem("library_user_loans", JSON.stringify([loanCopy, ...existingLoans]));
      }

      returnBook(loan.id);
      setUserLoans(getUserLoans());
    }
  };

  const handleDeleteLoan = (loan: Loan) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the loan history for "${loan.bookTitle}"?`
    );

    if (confirmed) {
      // If loan is from JSON data, copy it to localStorage first then delete
      const isInLocalStorage = userLoans.some(l => l.id === loan.id);
      if (!isInLocalStorage) {
        // Copy JSON loan to localStorage before deleting
        const loanCopy = { ...loan };
        const existingLoans = getUserLoans();
        localStorage.setItem("library_user_loans", JSON.stringify([loanCopy, ...existingLoans]));
      }

      deleteLoan(loan.id);
      setUserLoans(getUserLoans());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (loan: Loan) => {
    switch (loan.status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <span className="material-symbols-outlined text-base mr-1">check_circle</span>
            Active
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <span className="material-symbols-outlined text-base mr-1">error</span>
            Overdue
          </span>
        );
      case "RETURNED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
            <span className="material-symbols-outlined text-base mr-1">task_alt</span>
            Returned
          </span>
        );
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Loans</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your borrowed books
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Loans</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Returned</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.returned}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus("ALL")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "ALL"
              ? "bg-[#1173d4] text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          All ({myLoans.length})
        </button>
        <button
          onClick={() => setFilterStatus("ACTIVE")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "ACTIVE"
              ? "bg-[#1173d4] text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Active ({stats.active})
        </button>
        <button
          onClick={() => setFilterStatus("OVERDUE")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "OVERDUE"
              ? "bg-[#1173d4] text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Overdue ({stats.overdue})
        </button>
        <button
          onClick={() => setFilterStatus("RETURNED")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "RETURNED"
              ? "bg-[#1173d4] text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Returned ({stats.returned})
        </button>
      </div>

      {/* Loans List */}
      {filteredLoans.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
            library_books
          </span>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {filterStatus === "ALL"
              ? "You don't have any loans yet."
              : `No ${filterStatus.toLowerCase()} loans found.`}
          </p>
          <Link
            to="/client/books"
            className="inline-flex items-center mt-4 px-6 py-3 rounded-lg bg-[#1173d4] text-white font-bold hover:bg-[#1173d4]/90 transition-colors"
          >
            <span className="material-symbols-outlined mr-2">search</span>
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link
                        to={`/client/books/${loan.bookId}`}
                        className="text-xl font-bold text-gray-900 dark:text-white hover:text-[#1173d4] dark:hover:text-[#1173d4] transition-colors"
                      >
                        {loan.bookTitle}
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400">by {loan.bookAuthor}</p>
                    </div>
                    <div className="sm:hidden">
                      {getStatusBadge(loan)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Loan Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {formatDate(loan.loanDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">event</span>
                        {formatDate(loan.dueDate)}
                      </p>
                    </div>
                    {loan.returnDate ? (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Return Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          {formatDate(loan.returnDate)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Days Remaining</p>
                        <p className={`text-sm font-medium flex items-center gap-1 ${
                          loan.status === "OVERDUE"
                            ? "text-red-600 dark:text-red-400"
                            : getDaysRemaining(loan.dueDate) <= 3
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-900 dark:text-white"
                        }`}>
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {loan.status === "OVERDUE"
                            ? `${Math.abs(getDaysRemaining(loan.dueDate))} days overdue`
                            : `${getDaysRemaining(loan.dueDate)} days`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden sm:flex sm:flex-col sm:items-end sm:gap-2">
                  {getStatusBadge(loan)}
                  {loan.status === "ACTIVE" && (
                    <button
                      onClick={() => handleReturnBook(loan)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-[#1173d4] text-white text-sm font-medium hover:bg-[#1173d4]/90 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">assignment_return</span>
                      Return Book
                    </button>
                  )}
                  {loan.status === "OVERDUE" && (
                    <button
                      onClick={() => handleReturnBook(loan)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">assignment_return</span>
                      Return Now
                    </button>
                  )}
                  {loan.status === "RETURNED" && (
                    <button
                      onClick={() => handleDeleteLoan(loan)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">delete</span>
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile action buttons */}
              <div className="mt-4 sm:hidden">
                {loan.status === "ACTIVE" && (
                  <button
                    onClick={() => handleReturnBook(loan)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#1173d4] text-white text-sm font-medium hover:bg-[#1173d4]/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">assignment_return</span>
                    Return Book
                  </button>
                )}
                {loan.status === "OVERDUE" && (
                  <button
                    onClick={() => handleReturnBook(loan)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">assignment_return</span>
                    Return Now
                  </button>
                )}
                {loan.status === "RETURNED" && (
                  <button
                    onClick={() => handleDeleteLoan(loan)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">delete</span>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoans;
