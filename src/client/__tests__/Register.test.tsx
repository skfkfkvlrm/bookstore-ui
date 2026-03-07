import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Register';

// authService 목킹
vi.mock('../../services/authService', () => ({
  authService: {
    signup: vi.fn(),
  },
}));

import { authService } from '../../services/authService';

const signupMock = vi.mocked(authService.signup);

const mockMember = {
  id: 1,
  name: '신규회원',
  email: `test_${Date.now()}@example.com`,
  membershipType: 'REGULAR' as const,
  joinDate: new Date().toISOString(),
};

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/client/register']}>
      <Register />
    </MemoryRouter>
  );
}

// HTML5 네이티브 form 유효성 검사를 우회해서 React 핸들러의 커스텀 검증만 테스트한다
function submitForm() {
  const form = document.querySelector('form');
  if (form) fireEvent.submit(form);
}

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RG-01: 이름 미입력 제출', () => {
    it('"이름을 입력하세요" 에러가 노출된다', async () => {
      renderRegister();

      // fireEvent.submit으로 HTML5 네이티브 검증 우회
      submitForm();

      expect(screen.getByText('이름을 입력하세요.')).toBeInTheDocument();
    });
  });

  describe('RG-02: 이메일 형식 오류', () => {
    it('"올바른 이메일 형식을 입력하세요" 에러가 노출된다', async () => {
      renderRegister();

      await userEvent.type(screen.getByLabelText('이름'), '테스트 회원');
      await userEvent.type(screen.getByLabelText('이메일'), 'not-an-email');
      // fireEvent.submit으로 HTML5 네이티브 검증 우회 후 React 커스텀 검증 실행
      submitForm();

      expect(screen.getByText('올바른 이메일 형식을 입력하세요.')).toBeInTheDocument();
    });
  });

  describe('RG-03: 비밀번호 6자 미만', () => {
    it('"비밀번호는 6자 이상이어야 합니다" 에러가 노출된다', async () => {
      renderRegister();

      await userEvent.type(screen.getByLabelText('이름'), '테스트 회원');
      await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('비밀번호'), '12345');
      submitForm();

      expect(screen.getByText('비밀번호는 6자 이상이어야 합니다.')).toBeInTheDocument();
    });
  });

  describe('RG-04: 비밀번호 불일치', () => {
    it('"비밀번호가 일치하지 않습니다" 에러가 노출된다', async () => {
      renderRegister();

      await userEvent.type(screen.getByLabelText('이름'), '테스트 회원');
      await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
      await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'differentpass');
      submitForm();

      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
    });
  });

  describe('RG-05: 회원가입 성공', () => {
    it('authService.signup이 호출된다', async () => {
      signupMock.mockResolvedValue(mockMember);

      renderRegister();

      const timestamp = Date.now();
      const email = `test_${timestamp}@example.com`;

      await userEvent.type(screen.getByLabelText('이름'), '신규회원');
      await userEvent.type(screen.getByLabelText('이메일'), email);
      await userEvent.type(screen.getByLabelText('비밀번호'), 'test1234');
      await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'test1234');
      submitForm();

      await waitFor(() => {
        expect(signupMock).toHaveBeenCalledWith({
          name: '신규회원',
          email,
          password: 'test1234',
        });
      });
    });
  });

  describe('RG-06: 이메일 중복 — 409', () => {
    it('"이미 사용 중인 이메일입니다" 에러가 노출된다', async () => {
      const error = Object.assign(new Error('Conflict'), {
        response: { status: 409, data: { message: 'Email already exists' } },
        isAxiosError: true,
      });
      signupMock.mockRejectedValue(error);

      renderRegister();

      await userEvent.type(screen.getByLabelText('이름'), '테스트 회원');
      await userEvent.type(screen.getByLabelText('이메일'), 'dup@example.com');
      await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
      await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'password123');
      submitForm();

      expect(
        await screen.findByText('이미 사용 중인 이메일입니다.')
      ).toBeInTheDocument();
    });
  });
});
