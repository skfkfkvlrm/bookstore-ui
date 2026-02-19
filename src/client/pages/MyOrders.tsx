import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../../shared/types";
import { orderService } from "../../services/orderService";
import axios from "axios";
import type { ApiError } from "../../shared/types";

type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const orderFilterLabel: Record<FilterStatus, string> = {
  ALL: "전체",
  PENDING: "접수",
  CONFIRMED: "확정",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "취소",
};

const MyOrders = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 전체 주문 조회 (최대 100개, 필요 시 페이징 추가)
      const response = await orderService.getOrders(0, 100);
      setOrders(response.content);
    } catch {
      setError("주문 내역을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === "ALL") return orders;
    return orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  }), [orders]);

  const handleCancelOrder = async (order: Order) => {
    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      alert("이미 배송 완료 또는 취소된 주문입니다.");
      return;
    }

    const confirmed = window.confirm(`#${order.id} 주문을 취소하시겠습니까?`);
    if (!confirmed) return;

    try {
      await orderService.cancelOrder(order.id);
      await fetchOrders();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        alert(apiError?.message ?? "주문 취소 중 오류가 발생했습니다.");
      } else {
        alert("서버에 연결할 수 없습니다.");
      }
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-300", icon: "schedule", label: "접수" },
      CONFIRMED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300", icon: "check_circle", label: "확정" },
      SHIPPED: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300", icon: "local_shipping", label: "배송 중" },
      DELIVERED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300", icon: "task_alt", label: "배송 완료" },
      CANCELLED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300", icon: "cancel", label: "취소됨" },
    };
    const variant = variants[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variant.bg} ${variant.text}`}>
        <span className="material-symbols-outlined text-base mr-1">{variant.icon}</span>
        {variant.label}
      </span>
    );
  };

  const statCounts: Record<FilterStatus, number> = {
    ALL: stats.total,
    PENDING: stats.pending,
    CONFIRMED: stats.confirmed,
    SHIPPED: stats.shipped,
    DELIVERED: stats.delivered,
    CANCELLED: stats.cancelled,
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">내 주문 내역</h1>
        <p className="text-gray-600 dark:text-gray-400">주문 이력을 확인하고 배송 현황을 추적하세요</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {[
          { label: "총 주문", value: stats.total, color: "text-gray-900 dark:text-white" },
          { label: "접수", value: stats.pending, color: "text-yellow-600 dark:text-yellow-400" },
          { label: "확정", value: stats.confirmed, color: "text-blue-600 dark:text-blue-400" },
          { label: "배송 중", value: stats.shipped, color: "text-purple-600 dark:text-purple-400" },
          { label: "배송 완료", value: stats.delivered, color: "text-green-600 dark:text-green-400" },
          { label: "취소", value: stats.cancelled, color: "text-red-600 dark:text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? "bg-[#2f9e5f] text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {orderFilterLabel[status]} ({statCounts[status]})
          </button>
        ))}
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
            onClick={fetchOrders}
            className="mt-4 px-6 py-2 rounded-lg bg-[#2f9e5f] text-white font-medium hover:bg-[#2f9e5f]/90"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && (
        filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">receipt_long</span>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {filterStatus === "ALL" ? "아직 주문 내역이 없습니다." : `${orderFilterLabel[filterStatus]} 상태의 주문이 없습니다.`}
            </p>
            <Link
              to="/client/books"
              className="inline-flex items-center mt-4 px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 transition-colors"
            >
              <span className="material-symbols-outlined mr-2">shopping_bag</span>
              쇼핑 시작하기
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-gray-50 dark:bg-[#0f1621] px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">주문 번호</p>
                      <p className="font-bold text-gray-900 dark:text-white">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">주문 일시</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm mr-1">cancel</span>
                        주문 취소
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <Link
                            to={`/client/books/${item.bookId}`}
                            className="font-bold text-gray-900 dark:text-white hover:text-[#2f9e5f] dark:hover:text-[#2f9e5f] transition-colors"
                          >
                            {item.bookTitle}
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400">저자 {item.bookAuthor}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">수량: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#2f9e5f]">{item.price.toLocaleString()}원</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            소계: {(item.price * item.quantity).toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">총 결제 금액</span>
                    <span className="text-2xl font-bold text-[#2f9e5f]">{order.totalAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MyOrders;
