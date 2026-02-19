import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import OrderList from '../pages/orders/OrderList';
import type { Order, PageResponse } from '../../shared/types';

// orderService 목킹
vi.mock('../../services/orderService', () => ({
  orderService: {
    getOrders: vi.fn(),
    cancelOrder: vi.fn(),
  },
}));

import { orderService } from '../../services/orderService';

const getOrdersMock = vi.mocked(orderService.getOrders);
const cancelOrderMock = vi.mocked(orderService.cancelOrder);

const mockOrders: Order[] = [
  {
    id: 1,
    totalAmount: 32000,
    orderDate: '2026-02-01T10:00:00Z',
    status: 'PENDING',
    items: [
      { id: 1, bookId: 5, bookTitle: '리액트 가이드', bookAuthor: '김개발', quantity: 1, price: 32000 },
    ],
    customerEmail: 'kim@example.com',
  },
  {
    id: 2,
    totalAmount: 28000,
    orderDate: '2026-01-15T10:00:00Z',
    status: 'DELIVERED',
    items: [
      { id: 2, bookId: 6, bookTitle: '타입스크립트', bookAuthor: '이코딩', quantity: 1, price: 28000 },
    ],
    customerEmail: 'lee@example.com',
  },
  {
    id: 3,
    totalAmount: 25000,
    orderDate: '2026-01-20T10:00:00Z',
    status: 'CANCELLED',
    items: [
      { id: 3, bookId: 7, bookTitle: '노드제이에스', bookAuthor: '박서버', quantity: 1, price: 25000 },
    ],
    customerEmail: 'park@example.com',
  },
];

const mockPage: PageResponse<Order> = {
  content: mockOrders,
  totalElements: 3,
  totalPages: 1,
  size: 500,
  number: 0,
};

function renderOrderList() {
  return render(
    <MemoryRouter>
      <OrderList />
    </MemoryRouter>
  );
}

describe('OrderList (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AO-01: 초기 로딩', () => {
    it('주문 목록이 테이블에 렌더링된다', async () => {
      getOrdersMock.mockResolvedValue(mockPage);

      renderOrderList();

      await waitFor(() => {
        expect(screen.getByText('kim@example.com')).toBeInTheDocument();
      });

      expect(screen.getByText('lee@example.com')).toBeInTheDocument();
    });
  });

  describe('AO-02: 주문 ID 표시', () => {
    it('주문 이메일이 테이블에 표시된다', async () => {
      getOrdersMock.mockResolvedValue(mockPage);

      renderOrderList();

      await waitFor(() => {
        expect(screen.getByText('kim@example.com')).toBeInTheDocument();
      });

      // 총 3건의 주문이 렌더링됨을 이메일로 확인
      expect(screen.getByText('park@example.com')).toBeInTheDocument();
    });
  });

  describe('AO-03: 상태 필터', () => {
    it('PENDING 필터 선택 시 PENDING 주문만 표시된다', async () => {
      getOrdersMock.mockResolvedValue(mockPage);

      renderOrderList();

      await waitFor(() => {
        expect(screen.getByText('kim@example.com')).toBeInTheDocument();
      });

      // combobox 중 첫 번째가 상태 필터 (두 번째는 정렬)
      const comboboxes = screen.getAllByRole('combobox');
      await userEvent.selectOptions(comboboxes[0], 'PENDING');

      await waitFor(() => {
        expect(screen.getByText('kim@example.com')).toBeInTheDocument();
        expect(screen.queryByText('lee@example.com')).not.toBeInTheDocument();
        expect(screen.queryByText('park@example.com')).not.toBeInTheDocument();
      });
    });
  });

  describe('AO-04: API 에러', () => {
    it('에러 메시지와 다시 시도 버튼이 노출된다', async () => {
      getOrdersMock.mockRejectedValue(new Error('Server Error'));

      renderOrderList();

      expect(
        await screen.findByText('주문 목록을 불러오는 데 실패했습니다.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    });
  });

  describe('AO-05: 일괄 취소', () => {
    it('체크박스 선택 후 일괄 취소 버튼 클릭 시 cancelOrder가 호출된다', async () => {
      getOrdersMock.mockResolvedValue(mockPage);
      const cancelledOrder = { ...mockOrders[0], status: 'CANCELLED' as const };
      cancelOrderMock.mockResolvedValue(cancelledOrder);
      getOrdersMock.mockResolvedValueOnce(mockPage).mockResolvedValue(mockPage);

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderOrderList();

      await waitFor(() => {
        expect(screen.getByText('kim@example.com')).toBeInTheDocument();
      });

      // 첫 번째 주문 체크박스 선택
      const checkboxes = screen.getAllByRole('checkbox');
      // 첫 번째는 전체 선택, 두 번째부터 개별
      await userEvent.click(checkboxes[1]);

      // 일괄 취소 버튼 — OrderList에서는 "주문 취소" 텍스트 사용
      await waitFor(() => {
        expect(screen.getByText(/선택된 주문/)).toBeInTheDocument();
      });
      const bulkCancelButton = screen.getByRole('button', { name: /주문 취소/ });
      await userEvent.click(bulkCancelButton);

      await waitFor(() => {
        expect(cancelOrderMock).toHaveBeenCalledWith(1);
      });
    });
  });
});
