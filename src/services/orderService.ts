import { apiClient } from './apiClient';
import type { Order, OrderStatistics, PageResponse } from '../shared/types';

export interface CreateOrderRequest {
  memberId: number;
  items: { bookId: number; quantity: number }[];
  payment: {
    method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'KAKAO_PAY' | 'NAVER_PAY' | 'TOSS_PAY';
    amount: number;
  };
  delivery: {
    recipientName: string;
    phoneNumber: string;
    address: string;
    addressDetail?: string;
    zipCode?: string;
    deliveryMemo?: string;
  };
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export const orderService = {
  getOrders: (page = 0, size = 10): Promise<PageResponse<Order>> =>
    apiClient.get<PageResponse<Order>>('/api/orders', { params: { page, size } })
      .then((r) => r.data),

  getOrder: (id: number): Promise<Order> =>
    apiClient.get<Order>(`/api/orders/${id}`).then((r) => r.data),

  createOrder: (data: CreateOrderRequest): Promise<Order> =>
    apiClient.post<Order>('/api/orders', data).then((r) => r.data),

  confirmOrder: (id: number): Promise<Order> =>
    apiClient.patch<Order>(`/api/orders/${id}/confirm`).then((r) => r.data),

  shipOrder: (id: number, trackingNumber: string, courierCompany: string): Promise<Order> =>
    apiClient.patch<Order>(`/api/orders/${id}/ship`, null, { params: { trackingNumber, courierCompany } }).then((r) => r.data),

  deliverOrder: (id: number): Promise<Order> =>
    apiClient.patch<Order>(`/api/orders/${id}/deliver`).then((r) => r.data),

  cancelOrder: (id: number): Promise<Order> =>
    apiClient.patch<Order>(`/api/orders/${id}/cancel`).then((r) => r.data),

  getByStatus: (status: OrderStatus, page = 0, size = 10): Promise<PageResponse<Order>> =>
    apiClient.get<PageResponse<Order>>(`/api/orders/status/${status}`, { params: { page, size } })
      .then((r) => r.data),

  getByDateRange: (startDate: string, endDate: string, page = 0, size = 10): Promise<PageResponse<Order>> =>
    apiClient.get<PageResponse<Order>>('/api/orders/date-range', {
      params: { startDate, endDate, page, size },
    }).then((r) => r.data),

  getByAmountRange: (minAmount: number, maxAmount: number, page = 0, size = 10): Promise<PageResponse<Order>> =>
    apiClient.get<PageResponse<Order>>('/api/orders/amount-range', {
      params: { minAmount, maxAmount, page, size },
    }).then((r) => r.data),

  getByBook: (bookId: number): Promise<Order[]> =>
    apiClient.get<Order[]>(`/api/orders/book/${bookId}`).then((r) => r.data),

  getStatistics: (): Promise<OrderStatistics> =>
    apiClient.get<OrderStatistics>('/api/orders/statistics').then((r) => r.data),

  getRevenue: (): Promise<unknown> =>
    apiClient.get('/api/orders/revenue').then((r) => r.data),
};
