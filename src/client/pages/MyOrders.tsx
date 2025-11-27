import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../../shared/types";
import ordersData from "../../shared/data/orders.json";
import { getUserOrders, getCurrentUserEmail, cancelOrder } from "../utils/orderStorage";

type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const MyOrders = () => {
  const currentUserEmail = getCurrentUserEmail();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    setUserOrders(getUserOrders());
  }, []);

  const myOrders = useMemo(() => {
    const localStorageOrders = userOrders.filter(order => order.customerEmail === currentUserEmail);
    const localStorageOrderIds = new Set(localStorageOrders.map(order => order.id));

    // localStorage에 있는 주문은 JSON에서 제외 (중복 방지)
    const jsonOrders = (ordersData as Order[])
      .filter(order => order.customerEmail === currentUserEmail && !localStorageOrderIds.has(order.id));

    return [...localStorageOrders, ...jsonOrders];
  }, [currentUserEmail, userOrders]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === "ALL") return myOrders;
    return myOrders.filter(order => order.status === filterStatus);
  }, [myOrders, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: myOrders.length,
      pending: myOrders.filter(o => o.status === "PENDING").length,
      confirmed: myOrders.filter(o => o.status === "CONFIRMED").length,
      shipped: myOrders.filter(o => o.status === "SHIPPED").length,
      delivered: myOrders.filter(o => o.status === "DELIVERED").length,
      cancelled: myOrders.filter(o => o.status === "CANCELLED").length,
    };
  }, [myOrders]);

  const handleCancelOrder = (order: Order) => {
    const isInLocalStorage = userOrders.some(o => o.id === order.id);

    if (!isInLocalStorage) {
      alert("Cannot cancel orders from JSON data.");
      return;
    }

    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      alert("This order has already been delivered or cancelled.");
      return;
    }

    const confirmed = window.confirm(`Cancel order #${order.id}?`);
    if (confirmed) {
      cancelOrder(order.id);
      setUserOrders(getUserOrders());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-300", icon: "schedule", label: "Pending" },
      CONFIRMED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300", icon: "check_circle", label: "Confirmed" },
      SHIPPED: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300", icon: "local_shipping", label: "Shipped" },
      DELIVERED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300", icon: "task_alt", label: "Delivered" },
      CANCELLED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300", icon: "cancel", label: "Cancelled" },
    };

    const variant = variants[status];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variant.bg} ${variant.text}`}>
        <span className="material-symbols-outlined text-base mr-1">{variant.icon}</span>
        {variant.label}
      </span>
    );
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your order history and track shipments
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.confirmed}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Shipped</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.shipped}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.delivered}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? "bg-[#1173d4] text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
            receipt_long
          </span>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {filterStatus === "ALL"
              ? "No orders yet."
              : `No ${filterStatus.toLowerCase()} orders found.`}
          </p>
          <Link
            to="/client/books"
            className="inline-flex items-center mt-4 px-6 py-3 rounded-lg bg-[#1173d4] text-white font-bold hover:bg-[#1173d4]/90 transition-colors"
          >
            <span className="material-symbols-outlined mr-2">shopping_bag</span>
            Start Shopping
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
                    <p className="font-bold text-gray-900 dark:text-white">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
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
                      Cancel
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
                          className="font-bold text-gray-900 dark:text-white hover:text-[#1173d4] dark:hover:text-[#1173d4] transition-colors"
                        >
                          {item.bookTitle}
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400">by {item.bookAuthor}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1173d4]">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Order Total</span>
                  <span className="text-2xl font-bold text-[#1173d4]">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
