import { describe, it, expect, vi, beforeEach } from 'vitest';

// apiClient 목킹
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '../apiClient';
import { loanService } from '../loanService';
import type { Loan } from '../../shared/types';

const getMock = vi.mocked(apiClient.get);
const postMock = vi.mocked(apiClient.post);
const patchMock = vi.mocked(apiClient.patch);
const deleteMock = vi.mocked(apiClient.delete);

const mockLoan: Loan = {
  id: 1,
  memberId: 10,
  memberName: '테스트 회원',
  bookId: 5,
  bookTitle: '테스트 도서',
  loanDate: '2026-02-01T00:00:00Z',
  dueDate: '2026-02-15T00:00:00Z',
  status: 'ACTIVE',
};

describe('loanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LN-01: 내 대출 목록 조회', () => {
    it('GET /api/client/loans 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: [mockLoan] });

      const result = await loanService.getMyLoans();

      expect(getMock).toHaveBeenCalledWith('/api/client/loans');
      expect(result).toEqual([mockLoan]);
    });
  });

  describe('LN-02: 대출 신청', () => {
    it('POST /api/client/loans/request 로 요청한다', async () => {
      postMock.mockResolvedValue({ data: mockLoan });

      const request = { bookId: 5, loanPeriod: 14 };
      const result = await loanService.requestLoan(request);

      expect(postMock).toHaveBeenCalledWith('/api/client/loans/request', request);
      expect(result).toEqual(mockLoan);
    });
  });

  describe('LN-03: 반납 처리', () => {
    it('POST /api/client/loans/3/return 로 요청한다', async () => {
      const returnedLoan = { ...mockLoan, status: 'RETURNED' as const };
      postMock.mockResolvedValue({ data: returnedLoan });

      const result = await loanService.returnLoan(3);

      expect(postMock).toHaveBeenCalledWith('/api/client/loans/3/return');
      expect(result.status).toBe('RETURNED');
    });
  });

  describe('LN-04: 대출 취소', () => {
    it('DELETE /api/client/loans/3 로 요청한다', async () => {
      deleteMock.mockResolvedValue({ data: undefined });

      await loanService.cancelLoan(3);

      expect(deleteMock).toHaveBeenCalledWith('/api/client/loans/3');
    });
  });

  describe('LN-05: 관리자 — 전체 대출 조회', () => {
    it('GET /api/admin/loans 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: [mockLoan] });

      const result = await loanService.getAllLoans();

      expect(getMock).toHaveBeenCalledWith('/api/admin/loans');
      expect(result).toEqual([mockLoan]);
    });
  });

  describe('LN-06: 관리자 — 단일 대출 조회', () => {
    it('GET /api/admin/loans/5 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: mockLoan });

      const result = await loanService.getLoan(5);

      expect(getMock).toHaveBeenCalledWith('/api/admin/loans/5');
      expect(result).toEqual(mockLoan);
    });
  });

  describe('LN-07: 관리자 — 대출 상태 업데이트', () => {
    it('PATCH /api/admin/loans/5 로 요청한다', async () => {
      const updatedLoan = { ...mockLoan, status: 'RETURNED' as const };
      patchMock.mockResolvedValue({ data: updatedLoan });

      const result = await loanService.updateLoan(5, { status: 'RETURNED' });

      expect(patchMock).toHaveBeenCalledWith('/api/admin/loans/5', { status: 'RETURNED' });
      expect(result.status).toBe('RETURNED');
    });
  });

  describe('LN-08: 관리자 — 연체 대출 목록', () => {
    it('GET /api/admin/loans/overdue 로 요청한다', async () => {
      const overdueLoan = { ...mockLoan, status: 'OVERDUE' as const };
      getMock.mockResolvedValue({ data: [overdueLoan] });

      const result = await loanService.getOverdueLoans();

      expect(getMock).toHaveBeenCalledWith('/api/admin/loans/overdue');
      expect(result[0].status).toBe('OVERDUE');
    });
  });

  describe('LN-09: 관리자 — 회원명으로 검색', () => {
    it('GET /api/admin/loans/search/by-member-name?name=홍길동 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: [mockLoan] });

      await loanService.searchByMemberName('홍길동');

      expect(getMock).toHaveBeenCalledWith(
        '/api/admin/loans/search/by-member-name',
        { params: { name: '홍길동' } }
      );
    });
  });
});
