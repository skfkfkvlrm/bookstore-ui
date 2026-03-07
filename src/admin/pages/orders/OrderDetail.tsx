import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import { orderService } from "../../../services/orderService";
import axios from "axios";
import type { ApiError } from "../../../shared/types";

const COURIER_COMPANIES = ["CJ대한통운", "한진택배", "롯데택배", "우체국택배", "로젠택배"];

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [courierCompany, setCourierCompany] = useState(COURIER_COMPANIES[0]);
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    orderService.getOrder(Number(id))
      .then(setOrder)
      .catch(() => setError("주문 정보를 불러오는 데 실패했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  const getStatusVariant = (status: Order["status"]) => {
    const statusMap = {
      PENDING: "pending" as const,
      CONFIRMED: "confirmed" as const,
      SHIPPED: "shipped" as const,
      DELIVERED: "delivered" as const,
      CANCELLED: "cancelled" as const,
    };
    return statusMap[status];
  };

  const statusLabelMap: Record<Order["status"], string> = {
    PENDING: "접수",
    CONFIRMED: "확정",
    SHIPPED: "배송 중",
    DELIVERED: "배송 완료",
    CANCELLED: "취소됨",
  };

  const handleStatusChange = async (action: "confirm" | "ship" | "deliver" | "cancel") => {
    if (!order) return;
    const actionLabels = {
      confirm: "확정",
      ship: "배송 중으로",
      deliver: "배송 완료로",
      cancel: "취소",
    };
    if (!window.confirm(`주문을 ${actionLabels[action]} 처리하시겠습니까?`)) return;

    if (action === "ship") {
      setShowShipModal(true);
      return;
    }

    setActionLoading(true);
    try {
      let updated: Order;
      switch (action) {
        case "confirm": updated = await orderService.confirmOrder(order.id); break;
        case "deliver": updated = await orderService.deliverOrder(order.id); break;
        case "cancel": updated = await orderService.cancelOrder(order.id); break;
        default: throw new Error("Unsupported action");
      }
      setOrder(updated);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        alert(apiError?.message ?? "주문 상태 변경 중 오류가 발생했습니다.");
      } else {
        alert("서버에 연결할 수 없습니다.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipConfirm = async () => {
    if (!order || !trackingNumber.trim()) { alert("운송장 번호를 입력해주세요."); return; }
    setShowShipModal(false);
    setActionLoading(true);
    try {
      const updated = await orderService.shipOrder(order.id, trackingNumber.trim(), courierCompany);
      setOrder(updated);
      setTrackingNumber("");
      setCourierCompany(COURIER_COMPANIES[0]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        alert(apiError?.message ?? "배송 처리 중 오류가 발생했습니다.");
      } else {
        alert("서버에 연결할 수 없습니다.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined text-4xl text-[#2f9e5f] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto text-center py-10">
        <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
          {error ?? "주문을 찾을 수 없습니다."}
        </h2>
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/orders")}
          className="mt-6"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to List
        </Button>
      </div>
    );
  }

  const orderItems = order.orderItems ?? [];
  const subtotal = order.finalAmount ?? order.totalAmount;

  const shipModal = showShipModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2f9e5f]">local_shipping</span>
          배송 정보 입력
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">택배사</label>
            <select
              value={courierCompany}
              onChange={(e) => setCourierCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
            >
              {COURIER_COMPANIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">운송장 번호</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="운송장 번호를 입력하세요"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
              autoFocus
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={() => { setShowShipModal(false); setTrackingNumber(""); }}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleShipConfirm}
            className="px-4 py-2 rounded-lg bg-[#2f9e5f] text-white font-medium hover:bg-[#2f9e5f]/90 transition-colors"
          >
            배송 시작
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {shipModal}
      <div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Order Details</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Order <span className="font-mono text-[#2f9e5f]">#{String(order.id).padStart(8, "0")}</span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">이름</p>
            <p className="font-medium text-gray-900 dark:text-white">{order.memberName ?? "-"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">이메일</p>
            <p className="font-medium text-gray-900 dark:text-white">{order.memberEmail ?? "-"}</p>
          </div>
        </div>
        <div className="p-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Information</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Order Date</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {new Date(order.orderDate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
              <dd>
                <Badge variant={getStatusVariant(order.status)}>{statusLabelMap[order.status]}</Badge>
              </dd>
            </div>
            {order.payment?.method && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">결제 수단</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {{ CREDIT_CARD: "신용카드", DEBIT_CARD: "체크카드", BANK_TRANSFER: "계좌이체", KAKAO_PAY: "카카오페이", NAVER_PAY: "네이버페이", TOSS_PAY: "토스페이" }[order.payment.method] ?? order.payment.method}
                </dd>
              </div>
            )}
            {order.payment?.status && (
              <div className="flex justify-between items-center">
                <dt className="text-sm text-gray-600 dark:text-gray-400">결제 상태</dt>
                <dd>
                  <Badge
                    variant={
                      order.payment.status === "COMPLETED"
                        ? "delivered"
                        : order.payment.status === "FAILED"
                        ? "cancelled"
                        : "pending"
                    }
                  >
                    {order.payment.status}
                  </Badge>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            주문 상품 ({orderItems.length}건)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Author</th>
                <th className="px-6 py-3 text-center">Quantity</th>
                <th className="px-6 py-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{item.bookTitle}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.bookAuthor}</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                    {item.price.toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>소계</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <span>총 결제 금액</span>
              <span>{order.totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Actions</h4>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handlePrintInvoice} disabled={actionLoading}>
              <span className="material-symbols-outlined">print</span>
              Print Invoice
            </Button>
            {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
              <Button
                variant="danger"
                onClick={() => handleStatusChange("cancel")}
                disabled={actionLoading}
              >
                <span className="material-symbols-outlined">cancel</span>
                주문 취소
              </Button>
            )}
          </div>

          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                상태 변경
              </h5>
              <div className="flex gap-2 flex-wrap">
                {order.status === "PENDING" && (
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange("confirm")}
                    size="sm"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined">check_circle</span>
                    )}
                    주문 확정
                  </Button>
                )}
                {order.status === "CONFIRMED" && (
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange("ship")}
                    size="sm"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined">local_shipping</span>
                    )}
                    배송 시작
                  </Button>
                )}
                {order.status === "SHIPPED" && (
                  <Button
                    variant="success"
                    onClick={() => handleStatusChange("deliver")}
                    size="sm"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined">task_alt</span>
                    )}
                    배송 완료
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => navigate("/admin/orders")}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to List
        </Button>
      </div>
    </div>
  );
};

export default OrderDetail;
