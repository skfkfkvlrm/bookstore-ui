import { useState, useEffect, useMemo, useCallback } from "react";
import type { Approval, ApprovalStatus } from "../../../shared/types";
import SearchInput from "../../../shared/components/common/SearchInput";
import Pagination from "../../../shared/components/common/Pagination";
import { approvalService } from "../../../services/approvalService";
import axios from "axios";
import type { ApiError } from "../../../shared/types";

const ITEMS_PER_PAGE = 10;

const ApprovalList = () => {
  // Top-Level React Hooks
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ApprovalStatus>("ALL");

  // Modal State
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [processing, setProcessing] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await approvalService.getAllApprovals(
        statusFilter === "ALL" ? undefined : statusFilter,
        0,
        100
      );
      setApprovals(response.content);
    } catch {
      setError("품의 결재 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const filteredApprovals = useMemo(() => {
    return approvals.filter((app) => {
      const matchesSearch =
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.department && app.department.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [approvals, searchQuery]);

  const totalPages = Math.ceil(filteredApprovals.length / ITEMS_PER_PAGE) || 1;
  const paginatedApprovals = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApprovals.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApprovals, currentPage]);

  const stats = useMemo(() => ({
    total: approvals.length,
    pending: approvals.filter((a) => a.status === "PENDING").length,
    approved: approvals.filter((a) => a.status === "APPROVED").length,
    rejected: approvals.filter((a) => a.status === "REJECTED").length,
    totalBudget: approvals
      .filter((a) => a.status === "APPROVED")
      .reduce((sum, a) => sum + (Number(a.totalAmount) || 0), 0),
  }), [approvals]);

  const handleApprove = async (approval: Approval) => {
    if (!window.confirm(`'${approval.title}' 품의를 승인하시겠습니까?\n승인 시 자동으로 대량 구매 주문서(Order)가 생성됩니다.`)) {
      return;
    }
    setProcessing(true);
    try {
      await approvalService.approve(approval.id, 1);
      alert("품의가 성공적으로 승인되었으며 자동 발주 주문서가 생성되었습니다.");
      setSelectedApproval(null);
      await fetchApprovals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        alert(apiError?.message ?? "승인 처리 중 오류가 발생했습니다.");
      } else {
        alert("서버 연결에 실패했습니다.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedApproval || !rejectionReason.trim()) {
      alert("반려 사유를 반드시 입력해주세요.");
      return;
    }
    setProcessing(true);
    try {
      await approvalService.reject(selectedApproval.id, rejectionReason, 1);
      alert("품의가 반려 처리되었습니다.");
      setRejectionModalOpen(false);
      setRejectionReason("");
      setSelectedApproval(null);
      await fetchApprovals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        alert(apiError?.message ?? "반려 처리 중 오류가 발생했습니다.");
      } else {
        alert("서버 연결에 실패했습니다.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const variants = {
      PENDING: { bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: "pending", label: "결재 대기" },
      APPROVED: { bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: "check_circle", label: "승인 완료" },
      REJECTED: { bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: "cancel", label: "반려" },
      ORDERED: { bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: "shopping_cart", label: "발주 완료" },
    };
    const v = variants[status] || variants.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${v.bg}`}>
        <span className="material-symbols-outlined text-xs">{v.icon}</span>
        {v.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">도서 구매 품의 및 전자결재함</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            학교, 도서관, 기관 구성원의 희망도서 대량 구매 신청을 심사하고 승인합니다.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1a2332] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 text-sm">전체 품의 신청</span>
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
              <span className="material-symbols-outlined">assignment</span>
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}건</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 text-sm">결재 대기</span>
            <span className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600">
              <span className="material-symbols-outlined">hourglass_top</span>
            </span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}건</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 text-sm">승인 완료</span>
            <span className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-[#2f9e5f]">
              <span className="material-symbols-outlined">verified</span>
            </span>
          </div>
          <p className="text-2xl font-bold text-[#2f9e5f] mt-2">{stats.approved}건</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 text-sm">승인 총 예산</span>
            <span className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600">
              <span className="material-symbols-outlined">payments</span>
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-2">{stats.totalBudget.toLocaleString()}원</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === tab
                    ? "bg-[#2f9e5f] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab === "ALL" ? "전체 보기" : tab === "PENDING" ? "대기중" : tab === "APPROVED" ? "승인됨" : "반려됨"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full sm:w-72">
            <SearchInput
              value={searchQuery}
              onSearch={setSearchQuery}
              placeholder="제목, 기안자, 부서 검색..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
              <p className="text-sm">품의 문서를 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 text-sm">{error}</div>
          ) : paginatedApprovals.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">inbox</span>
              <p className="text-sm">해당 조건의 품의 문서가 없습니다.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#101922] text-xs font-semibold text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="py-3 px-4">품의 번호</th>
                  <th className="py-3 px-4">품의 제목</th>
                  <th className="py-3 px-4">기안자 (부서)</th>
                  <th className="py-3 px-4">신청 도서</th>
                  <th className="py-3 px-4 text-right">추정 예산</th>
                  <th className="py-3 px-4 text-center">결재 상태</th>
                  <th className="py-3 px-4">상신 일시</th>
                  <th className="py-3 px-4 text-center">심사</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedApprovals.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-700 dark:text-gray-300">
                      #{app.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                      {app.title}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                      <div>{app.applicantName}</div>
                      <div className="text-xs text-gray-400">{app.department || "일반"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                      {app.items?.length || 0}종 ({app.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}권)
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#2f9e5f]">
                      {Number(app.totalAmount).toLocaleString()}원
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {new Date(app.submittedDate).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedApproval(app)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-[#2f9e5f]/10 text-[#2f9e5f] hover:bg-[#2f9e5f]/20 transition-colors"
                      >
                        상세/심사
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* 품의 상세 및 결재 심사 모달 */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2f9e5f]">description</span>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  품의 문서 상세 (No. #{selectedApproval.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="my-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-[#101922] p-4 rounded-xl">
                <div>
                  <span className="text-gray-500 block text-xs">기안자 / 부서</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedApproval.applicantName} ({selectedApproval.department || "일반"})</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">결재 상태</span>
                  <div className="mt-0.5">{getStatusBadge(selectedApproval.status)}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block text-xs">품의 제목</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedApproval.title}</span>
                </div>
                {selectedApproval.purpose && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs">신청 목적 및 사유</span>
                    <p className="text-gray-700 dark:text-gray-300 text-xs mt-1 whitespace-pre-wrap">{selectedApproval.purpose}</p>
                  </div>
                )}
                {selectedApproval.rejectionReason && (
                  <div className="col-span-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
                    <span className="font-bold block mb-0.5">반려 사유:</span>
                    {selectedApproval.rejectionReason}
                  </div>
                )}
                {selectedApproval.orderId && (
                  <div className="col-span-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-700 dark:text-green-300 flex items-center justify-between">
                    <span>✅ 승인 연계 자동 주문서가 생성되었습니다. (주문 ID: #{selectedApproval.orderId})</span>
                  </div>
                )}
              </div>

              {/* Requested Book Items */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  신청 도서 목록 ({selectedApproval.items?.length || 0}건)
                </h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-800 font-semibold text-gray-600 dark:text-gray-300">
                      <tr>
                        <th className="p-2.5">도서명</th>
                        <th className="p-2.5">저자</th>
                        <th className="p-2.5 text-center">수량</th>
                        <th className="p-2.5 text-right">추정 단가</th>
                        <th className="p-2.5 text-right">합계</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {selectedApproval.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2.5 font-medium text-gray-900 dark:text-white">{item.bookTitle}</td>
                          <td className="p-2.5 text-gray-500">{item.bookAuthor || "-"}</td>
                          <td className="p-2.5 text-center font-bold">{item.quantity}권</td>
                          <td className="p-2.5 text-right text-gray-500">{Number(item.estimatedPrice).toLocaleString()}원</td>
                          <td className="p-2.5 text-right font-bold text-[#2f9e5f]">{Number(item.totalPrice).toLocaleString()}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-bold pt-2">
                <span>총 소요 추정 예산</span>
                <span className="text-xl text-[#2f9e5f]">{Number(selectedApproval.totalAmount).toLocaleString()}원</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                닫기
              </button>
              {selectedApproval.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => setRejectionModalOpen(true)}
                    className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    반려
                  </button>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleApprove(selectedApproval)}
                    className="px-5 py-2 text-sm rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    결재 승인 (주문 생성)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 반려 사유 입력 서브 모달 */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a2332] rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">품의 반려 사유 입력</h3>
            <p className="text-xs text-gray-500 mb-4">신청자에게 전달될 반려 사유를 구체적으로 작성해주세요.</p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="예: 예산 초과 또는 기보유 도서 중복으로 인한 반려"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                취소
              </button>
              <button
                type="button"
                disabled={processing || !rejectionReason.trim()}
                onClick={handleRejectSubmit}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50"
              >
                반려 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalList;