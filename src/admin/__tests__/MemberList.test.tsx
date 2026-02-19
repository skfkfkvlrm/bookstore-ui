import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MemberList from '../pages/members/MemberList';
import type { Member, PageResponse } from '../../shared/types';

// memberService 목킹
vi.mock('../../services/memberService', () => ({
  memberService: {
    getMembers: vi.fn(),
    search: vi.fn(),
  },
}));

import { memberService } from '../../services/memberService';

const getMembersMock = vi.mocked(memberService.getMembers);
const searchMock = vi.mocked(memberService.search);

const mockMembers: Member[] = [
  {
    id: 1,
    name: '김철수',
    email: 'kim@example.com',
    membershipType: 'REGULAR',
    status: 'ACTIVE',
    joinDate: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '이영희',
    email: 'lee@example.com',
    membershipType: 'PREMIUM',
    status: 'ACTIVE',
    joinDate: '2026-01-15T00:00:00Z',
  },
  {
    id: 3,
    name: '박민준',
    email: 'park@example.com',
    membershipType: 'REGULAR',
    status: 'SUSPENDED',
    joinDate: '2026-02-01T00:00:00Z',
  },
];

const mockPage: PageResponse<Member> = {
  content: mockMembers,
  totalElements: 3,
  totalPages: 1,
  size: 200,
  number: 0,
};

const emptyPage: PageResponse<Member> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 200,
  number: 0,
};

function renderMemberList() {
  return render(
    <MemoryRouter>
      <MemberList />
    </MemoryRouter>
  );
}

describe('MemberList (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AM-01: 초기 로딩', () => {
    it('회원 목록이 테이블에 렌더링된다', async () => {
      getMembersMock.mockResolvedValue(mockPage);

      renderMemberList();

      await waitFor(() => {
        expect(screen.getByText('김철수')).toBeInTheDocument();
      });

      expect(screen.getByText('이영희')).toBeInTheDocument();
      expect(screen.getByText('박민준')).toBeInTheDocument();
    });
  });

  describe('AM-02: 이메일 노출', () => {
    it('회원 이메일이 테이블에 표시된다', async () => {
      getMembersMock.mockResolvedValue(mockPage);

      renderMemberList();

      await waitFor(() => {
        expect(screen.getByText('kim@example.com')).toBeInTheDocument();
      });

      expect(screen.getByText('lee@example.com')).toBeInTheDocument();
    });
  });

  describe('AM-03: 검색 기능', () => {
    it('Enter 키 검색 시 memberService.search가 호출된다', async () => {
      getMembersMock.mockResolvedValue(mockPage);
      searchMock.mockResolvedValue(mockPage);

      renderMemberList();

      await waitFor(() => {
        expect(screen.getByText('김철수')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('이름으로 검색 후 Enter');
      await userEvent.type(searchInput, '김{enter}');

      await waitFor(() => {
        expect(searchMock).toHaveBeenCalledWith('김', 0, 200);
      });
    });
  });

  describe('AM-04: 검색 결과 없음', () => {
    it('"조건에 맞는 회원이 없습니다" 메시지가 노출된다', async () => {
      getMembersMock.mockResolvedValue(emptyPage);

      renderMemberList();

      expect(
        await screen.findByText('조건에 맞는 회원이 없습니다.')
      ).toBeInTheDocument();
    });
  });

  describe('AM-05: API 에러', () => {
    it('에러 메시지와 다시 시도 버튼이 노출된다', async () => {
      getMembersMock.mockRejectedValue(new Error('Server Error'));

      renderMemberList();

      expect(
        await screen.findByText('회원 목록을 불러오는 데 실패했습니다.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    });
  });

  describe('AM-06: 총 회원 수 표시', () => {
    it('총 회원 수가 헤더에 표시된다', async () => {
      getMembersMock.mockResolvedValue(mockPage);

      renderMemberList();

      await waitFor(() => {
        expect(screen.getByText(/3명의 회원/)).toBeInTheDocument();
      });
    });
  });
});
