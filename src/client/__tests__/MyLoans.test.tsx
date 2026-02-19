import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MyLoans from '../pages/MyLoans';
import type { Loan } from '../../shared/types';

// loanService 목킹
vi.mock('../../services/loanService', () => ({
  loanService: {
    getMyLoans: vi.fn(),
    returnLoan: vi.fn(),
    cancelLoan: vi.fn(),
  },
}));

import { loanService } from '../../services/loanService';

const getMyLoansMock = vi.mocked(loanService.getMyLoans);
const returnLoanMock = vi.mocked(loanService.returnLoan);

const now = new Date();
const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

const mockLoans: Loan[] = [
  {
    id: 1,
    memberId: 10,
    memberName: '테스트 회원',
    bookId: 5,
    bookTitle: '리액트 완벽 가이드',
    bookAuthor: '김개발',
    loanDate: now.toISOString(),
    dueDate: future.toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 2,
    memberId: 10,
    memberName: '테스트 회원',
    bookId: 6,
    bookTitle: '반납된 책',
    bookAuthor: '이저자',
    loanDate: '2026-01-01T00:00:00Z',
    dueDate: '2026-01-15T00:00:00Z',
    returnDate: '2026-01-14T00:00:00Z',
    status: 'RETURNED',
  },
];

function renderMyLoans() {
  return render(
    <MemoryRouter>
      <MyLoans />
    </MemoryRouter>
  );
}

describe('MyLoans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ML-01: 초기 로딩', () => {
    it('대출 목록이 렌더링된다', async () => {
      getMyLoansMock.mockResolvedValue(mockLoans);

      renderMyLoans();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });
    });
  });

  describe('ML-02: 대출 카드 렌더링', () => {
    it('도서 제목과 상태 배지가 노출된다', async () => {
      getMyLoansMock.mockResolvedValue(mockLoans);

      renderMyLoans();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      expect(screen.getByText('반납된 책')).toBeInTheDocument();
      // 대여 중 상태 배지 - 여러 개 있을 수 있으므로 getAllByText 사용
      expect(screen.getAllByText('대여 중').length).toBeGreaterThan(0);
    });
  });

  describe('ML-03: 통계 카드', () => {
    it('총 대출 건수·대여 중·반납 완료 카운트가 노출된다', async () => {
      getMyLoansMock.mockResolvedValue(mockLoans);

      renderMyLoans();

      await waitFor(() => {
        expect(screen.getByText('리액트 완벽 가이드')).toBeInTheDocument();
      });

      // 통계 카드 확인 (텍스트가 중복될 수 있으므로 getAllByText 사용)
      expect(screen.getByText('총 대출 건수')).toBeInTheDocument();
      expect(screen.getAllByText('반납 완료').length).toBeGreaterThan(0);
    });
  });

  describe('ML-04: API 에러', () => {
    it('에러 메시지와 다시 시도 버튼이 노출된다', async () => {
      getMyLoansMock.mockRejectedValue(new Error('Server Error'));

      renderMyLoans();

      expect(
        await screen.findByText('대출 내역을 불러오는 데 실패했습니다.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    });
  });

  describe('ML-05: 반납하기', () => {
    it('확인 후 returnLoan이 호출되고 목록이 갱신된다', async () => {
      getMyLoansMock.mockResolvedValue(mockLoans);
      const returnedLoan = { ...mockLoans[0], status: 'RETURNED' as const };
      returnLoanMock.mockResolvedValue(returnedLoan);
      // 반납 후 다시 조회
      getMyLoansMock.mockResolvedValueOnce(mockLoans).mockResolvedValue([
        returnedLoan,
        mockLoans[1],
      ]);

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderMyLoans();

      await waitFor(() => {
        expect(screen.getAllByText('반납하기').length).toBeGreaterThan(0);
      });

      const returnButtons = screen.getAllByText('반납하기');
      await userEvent.click(returnButtons[0]);

      await waitFor(() => {
        expect(returnLoanMock).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('ML-06: 빈 목록', () => {
    it('"대출한 도서가 아직 없습니다" 메시지가 노출된다', async () => {
      getMyLoansMock.mockResolvedValue([]);

      renderMyLoans();

      expect(
        await screen.findByText('대출한 도서가 아직 없습니다.')
      ).toBeInTheDocument();
    });
  });
});
