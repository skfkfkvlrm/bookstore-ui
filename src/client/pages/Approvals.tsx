import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../utils/authStorage";
import { approvalService } from "../../services/approvalService";
import type { Approval, ApprovalStatus } from "../../shared/types";
import axios from "axios";
import type { ApiError } from "../../shared/types";

interface BookRow {
  bookTitle: string;
  bookAuthor: string;
  isbn: string;
  quantity: number;
  estimatedPrice: number;
}

const Approvals = () => {
  const user = getCurrentUser();

  // Top-Level State Declarations
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bookRows, setBookRows] = useState<BookRow[]>([
    { bookTitle: "", bookAuthor: "", isbn: "", quantity: 1, estimatedPrice: 20000 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Selected Detail Modal
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);

  const fetchMyApprovals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await approvalService.getMyApprovals(user.id, 0, 100);
      setApprovals(response.content);
    } catch {
      setError("내 품의 내역을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyApprovals();
  }, [fetchMyApprovals]);

  const totalEstimatedBudget = useMemo(() => {
    return bookRows.reduce((sum, row) => sum + (row.quantity * row.estimatedPrice), 0);
  }, [bookRows]);

  const handleAddBookRow = () => {
    setBookRows((prev) => [
      ...prev,
      { bookTitle: "", bookAuthor: "", isbn: "", quantity: 1, estimatedPrice: 15000 },
    ]);
  };

  const handleRemoveBookRow = (index: number) => {
    if (bookRows.length === 1) return;
    setBookRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: keyof BookRow, value: string | number) => {
    setBookRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!title.trim()) {
      setFormError("품의 제목을 입력해주세요.");
      return;
    }
    const hasEmptyTitle = bookRows.some((r) => !r.bookTitle.trim());
    if (hasEmptyTitle) {
      setFormError("모든 신청 도서의 제목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await approvalService.createApproval({
        memberId: user.id,
        title,
        department,
        purpose,
        items: bookRows.map((r) => ({
          bookTitle: r.bookTitle,
          bookAuthor: r.bookAuthor || undefined,
          isbn: r.isbn || undefined,
          quantity: r.quantity,
          estimatedPrice: r.estimatedPrice,
        })),
      });

      alert("도서 구매 품의가 성공적으로 상신(제출)되었습니다.\n관리자 심사 후 승인 처리됩니다.");
      setTitle("");
      setDepartment("");
      setPurpose("");
      setBookRows([{ bookTitle: "", bookAuthor: "", isbn: "", quantity: 1, estimatedPrice: 20000 }]);
      setActiveTab("list");
      await fetchMyApprovals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        setFormError(apiError?.message ?? "품의 상신 중 오류가 발생했습니다.");
      } else {
        setFormError("서버 연결에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelApproval = async (app: Approval) => {
    if (!window.confirm(`'${app.title}' 품의를 정말 취소(회수)하시겠습니까?`)) {
      return;
    }
    try {
      await approvalService.cancel(app.id, user?.id);
      alert("품의서 상신이 성공적으로 취소되었습니다.");
      if (selectedApproval?.id === app.id) {
        setSelectedApproval(null);
      }
      await fetchMyApprovals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        alert(apiError?.message ?? "품의 취소 중 오류가 발생했습니다.");
      } else {
        alert("서버 연결에 실패했습니다.");
      }
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const variants = {
      PENDING: { bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: "pending", label: "결재 대기" },
      APPROVED: { bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: "check_circle", label: "승인 완료" },
      REJECTED: { bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: "cancel", label: "반려" },
      ORDERED: { bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: "shopping_cart", label: "발주 완료" },
      CANCELLED: { bg: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: "cancel_presentation", label: "상신 취소" },
    };
    const v = variants[status] || variants.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${v.bg}`}>
        <span className="material-symbols-outlined text-xs">{v.icon}</span>
        {v.label}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">assignment</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">로그인이 필요한 서비스입니다</h2>
        <p className="text-gray-500 mb-6 text-sm">도서 구매 품의 및 전자결재를 이용하시려면 로그인해주세요.</p>
        <Link
          to="/client/login"
          className="inline-flex items-center px-6 py-2.5 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2f9e5f] text-3xl">assignment</span>
            도서 구매 품의(결재)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            학교, 도서관, 연구실에 필요한 희망도서 대량 구매 품의서를 작성하고 결재를 진행합니다.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "list"
                ? "bg-white dark:bg-[#1a2332] text-[#2f9e5f] shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            내 품의 내역 ({approvals.length})
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "form"
                ? "bg-white dark:bg-[#1a2332] text-[#2f9e5f] shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            새 품의서 작성
          </button>
        </div>
      </div>

      {/* Tab 1: 내 품의 목록 */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
              <p className="text-sm">품의 내역을 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 text-sm">{error}</div>
          ) : approvals.length === 0 ? (
            <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-400 mb-3">post_add</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">상신된 품의서가 없습니다</h3>
              <p className="text-sm text-gray-500 mb-6">연구 및 학습에 필요한 도서 구매 품의서를 지금 작성해보세요.</p>
              <button
                onClick={() => setActiveTab("form")}
                className="px-5 py-2.5 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 transition-colors"
              >
                품의서 작성하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {approvals.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-gray-500">#{app.id}</span>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">{app.title}</h3>
                    </div>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-3 text-xs text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="block text-gray-400 mb-0.5">신청 부서</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{app.department || "개인 신청"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 mb-0.5">신청 도서</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {app.items?.length || 0}종 ({app.items?.reduce((s, i) => s + i.quantity, 0) || 0}권)
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400 mb-0.5">총 소요 예산</span>
                      <span className="font-bold text-[#2f9e5f] text-sm">{Number(app.totalAmount).toLocaleString()}원</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 mb-0.5">상신 일시</span>
                      <span>{new Date(app.submittedDate).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  {app.rejectionReason && (
                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
                      <span className="font-bold">반려 사유: </span>{app.rejectionReason}
                    </div>
                  )}

                  {app.orderId && (
                    <div className="mt-2 p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-700 dark:text-green-300 flex items-center justify-between">
                      <span>✅ 승인 완료! 연계 주문이 접수되었습니다. (주문 번호: #{app.orderId})</span>
                      <Link to="/client/orders" className="underline font-bold">주문 내역 보기</Link>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end gap-2">
                    {app.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleCancelApproval(app)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                        품의 취소
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedApproval(app)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      신청 도서 목록 확인
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: 새 품의서 작성 폼 */}
      {activeTab === "form" && (
        <form onSubmit={handleSubmitApproval} className="space-y-6">
          <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2f9e5f]">edit_note</span>
              품의 기본 정보
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  품의 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 2026-2학기 AI 및 클라우드 전공 추천도서 구매 품의"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  신청 부서 / 학과
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="예: 소프트웨어공학부, 중앙도서관"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                신청 목적 및 사유
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="도서 구입 목적 및 연구/학습 활용 계획을 입력하세요"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
              />
            </div>
          </div>

          {/* Book Items */}
          <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2f9e5f]">library_books</span>
                신청 도서 목록 ({bookRows.length}종)
              </h2>
              <button
                type="button"
                onClick={handleAddBookRow}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#2f9e5f] text-[#2f9e5f] hover:bg-[#2f9e5f]/10 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                도서 추가
              </button>
            </div>

            <div className="space-y-3">
              {bookRows.map((row, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-[#101922] rounded-xl border border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      도서명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={row.bookTitle}
                      onChange={(e) => handleRowChange(idx, "bookTitle", e.target.value)}
                      placeholder="도서 제목"
                      required
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2332] text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">저자</label>
                    <input
                      type="text"
                      value={row.bookAuthor}
                      onChange={(e) => handleRowChange(idx, "bookAuthor", e.target.value)}
                      placeholder="저자명"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2332] text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">수량</label>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(idx, "quantity", Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2332] text-xs text-gray-900 dark:text-white font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">추정 단가(원)</label>
                    <input
                      type="number"
                      min="100"
                      step="500"
                      value={row.estimatedPrice}
                      onChange={(e) => handleRowChange(idx, "estimatedPrice", Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2332] text-xs text-gray-900 dark:text-white text-right"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between gap-2">
                    <div className="text-right flex-1">
                      <span className="block text-[10px] text-gray-400">소계</span>
                      <span className="font-bold text-xs text-[#2f9e5f]">
                        {(row.quantity * row.estimatedPrice).toLocaleString()}원
                      </span>
                    </div>
                    {bookRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBookRow(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">총 추정 소요 예산</span>
              <span className="text-2xl font-black text-[#2f9e5f]">{totalEstimatedBudget.toLocaleString()}원</span>
            </div>
          </div>

          {formError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              작성 취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-2.5 rounded-xl bg-[#2f9e5f] text-white font-bold text-sm hover:bg-[#2f9e5f]/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  <span>상신 중...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>전자결재 상신하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 품의 도서 상세 모달 */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                신청 도서 목록 (#{selectedApproval.id} - {selectedApproval.title})
              </h3>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 mb-4">
              {selectedApproval.items?.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-[#101922] rounded-lg text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{item.bookTitle}</p>
                    <p className="text-gray-500">{item.bookAuthor || "저자 미기재"} · 수량: {item.quantity}권</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#2f9e5f]">{Number(item.totalPrice).toLocaleString()}원</p>
                    <p className="text-[10px] text-gray-400">(단가 {Number(item.estimatedPrice).toLocaleString()}원)</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 text-sm font-bold">
              <span>총 소요 예산</span>
              <span className="text-lg text-[#2f9e5f]">{Number(selectedApproval.totalAmount).toLocaleString()}원</span>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              {selectedApproval.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => handleCancelApproval(selectedApproval)}
                  className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  품의 취소
                </button>
              )}
              <button
                onClick={() => setSelectedApproval(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-semibold hover:bg-gray-200"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;