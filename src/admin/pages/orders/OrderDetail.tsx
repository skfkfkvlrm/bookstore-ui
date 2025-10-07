import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";

// Mock data - replace with API call
const mockOrder: Order = {
  id: 1234,
  totalAmount: 33.47,
  orderDate: "2025-09-20T10:30:00",
  status: "PENDING",
  customerEmail: "emily.carter@email.com",
  paymentMethod: "CREDIT_CARD",
  paymentStatus: "COMPLETED",
  items: [
    {
      id: 1,
      bookId: 1,
      bookTitle: "The Secret Garden",
      bookAuthor: "Frances Bennett",
      quantity: 1,
      price: 9.99,
    },
    {
      id: 2,
      bookId: 2,
      bookTitle: "1984",
      bookAuthor: "George Orwell",
      quantity: 1,
      price: 14.99,
    },
    {
      id: 3,
      bookId: 3,
      bookTitle: "Pride and Prejudice",
      bookAuthor: "Jane Austen",
      quantity: 1,
      price: 8.49,
    },
  ],
};

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<Order>(mockOrder);

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

  const handleStatusChange = (newStatus: Order["status"]) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      // TODO: API call to update order status
      console.log("Update order status:", id, "to", newStatus);
      setOrder({ ...order, status: newStatus });
    }
  };

  const handleCancelOrder = () => {
    handleStatusChange("CANCELLED");
  };

  const handlePrintInvoice = () => {
    // TODO: Implement print functionality
    console.log("Print invoice for order:", id);
    window.print();
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5.0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Order Details</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Order <span className="font-mono text-[#1173d4]">#{String(order.id).padStart(8, "0")}</span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-white">{order.customerEmail}</p>
          </div>
        </div>
        <div className="p-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Information</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Order Date</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {new Date(order.orderDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
              <dd>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
              </dd>
            </div>
            {order.paymentMethod && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Payment Method</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {order.paymentMethod === "CREDIT_CARD" ? "Credit Card" : "Bank Transfer"}
                </dd>
              </div>
            )}
            {order.paymentStatus && (
              <div className="flex justify-between items-center">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Payment Status</dt>
                <dd>
                  <Badge
                    variant={
                      order.paymentStatus === "COMPLETED"
                        ? "delivered"
                        : order.paymentStatus === "FAILED"
                        ? "cancelled"
                        : "pending"
                    }
                  >
                    {order.paymentStatus}
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
            Items in this Order ({order.items.length})
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
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{item.bookTitle}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.bookAuthor}</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                    ${item.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Actions</h4>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handlePrintInvoice}>
              <span className="material-symbols-outlined">print</span>
              Print Invoice
            </Button>
            {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
              <Button variant="danger" onClick={handleCancelOrder}>
                <span className="material-symbols-outlined">cancel</span>
                Cancel Order
              </Button>
            )}
          </div>

          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Update Order Status
              </h5>
              <div className="flex gap-2 flex-wrap">
                {order.status !== "CONFIRMED" && (
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange("CONFIRMED")}
                    size="sm"
                  >
                    Confirm
                  </Button>
                )}
                {order.status === "CONFIRMED" && (
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange("SHIPPED")}
                    size="sm"
                  >
                    Mark as Shipped
                  </Button>
                )}
                {order.status === "SHIPPED" && (
                  <Button
                    variant="success"
                    onClick={() => handleStatusChange("DELIVERED")}
                    size="sm"
                  >
                    Mark as Delivered
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
