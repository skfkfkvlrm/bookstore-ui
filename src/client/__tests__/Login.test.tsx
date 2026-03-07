import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';

// authService 목킹
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// authStorage 목킹
vi.mock('../utils/authStorage', () => ({
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  clearAuth: vi.fn(),
  getCurrentUser: vi.fn(() => null),
  setCurrentUserFromToken: vi.fn(),
  isAuthenticated: vi.fn(() => false),
}));

import { authService } from '../../services/authService';

const loginMock = vi.mocked(authService.login);

const mockToken = { accessToken: 'fake-token' };

function renderLogin(initialPath = '/client/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Login />
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LP-01: 초기 렌더링', () => {
    it('이메일·비밀번호 입력 필드와 로그인 버튼이 노출된다', () => {
      renderLogin();

      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument();
    });
  });

  describe('LP-02: 로그인 성공', () => {
    it('authService.login이 호출된다', async () => {
      loginMock.mockResolvedValue(mockToken);

      renderLogin();

      await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: /로그인/ }));

      await waitFor(() => {
        expect(loginMock).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });

  describe('LP-03: 로그인 실패 — 401', () => {
    it('"이메일 또는 비밀번호가 올바르지 않습니다" 에러 메시지가 노출된다', async () => {
      const error = Object.assign(new Error('Unauthorized'), {
        response: { status: 401, data: {} },
        isAxiosError: true,
      });
      loginMock.mockRejectedValue(error);

      renderLogin();

      await userEvent.type(screen.getByLabelText('이메일'), 'wrong@example.com');
      await userEvent.type(screen.getByLabelText('비밀번호'), 'wrongpass');
      await userEvent.click(screen.getByRole('button', { name: /로그인/ }));

      expect(
        await screen.findByText('이메일 또는 비밀번호가 올바르지 않습니다.')
      ).toBeInTheDocument();
    });

    it('응답 message가 있으면 해당 메시지를 우선 노출한다', async () => {
      const error = Object.assign(new Error('Unauthorized'), {
        response: {
          status: 401,
          data: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        },
        isAxiosError: true,
      });
      loginMock.mockRejectedValue(error);

      renderLogin();

      await userEvent.type(screen.getByLabelText('이메일'), 'wrong@example.com');
      await userEvent.type(screen.getByLabelText('비밀번호'), 'wrongpass');
      await userEvent.click(screen.getByRole('button', { name: /로그인/ }));

      expect(
        await screen.findByText('이메일 또는 비밀번호가 올바르지 않습니다.')
      ).toBeInTheDocument();
    });
  });

  describe('LP-04: 로그인 실패 — 네트워크 오류', () => {
    it('"서버에 연결할 수 없습니다" 에러 메시지가 노출된다', async () => {
      loginMock.mockRejectedValue(new Error('Network Error'));

      renderLogin();

      await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: /로그인/ }));

      expect(
        await screen.findByText(/서버에 연결할 수 없습니다/)
      ).toBeInTheDocument();
    });
  });

  describe('LP-05: 로딩 상태', () => {
    it('제출 후 응답 대기 중 버튼이 비활성화된다', async () => {
      loginMock.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockToken), 200))
      );

      renderLogin();

      await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');

      const button = screen.getByRole('button', { name: /로그인/ });
      await userEvent.click(button);

      // 로딩 중 버튼 비활성화 확인
      expect(button).toBeDisabled();
    });
  });

  describe('LP-06: 회원가입 링크', () => {
    it('/client/register 로 이동하는 링크가 있다', () => {
      renderLogin();

      const link = screen.getByRole('link', { name: '회원가입' });
      expect(link).toHaveAttribute('href', '/client/register');
    });
  });
});
