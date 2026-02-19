import { describe, it, expect, vi, beforeEach } from 'vitest';

// apiClient 목킹
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

import { apiClient } from '../apiClient';
import { memberService } from '../memberService';
import type { Member, PageResponse } from '../../shared/types';

const getMock = vi.mocked(apiClient.get);
const putMock = vi.mocked(apiClient.put);

const mockMember: Member = {
  id: 3,
  name: '신규회원',
  email: `test_${Date.now()}@example.com`,
  membershipType: 'REGULAR',
  joinDate: new Date().toISOString(),
};

const mockPage: PageResponse<Member> = {
  content: [mockMember],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0,
};

describe('memberService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MB-01: 회원 목록 조회', () => {
    it('GET /api/members?page=0&size=10 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: mockPage });

      await memberService.getMembers(0, 10);

      expect(getMock).toHaveBeenCalledWith('/api/members', { params: { page: 0, size: 10 } });
    });
  });

  describe('MB-02: 단일 회원 조회', () => {
    it('GET /api/members/3 로 요청하고 회원 데이터를 반환한다', async () => {
      getMock.mockResolvedValue({ data: mockMember });

      const result = await memberService.getMember(3);

      expect(getMock).toHaveBeenCalledWith('/api/members/3');
      expect(result).toEqual(mockMember);
    });
  });

  describe('MB-03: 회원 검색', () => {
    it('GET /api/members/search?name=김&page=0&size=10 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: mockPage });

      await memberService.search('김', 0, 10);

      expect(getMock).toHaveBeenCalledWith('/api/members/search', {
        params: { name: '김', page: 0, size: 10 },
      });
    });
  });

  describe('MB-04: 회원 정보 수정', () => {
    it('PUT /api/members/3 로 요청하고 수정된 회원 정보를 반환한다', async () => {
      const updatedMember = { ...mockMember, name: '홍길동' };
      putMock.mockResolvedValue({ data: updatedMember });

      const result = await memberService.updateMember(3, { name: '홍길동' });

      expect(putMock).toHaveBeenCalledWith('/api/members/3', { name: '홍길동' });
      expect(result.name).toBe('홍길동');
    });
  });

  describe('MB-05: 멤버십 변경', () => {
    it('PUT /api/members/3/membership?membershipType=PREMIUM 로 요청한다', async () => {
      const premiumMember = { ...mockMember, membershipType: 'PREMIUM' as const };
      putMock.mockResolvedValue({ data: premiumMember });

      const result = await memberService.updateMembership(3, 'PREMIUM');

      expect(putMock).toHaveBeenCalledWith(
        '/api/members/3/membership',
        null,
        { params: { membershipType: 'PREMIUM' } }
      );
      expect(result.membershipType).toBe('PREMIUM');
    });
  });

  describe('MB-06: 이메일 유효성 검증', () => {
    it('GET /api/members/email/validate?email=test@test.com 로 요청한다', async () => {
      getMock.mockResolvedValue({ data: true });

      const result = await memberService.validateEmail('test@test.com');

      expect(getMock).toHaveBeenCalledWith('/api/members/email/validate', {
        params: { email: 'test@test.com' },
      });
      expect(result).toBe(true);
    });
  });

  describe('MB-07: 대출 한도 조회', () => {
    it('GET /api/members/3/loan-limit 로 요청하고 한도 정보를 반환한다', async () => {
      const loanLimit = {
        memberId: 3,
        memberName: '신규회원',
        membershipType: 'REGULAR' as const,
        maxLoanCount: 3,
        currentLoanCount: 1,
        remainingLoanCount: 2,
        canLoan: true,
      };
      getMock.mockResolvedValue({ data: loanLimit });

      const result = await memberService.getLoanLimit(3);

      expect(getMock).toHaveBeenCalledWith('/api/members/3/loan-limit');
      expect(result).toEqual(loanLimit);
    });
  });
});
