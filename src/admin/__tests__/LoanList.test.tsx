import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoanList from '../pages/loans/LoanList';
import type { Loan } from '../../shared/types';

// loanService 목킹
vi.mock('../../services/loanService', () => ({
  loanService: {
    getAllLoans: vi.fn(),
    updateLoan: vi.fn(),
  },
}));

import { loanService } from '../../services/loanService';

const getAllLoansMock = vi.mocked(loanService.getAllLoans);
const updateLoanMock = vi.mocked(loanService.updateLoan);

const now = new Date();
const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

const mockLoans: Loan[] = [
  {
    id: 1,
    memberId: 10,
    memberName: '김철수',
    memberEmail: 'kim@example.com',
    bookId: 5,
    bookTitle: '리액트 가이드',
    bookAuthor: '김개발',
    loanDate: now.toISOString(),
    dueDate: future.toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 2,
    memberId: 11,
    memberName: '이영희',
    memberEmail: 'lee@example.com',
    bookId: 6,
    bookTitle: '타입스크립트',
    bookAuthor: '이코딩',
    loanDate: past.toISOString(),
    dueDate: past.toISOString(),
    status: 'OVERDUE',
  },
  {
    id: 3,
    memberId: 12,
    memberName: '박민준',
    memberEmail: 'park@example.com',
    bookId: 7,
    bookTitle: '자바스크립트',
    bookAuthor: '박서버',
    loanDate: past.toISOString(),
    dueDate: past.toISOString(),
    returnDate: now.toISOString(),
    status: 'RETURNED',
  },
];

function renderLoanList() {
  return render(
    <MemoryRouter>
      <LoanList />
    </MemoryRouter>
  );
}

describe('LoanList (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AL-01: 초기 로딩', () => {
    it('대출 목록이 테이블에 렌더링된다', async () => {
      getAllLoansMock.mockResolvedValue(mockLoans);

      renderLoanList();

      await waitFor(() => {
        expect(screen.getByText('리액트 가이드')).toBeInTheDocument();
      });

      expect(screen.getByText('타입스크립트')).toBeInTheDocument();
      expect(screen.getByText('자바스크립트')).toBeInTheDocument();
    });
  });

  describe('AL-02: 회원명 표시', () => {
    it('회원명이 테이블에 표시된다', async () => {
      getAllLoansMock.mockResolvedValue(mockLoans);

      renderLoanList();

      await waitFor(() => {
        expect(screen.getByText('김철수')).toBeInTheDocument();
      });

      expect(screen.getByText('이영희')).toBeInTheDocument();
    });
  });

  describe('AL-03: 상태 필터 — ACTIVE만', () => {
    it('ACTIVE 필터 선택 시 ACTIVE 대출만 표시된다', async () => {
      getAllLoansMock.mockResolvedValue(mockLoans);

      renderLoanList();

      await waitFor(() => {
        expect(screen.getByText('리액트 가이드')).toBeInTheDocument();
      });

      // 여러 combobox 중 첫 번째가 Status 필터
      const comboboxes = screen.getAllByRole('combobox');
      await userEvent.selectOptions(comboboxes[0], 'ACTIVE');

      await waitFor(() => {
        expect(screen.getByText('리액트 가이드')).toBeInTheDocument();
        expect(screen.queryByText('타입스크립트')).not.toBeInTheDocument();
        expect(screen.queryByText('자바스크립트')).not.toBeInTheDocument();
      });
    });
  });

  describe('AL-04: API 에러', () => {
    it('에러 메시지와 다시 시도 버튼이 노출된다', async () => {
      getAllLoansMock.mockRejectedValue(new Error('Server Error'));

      renderLoanList();

      expect(
        await screen.findByText('대출 목록을 불러오는 데 실패했습니다.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    });
  });

  describe('AL-05: 다시 시도', () => {
    it('에러 후 다시 시도 버튼 클릭 시 getAllLoans가 재호출된다', async () => {
      getAllLoansMock
        .mockRejectedValueOnce(new Error('Server Error'))
        .mockResolvedValue(mockLoans);

      renderLoanList();

      const retryButton = await screen.findByRole('button', { name: '다시 시도' });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(getAllLoansMock).toHaveBeenCalledTimes(2);
      });
    });
  });
});
