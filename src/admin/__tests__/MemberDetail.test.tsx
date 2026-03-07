import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MemberDetail from '../pages/members/MemberDetail';
import type { Member } from '../../shared/types';

// memberService 목킹
vi.mock('../../services/memberService', () => ({
  memberService: {
    getMember: vi.fn(),
    updateMember: vi.fn(),
  },
}));

import { memberService } from '../../services/memberService';

const getMemberMock = vi.mocked(memberService.getMember);
const updateMemberMock = vi.mocked(memberService.updateMember);

const mockMember: Member = {
  id: 1,
  name: '김철수',
  email: 'kim@example.com',
  membershipType: 'REGULAR',
  joinDate: '2026-01-01T00:00:00Z',
};

function renderMemberDetail(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/admin/members/${id}`]}>
      <Routes>
        <Route path="/admin/members/:id" element={<MemberDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MemberDetail (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AMD-01: 초기 로딩', () => {
    it('회원 정보가 폼에 렌더링된다', async () => {
      getMemberMock.mockResolvedValue(mockMember);

      renderMemberDetail();

      await waitFor(() => {
        expect(screen.getByDisplayValue('김철수')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('kim@example.com')).toBeInTheDocument();
    });
  });

  describe('AMD-02: getMember API 호출', () => {
    it('올바른 ID로 memberService.getMember가 호출된다', async () => {
      getMemberMock.mockResolvedValue(mockMember);

      renderMemberDetail('1');

      await waitFor(() => {
        expect(getMemberMock).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('AMD-03: 편집 모드 진입', () => {
    it('Edit 버튼 클릭 시 입력 필드가 활성화된다', async () => {
      getMemberMock.mockResolvedValue(mockMember);

      renderMemberDetail();

      await waitFor(() => {
        expect(screen.getByDisplayValue('김철수')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /Edit/ });
      await userEvent.click(editButton);

      // 편집 모드에서 이름 필드가 활성화됨
      const nameInput = screen.getByDisplayValue('김철수');
      expect(nameInput).not.toBeDisabled();
    });
  });

  describe('AMD-04: 회원 정보 수정', () => {
    it('저장 시 memberService.updateMember가 호출된다', async () => {
      getMemberMock.mockResolvedValue(mockMember);
      updateMemberMock.mockResolvedValue({ ...mockMember, name: '김철수(수정)' });

      renderMemberDetail();

      await waitFor(() => {
        expect(screen.getByDisplayValue('김철수')).toBeInTheDocument();
      });

      // 편집 모드 진입
      await userEvent.click(screen.getByRole('button', { name: /Edit/ }));

      // 이름 수정
      const nameInput = screen.getByDisplayValue('김철수');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, '김철수(수정)');

      // 저장 버튼 클릭
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      await waitFor(() => {
        expect(updateMemberMock).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ name: '김철수(수정)' })
        );
      });
    });
  });

  describe('AMD-05: 편집 취소', () => {
    it('Cancel 버튼 클릭 시 원본 데이터로 복원된다', async () => {
      getMemberMock.mockResolvedValue(mockMember);

      renderMemberDetail();

      await waitFor(() => {
        expect(screen.getByDisplayValue('김철수')).toBeInTheDocument();
      });

      // 편집 모드 진입
      await userEvent.click(screen.getByRole('button', { name: /Edit/ }));

      // 이름 변경
      const nameInput = screen.getByDisplayValue('김철수');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, '임시이름');

      // 취소
      await userEvent.click(screen.getByRole('button', { name: /Cancel/ }));

      // 원본 데이터 복원 확인
      await waitFor(() => {
        expect(screen.getByDisplayValue('김철수')).toBeInTheDocument();
      });
    });
  });

  describe('AMD-06: API 에러 — 회원 없음', () => {
    it('에러 시 에러 메시지와 목록으로 돌아가기 버튼이 노출된다', async () => {
      getMemberMock.mockRejectedValue(new Error('Not Found'));

      renderMemberDetail('999');

      expect(
        await screen.findByText('회원 정보를 불러오는 데 실패했습니다.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to List/ })).toBeInTheDocument();
    });
  });
});
