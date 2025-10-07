import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import SearchInput from "../../../shared/components/common/SearchInput";
import FilterButton from "../../../shared/components/common/FilterButton";

// Mock data
const mockOrders: Order[] = [
  {
    id: 1234,
    totalAmount: 33.47,
    orderDate: "2025-09-20T10:30:00",
    status: "DELIVERED",
    customerEmail: "emily.carter@email.com",
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
  },
  {
    id: 1233,
    totalAmount: 12.50,
    orderDate: "2025-09-19T14:15:00",
    status: "PENDING",
    customerEmail: "david.lee@email.com",
    items: [
      {
        id: 4,
        bookId: 4,
        bookTitle: "To Kill a Mockingbird",
        bookAuthor: "Harper Lee",
        quantity: 1,
        price: 12.50,
      },
    ],
  },
  {
    id: 1232,
    totalAmount: 75.45,
    orderDate: "2025-09-18T09:00:00",
    status: "CANCELLED",
    customerEmail: "olivia.brown@email.com",
    items: [],
  },
];

const OrderList = () => {
  const navigate = useNavigate();
  const [orders] = useState<Order[]>(mockOrders);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"orderDate" | "totalAmount" | "id">("orderDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");

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

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchQuery === "" ||
      String(order.id).includes(searchQuery) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "orderDate":
        comparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
        break;
      case "totalAmount":
        comparison = a.totalAmount - b.totalAmount;
        break;
      case "id":
        comparison = a.id - b.id;
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedOrders.length === sortedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(sortedOrders.map((order) => order.id));
    }
  };

  const handleSelectOrder = (orderId: number) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} on orders:`, selectedOrders);
    // TODO: Implement bulk actions
    alert(`${action} on ${selectedOrders.length} selected order(s)`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedOrders.length === sortedOrders.length && sortedOrders.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-[#1173d4] focus:ring-[#1173d4]"
        />
      ),
      accessor: (row: Order) => (
        <input
          type="checkbox"
          checked={selectedOrders.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleSelectOrder(row.id);
          }}
          className="rounded border-gray-300 text-[#1173d4] focus:ring-[#1173d4]"
        />
      ),
    },
    {
      header: "Order ID",
      accessor: (row: Order) => (
        <button
          onClick={() => navigate(`/admin/orders/${row.id}`)}
          className="font-mono text-[#1173d4] hover:underline"
        >
          #{String(row.id).padStart(8, "0")}
        </button>
      ),
    },
    {
      header: "Customer",
      accessor: "customerEmail" as keyof Order,
      className: "font-medium text-gray-900 dark:text-white cursor-pointer",
    },
    {
      header: "Date",
      accessor: (row: Order) => new Date(row.orderDate).toLocaleDateString(),
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "Total Amount",
      accessor: (row: Order) => `$${row.totalAmount.toFixed(2)}`,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "Status",
      accessor: (row: Order) => (
        <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Order List</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Browse and manage all book orders.</p>
        </div>
        <Button onClick={() => navigate("/admin/orders/add")}>
          <span className="material-symbols-outlined">add</span>
          Create Order
        </Button>
      </div>

      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedOrders.length} order(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleBulkAction("Export")}>
                <span className="material-symbols-outlined">download</span>
                Export
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkAction("Cancel Orders")}
              >
                <span className="material-symbols-outlined">cancel</span>
                Cancel Orders
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <SearchInput
              placeholder="Search by Order ID or Email"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="md:col-span-8 flex items-center gap-3 justify-end flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#1173d4] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#1173d4] focus:border-transparent"
              >
                <option value="orderDate">Order Date</option>
                <option value="totalAmount">Total Amount</option>
                <option value="id">Order ID</option>
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
                  {typeof col.header === "function" ? col.header : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedOrders.map((order) => (
              <tr
                key={order.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    !target.closest('input[type="checkbox"]') &&
                    !target.closest("button")
                  ) {
                    navigate(`/admin/orders/${order.id}`);
                  }
                }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 ${col.className || ""}`}>
                    {typeof col.accessor === "function"
                      ? col.accessor(order)
                      : order[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
