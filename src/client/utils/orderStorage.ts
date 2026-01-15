import type { Order } from "../../shared/types";
import { getCurrentUser } from "./authStorage";

const ORDERS_STORAGE_KEY = "library_user_orders";
const LOCAL_STORAGE_ID_START = 10000;

export const getUserOrders = (): Order[] => {
  const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const createOrder = (order: Omit<Order, "id">): Order => {
  const existingOrders = getUserOrders();
  const maxLocalId = existingOrders.length > 0
    ? Math.max(...existingOrders.map(o => o.id))
    : LOCAL_STORAGE_ID_START - 1;
  const newId = Math.max(maxLocalId, LOCAL_STORAGE_ID_START - 1) + 1;

  const newOrder: Order = {
    ...order,
    id: newId,
  };

  const updatedOrders = [newOrder, ...existingOrders];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
  return newOrder;
};

export const updateOrderStatus = (
  orderId: number,
  status: Order["status"]
): void => {
  const orders = getUserOrders();
  const updatedOrders = orders.map(order =>
    order.id === orderId ? { ...order, status } : order
  );
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
};

export const cancelOrder = (orderId: number): void => {
  updateOrderStatus(orderId, "CANCELLED");
};

export const getCurrentUserEmail = (): string => {
  const user = getCurrentUser();
  return user?.email || "user@example.com";
};
