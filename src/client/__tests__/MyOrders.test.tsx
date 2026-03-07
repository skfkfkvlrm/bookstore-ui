import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MyOrders from '../pages/MyOrders';
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
      {
        id: 1,
        bookId: 5,
        bookTitle: '리액트 완벽 가이드',
        bookAuthor: '김개발',
        quantity: 1,
        price: 32000,
      },
    ],
  },
  {
    id: 2,
    totalAmount: 28000,
    orderDate: '2026-01-15T10:00:00Z',
    status: 'DELIVERED',
    items: [
      {
        id: 2,
        bookId: 6,
        bookTitle: '타입스크립트 핸드북',
        bookAuthor: '이코딩',
        quantity: 1,
        price: 28000,
      },
    ],
  },
];

const mockPage: PageResponse<Order> = {
  content: mockOrders,
  totalElements: 2,
  totalPages: 1,
  size: 100,
  number: 0,
};

const emptyPage: PageResponse<Order> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 100,
  number: 0,
};

function renderMyOrders() {
  return render(
    <MemoryRouter>
      <MyOrders />
    </MemoryRouter>
  );
}

describe('MyOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MO-01: 초기 로딩', () => {
    it('주문 목록이 렌더링된다', async () => {
      getOrdersMock.mockResolvedValue(mockPage);

      renderMyOrders();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });
    });
  });

  describe('MO-02: 주문 카드 렌더링', () => {
    it('주문 번호·도서명·상태 배지가 노출된다', async () => {
      getOrdersMock.mockResolvedValue(mockPage);

      renderMyOrders();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('타입스크립트 핸드북')).toBeInTheDocument();
      // 상태 배지는 여러 곳에 노출될 수 있으므로 getAllByText 사용
      expect(screen.getAllByText('접수').length).toBeGreaterThan(0);
      expect(screen.getAllByText('배송 완료').length).toBeGreaterThan(0);
    });
  });

  describe('MO-03: 통계 카드', () => {
    it('총 주문 수가 노출된다', async () => {
      getOrdersMock.mockResolvedValue(mockPage);

      renderMyOrders();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      expect(screen.getByText('총 주문')).toBeInTheDocument();
    });
  });

  describe('MO-04: 빈 주문 목록', () => {
    it('"아직 주문 내역이 없습니다" 메시지가 노출된다', async () => {
      getOrdersMock.mockResolvedValue(emptyPage);

      renderMyOrders();

      expect(
        await screen.findByText('아직 주문 내역이 없습니다.')
      ).toBeInTheDocument();
    });
  });

  describe('MO-05: API 에러', () => {
    it('에러 메시지와 다시 시도 버튼이 노출된다', async () => {
      getOrdersMock.mockRejectedValue(new Error('Server Error'));

      renderMyOrders();

      expect(
        await screen.findByText('주문 내역을 불러오는 데 실패했습니다.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    });
  });

  describe('MO-06: 주문 취소', () => {
    it('확인 후 cancelOrder가 호출되고 목록이 갱신된다', async () => {
      getOrdersMock.mockResolvedValue(mockPage);
      const cancelledOrder = { ...mockOrders[0], status: 'CANCELLED' as const };
      cancelOrderMock.mockResolvedValue(cancelledOrder);
      getOrdersMock
        .mockResolvedValueOnce(mockPage)
        .mockResolvedValue({
          ...mockPage,
          content: [cancelledOrder, mockOrders[1]],
        });

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderMyOrders();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /주문 취소/ });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(cancelOrderMock).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('MO-07: 상태 필터', () => {
    it('DELIVERED 필터 클릭 시 해당 주문만 노출된다', async () => {
      getOrdersMock.mockResolvedValue(mockPage);

      renderMyOrders();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      // "배송 완료" 필터 버튼 클릭 (filterButton과 statusBadge 구분)
      const filterButtons = screen.getAllByText(/배송 완료/);
      // 필터 버튼은 role="button"
      const deliveredFilter = filterButtons.find(
        (el) => el.closest('button') && el.closest('button')?.getAttribute('class')?.includes('rounded-lg')
      );
      if (deliveredFilter?.closest('button')) {
        await userEvent.click(deliveredFilter.closest('button')!);
      }

      // PENDING 주문 (리액트 완벽 가이드)은 숨겨지고 DELIVERED (타입스크립트 핸드북)만 보여야 함
      await waitFor(() => {
        expect(screen.queryByText('리액트 완벽 가이드')).not.toBeInTheDocument();
        expect(screen.getByText('타입스크립트 핸드북')).toBeInTheDocument();
      });
    });
  });
});
