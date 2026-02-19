import { describe, it, expect, vi, beforeEach } from 'vitest';

// apiClient 목킹
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient } from '../apiClient';
import { orderService } from '../orderService';
import type { Order, PageResponse, OrderStatistics } from '../../shared/types';

const getMock = vi.mocked(apiClient.get);
const patchMock = vi.mocked(apiClient.patch);

const mockOrder: Order = {
  id: 1,
  totalAmount: 30000,
  orderDate: '2026-02-01T00:00:00Z',
  status: 'PENDING',
  items: [
    {
      id: 1,
      bookId: 5,
      bookTitle: '테스트 도서',
      bookAuthor: '테스트 저자',
      quantity: 2,
      price: 15000,
    },
  ],
};

const mockPage: PageResponse<Order> = {
  content: [mockOrder],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0,
};

const mockStats: OrderStatistics = {
  totalOrders: 100,
  pendingOrders: 10,
  confirmedOrders: 20,
  shippedOrders: 30,
  deliveredOrders: 35,
  cancelledOrders: 5,
  totalRevenue: 1500000,
};

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OR-01: 주문 목록 조회', () => {
    it('GET /api/orders?page=0&size=10 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: mockPage });

      await orderService.getOrders(0, 10);

      expect(getMock).toHaveBeenCalledWith('/api/orders', { params: { page: 0, size: 10 } });
    });
  });

  describe('OR-02: 단일 주문 조회', () => {
    it('GET /api/orders/1 로 요청하고 주문 데이터를 반환한다', async () => {
      getMock.mockResolvedValue({ data: mockOrder });

      const result = await orderService.getOrder(1);

      expect(getMock).toHaveBeenCalledWith('/api/orders/1');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('OR-03: 주문 확정', () => {
    it('PATCH /api/orders/1/confirm 로 요청하고 CONFIRMED 상태를 반환한다', async () => {
      const confirmed = { ...mockOrder, status: 'CONFIRMED' as const };
      patchMock.mockResolvedValue({ data: confirmed });

      const result = await orderService.confirmOrder(1);

      expect(patchMock).toHaveBeenCalledWith('/api/orders/1/confirm');
      expect(result.status).toBe('CONFIRMED');
    });
  });

  describe('OR-04: 배송 시작', () => {
    it('PATCH /api/orders/1/ship 로 요청하고 SHIPPED 상태를 반환한다', async () => {
      const shipped = { ...mockOrder, status: 'SHIPPED' as const };
      patchMock.mockResolvedValue({ data: shipped });

      const result = await orderService.shipOrder(1);

      expect(patchMock).toHaveBeenCalledWith('/api/orders/1/ship');
      expect(result.status).toBe('SHIPPED');
    });
  });

  describe('OR-05: 배송 완료', () => {
    it('PATCH /api/orders/1/deliver 로 요청하고 DELIVERED 상태를 반환한다', async () => {
      const delivered = { ...mockOrder, status: 'DELIVERED' as const };
      patchMock.mockResolvedValue({ data: delivered });

      const result = await orderService.deliverOrder(1);

      expect(patchMock).toHaveBeenCalledWith('/api/orders/1/deliver');
      expect(result.status).toBe('DELIVERED');
    });
  });

  describe('OR-06: 주문 취소', () => {
    it('PATCH /api/orders/1/cancel 로 요청하고 CANCELLED 상태를 반환한다', async () => {
      const cancelled = { ...mockOrder, status: 'CANCELLED' as const };
      patchMock.mockResolvedValue({ data: cancelled });

      const result = await orderService.cancelOrder(1);

      expect(patchMock).toHaveBeenCalledWith('/api/orders/1/cancel');
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('OR-07: 주문 통계 조회', () => {
    it('GET /api/orders/statistics 로 요청하고 통계 데이터를 반환한다', async () => {
      getMock.mockResolvedValue({ data: mockStats });

      const result = await orderService.getStatistics();

      expect(getMock).toHaveBeenCalledWith('/api/orders/statistics');
      expect(result).toEqual(mockStats);
    });
  });
});
