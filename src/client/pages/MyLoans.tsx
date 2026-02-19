import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Loan, LoanStatus } from "../../shared/types";
import { loanService } from "../../services/loanService";
import axios from "axios";
import type { ApiError } from "../../shared/types";

type FilterStatus = "ALL" | LoanStatus;

const statusLabelMap: Record<FilterStatus, string> = {
  ALL: "전체",
  ACTIVE: "대여 중",
  OVERDUE: "연체",
  RETURNED: "반납 완료",
  CANCELLED: "취소됨",
};

const MyLoans = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loanService.getMyLoans();
      setLoans(data);
    } catch {
      setError("대출 내역을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const filteredLoans = useMemo(() => {
    if (filterStatus === "ALL") return loans;
    return loans.filter((loan) => loan.status === filterStatus);
  }, [loans, filterStatus]);

  const stats = useMemo(() => ({
    total: loans.length,
    active: loans.filter((l) => l.status === "ACTIVE").length,
    overdue: loans.filter((l) => l.status === "OVERDUE").length,
    returned: loans.filter((l) => l.status === "RETURNED").length,
    cancelled: loans.filter((l) => l.status === "CANCELLED").length,
  }), [loans]);

  const handleReturnBook = async (loan: Loan) => {
    const confirmed = window.confirm(`"${loan.bookTitle}"을(를) 반납하시겠습니까?`);
    if (!confirmed) return;

    try {
      await loanService.returnLoan(loan.id);
      await fetchLoans();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        alert(apiError?.message ?? "반납 처리 중 오류가 발생했습니다.");
      } else {
        alert("서버에 연결할 수 없습니다.");
      }
    }
  };

  const handleCancelLoan = async (loan: Loan) => {
    const confirmed = window.confirm(`"${loan.bookTitle}" 대출 신청을 취소하시겠습니까?`);
    if (!confirmed) return;

    try {
      await loanService.cancelLoan(loan.id);
      await fetchLoans();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        alert(apiError?.message ?? "취소 처리 중 오류가 발생했습니다.");
      } else {
        alert("서버에 연결할 수 없습니다.");
      }
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
            <span className="material-symbols-outlined text-base mr-1">cancel</span>
            취소됨
          </span>
        );
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">내 대출 내역</h1>
        <p className="text-gray-600 dark:text-gray-400">대출한 도서를 확인하고 관리하세요</p>
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
        {(["ALL", "ACTIVE", "OVERDUE", "RETURNED", "CANCELLED"] as FilterStatus[]).map((status) => {
          const count = status === "ALL" ? stats.total
            : status === "ACTIVE" ? stats.active
            : status === "OVERDUE" ? stats.overdue
            : status === "RETURNED" ? stats.returned
            : stats.cancelled;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? "bg-[#2f9e5f] text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {statusLabelMap[status]} ({count})
            </button>
          );
        })}
      </div>

      {/* Loading / Error */}
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
            onClick={fetchLoans}
            className="mt-4 px-6 py-2 rounded-lg bg-[#2f9e5f] text-white font-medium hover:bg-[#2f9e5f]/90"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Loans List */}
      {!loading && !error && (
        filteredLoans.length === 0 ? (
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
              className="inline-flex items-center mt-4 px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 transition-colors"
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
                          className="text-xl font-bold text-gray-900 dark:text-white hover:text-[#2f9e5f] dark:hover:text-[#2f9e5f] transition-colors"
                        >
                          {loan.bookTitle}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400">저자 {loan.bookAuthor}</p>
                      </div>
                      <div className="sm:hidden">{getStatusBadge(loan)}</div>
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
                      ) : loan.status === "ACTIVE" || loan.status === "OVERDUE" ? (
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
                              ? `${loan.overdueDays ?? Math.abs(getDaysRemaining(loan.dueDate))}일 연체`
                              : `${getDaysRemaining(loan.dueDate)}일 남음`}
                          </p>
                          {loan.overdueFee != null && loan.overdueFee > 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              연체료: {loan.overdueFee.toLocaleString()}원
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="hidden sm:flex sm:flex-col sm:items-end sm:gap-2">
                    {getStatusBadge(loan)}
                    {(loan.status === "ACTIVE" || loan.status === "OVERDUE") && (
                      <button
                        onClick={() => handleReturnBook(loan)}
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                          loan.status === "OVERDUE"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-[#2f9e5f] hover:bg-[#2f9e5f]/90"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm mr-1">assignment_return</span>
                        {loan.status === "OVERDUE" ? "지금 반납" : "반납하기"}
                      </button>
                    )}
                    {loan.status === "ACTIVE" && (
                      <button
                        onClick={() => handleCancelLoan(loan)}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm mr-1">cancel</span>
                        취소
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile action buttons */}
                <div className="mt-4 sm:hidden flex gap-2">
                  {(loan.status === "ACTIVE" || loan.status === "OVERDUE") && (
                    <button
                      onClick={() => handleReturnBook(loan)}
                      className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                        loan.status === "OVERDUE"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-[#2f9e5f] hover:bg-[#2f9e5f]/90"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm mr-1">assignment_return</span>
                      {loan.status === "OVERDUE" ? "지금 반납" : "반납하기"}
                    </button>
                  )}
                  {loan.status === "ACTIVE" && (
                    <button
                      onClick={() => handleCancelLoan(loan)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">cancel</span>
                      취소
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MyLoans;
