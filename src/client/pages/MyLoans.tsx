import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Loan } from "../../shared/types";
import loansData from "../../shared/data/loans.json";
import { getUserLoans, getCurrentMemberId, returnBook, deleteLoan, addLoan } from "../utils/loanStorage";

type FilterStatus = "ALL" | "ACTIVE" | "OVERDUE" | "RETURNED";

const MyLoans = () => {
  const currentMemberId = getCurrentMemberId();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const statusLabelMap: Record<FilterStatus, string> = {
    ALL: "전체",
    ACTIVE: "대여 중",
    OVERDUE: "연체",
    RETURNED: "반납 완료",
  };

  useEffect(() => {
    setUserLoans(getUserLoans());
  }, []);

  const myLoans = useMemo(() => {
    const localStorageLoans = userLoans.filter(loan => loan.memberId === currentMemberId);
    const localStorageLoanIds = new Set(localStorageLoans.map(loan => loan.id));

    // localStorage에 있는 대출은 JSON에서 제외 (중복 방지)
    const jsonLoans = (loansData as Loan[])
      .filter(loan => loan.memberId === currentMemberId && !localStorageLoanIds.has(loan.id));

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
      `"${loan.bookTitle}"을(를) 반납하시겠습니까?`
    );

    if (confirmed) {
      const isInLocalStorage = userLoans.some(l => l.id === loan.id);
      let targetLoanId = loan.id;

      if (!isInLocalStorage) {
        // JSON 대출을 localStorage로 복사 (새로운 ID 부여)
        const { id, ...loanData } = loan;
        const newLoan = addLoan(loanData);
        targetLoanId = newLoan.id;
      }

      returnBook(targetLoanId);
      setUserLoans(getUserLoans());
    }
  };

  const handleDeleteLoan = (loan: Loan) => {
    const confirmed = window.confirm(
      `"${loan.bookTitle}" 대출 기록을 삭제하시겠습니까?`
    );

    if (confirmed) {
      const isInLocalStorage = userLoans.some(l => l.id === loan.id);
      let targetLoanId = loan.id;

      if (!isInLocalStorage) {
        // JSON 대출을 localStorage로 복사 (새로운 ID 부여)
        const { id, ...loanData } = loan;
        const newLoan = addLoan(loanData);
        targetLoanId = newLoan.id;
      }

      deleteLoan(targetLoanId);
      setUserLoans(getUserLoans());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
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
            대여 중
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <span className="material-symbols-outlined text-base mr-1">error</span>
            연체
          </span>
        );
      case "RETURNED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
            <span className="material-symbols-outlined text-base mr-1">task_alt</span>
            반납 완료
          </span>
        );
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">내 대출 내역</h1>
        <p className="text-gray-600 dark:text-gray-400">
          대출한 도서를 확인하고 관리하세요
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">총 대출 건수</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">대여 중</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">연체</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">반납 완료</p>
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
          전체 ({myLoans.length})
        </button>
        <button
          onClick={() => setFilterStatus("ACTIVE")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "ACTIVE"
              ? "bg-[#1173d4] text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          대여 중 ({stats.active})
        </button>
        <button
          onClick={() => setFilterStatus("OVERDUE")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "OVERDUE"
              ? "bg-[#1173d4] text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          연체 ({stats.overdue})
        </button>
        <button
          onClick={() => setFilterStatus("RETURNED")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "RETURNED"
              ? "bg-[#1173d4] text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          반납 완료 ({stats.returned})
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
              ? "대출한 도서가 아직 없습니다."
              : `${statusLabelMap[filterStatus]} 상태의 내역이 없습니다.`}
          </p>
          <Link
            to="/client/books"
            className="inline-flex items-center mt-4 px-6 py-3 rounded-lg bg-[#1173d4] text-white font-bold hover:bg-[#1173d4]/90 transition-colors"
          >
            <span className="material-symbols-outlined mr-2">search</span>
            도서 둘러보기
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
                      <p className="text-gray-600 dark:text-gray-400">저자 {loan.bookAuthor}</p>
                    </div>
                    <div className="sm:hidden">
                      {getStatusBadge(loan)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">대출일</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {formatDate(loan.loanDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">반납 기한</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">event</span>
                        {formatDate(loan.dueDate)}
                      </p>
                    </div>
                    {loan.returnDate ? (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">반납일</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          {formatDate(loan.returnDate)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">남은 기간</p>
                        <p className={`text-sm font-medium flex items-center gap-1 ${
                          loan.status === "OVERDUE"
                            ? "text-red-600 dark:text-red-400"
                            : getDaysRemaining(loan.dueDate) <= 3
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-900 dark:text-white"
                        }`}>
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {loan.status === "OVERDUE"
                            ? `${Math.abs(getDaysRemaining(loan.dueDate))}일 연체`
                            : `${getDaysRemaining(loan.dueDate)}일 남음`}
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
                      반납하기
                    </button>
                  )}
                  {loan.status === "OVERDUE" && (
                    <button
                      onClick={() => handleReturnBook(loan)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">assignment_return</span>
                      지금 반납
                    </button>
                  )}
                  {loan.status === "RETURNED" && (
                    <button
                      onClick={() => handleDeleteLoan(loan)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">delete</span>
                      삭제
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
                    반납하기
                  </button>
                )}
                {loan.status === "OVERDUE" && (
                  <button
                    onClick={() => handleReturnBook(loan)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">assignment_return</span>
                    지금 반납
                  </button>
                )}
                {loan.status === "RETURNED" && (
                  <button
                    onClick={() => handleDeleteLoan(loan)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">delete</span>
                    삭제
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
