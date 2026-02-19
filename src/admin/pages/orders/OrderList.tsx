import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import SearchInput from "../../../shared/components/common/SearchInput";
import Pagination from "../../../shared/components/common/Pagination";
import { orderService } from "../../../services/orderService";

const ITEMS_PER_PAGE = 10;

const OrderList = () => {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"orderDate" | "totalAmount" | "id">("orderDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 전체 주문을 한 번에 로드 (최대 500건)
      const response = await orderService.getOrders(0, 500);
      setAllOrders(response.content);
    } catch {
      setError("주문 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
    CANCELLED: "취소",
  };

  const filteredOrders = useMemo(() => allOrders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      String(order.id).includes(searchQuery) ||
      order.memberEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [allOrders, searchQuery, statusFilter]);

  const sortedOrders = useMemo(() => [...filteredOrders].sort((a, b) => {
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
  }), [filteredOrders, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = useMemo(
    () => sortedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [sortedOrders, startIndex]
  );

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((order) => order.id));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedOrders([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectOrder = (orderId: number) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleBulkCancel = async () => {
    if (!window.confirm(`선택된 ${selectedOrders.length}건의 주문을 취소하시겠습니까?`)) return;
    try {
      await Promise.all(selectedOrders.map((id) => orderService.cancelOrder(id)));
      setSelectedOrders([]);
      await fetchOrders();
    } catch {
      alert("일부 주문 취소에 실패했습니다.");
      await fetchOrders();
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-[#2f9e5f] focus:ring-[#2f9e5f]"
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
          className="rounded border-gray-300 text-[#2f9e5f] focus:ring-[#2f9e5f]"
        />
      ),
    },
    {
      header: "주문 번호",
      accessor: (row: Order) => (
        <button
          onClick={() => navigate(`/admin/orders/${row.id}`)}
          className="font-mono text-[#2f9e5f] hover:underline"
        >
          #{String(row.id).padStart(8, "0")}
        </button>
      ),
    },
    {
      header: "고객",
      accessor: (row: Order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.memberName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.memberEmail}</p>
        </div>
      ),
    },
    {
      header: "주문일",
      accessor: (row: Order) => new Date(row.orderDate).toLocaleDateString(),
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "결제 금액",
      accessor: (row: Order) => `${row.totalAmount.toLocaleString()}원`,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "상태",
      accessor: (row: Order) => (
        <Badge variant={getStatusVariant(row.status)}>{statusLabelMap[row.status]}</Badge>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">주문 관리</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">도서 주문 내역을 조회하고 관리하세요.</p>
        </div>
      </div>

      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              선택된 주문 {selectedOrders.length}건
            </span>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkCancel}
              >
                <span className="material-symbols-outlined">cancel</span>
                주문 취소
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <SearchInput
              placeholder="주문 번호 또는 이메일 검색"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="md:col-span-8 flex items-center gap-3 justify-end flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">상태:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
              >
                <option value="all">전체 상태</option>
                <option value="PENDING">접수</option>
                <option value="CONFIRMED">확정</option>
                <option value="SHIPPED">배송 중</option>
                <option value="DELIVERED">배송 완료</option>
                <option value="CANCELLED">취소</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as typeof sortBy);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
              >
                <option value="orderDate">주문일</option>
                <option value="totalAmount">결제 금액</option>
                <option value="id">주문 번호</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={sortOrder === "asc" ? "내림차순으로 정렬" : "오름차순으로 정렬"}
              >
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                  {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {!loading && !error && (
        <>
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
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                      조건에 맞는 주문이 없습니다.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
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
                            : (order[col.accessor] as ReactNode)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={sortedOrders.length}
          />
        </>
      )}
    </div>
  );
};

export default OrderList;
