import { describe, it, expect, vi, beforeEach } from 'vitest';

// apiClient 목킹
vi.mock('../apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

// authStorage 목킹
vi.mock('../../client/utils/authStorage', () => ({
  setToken: vi.fn(),
  clearAuth: vi.fn(),
  setCurrentUserFromToken: vi.fn(),
}));

import { apiClient } from '../apiClient';
import { setToken, clearAuth } from '../../client/utils/authStorage';
import { authService } from '../authService';
import type { Member, TokenResponse } from '../../shared/types';

const postMock = vi.mocked(apiClient.post);
const setTokenMock = vi.mocked(setToken);
const clearAuthMock = vi.mocked(clearAuth);

const mockToken: TokenResponse = { accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.fake' };

const mockMember: Member = {
  id: 1,
  name: '신규회원',
  email: 'new@example.com',
  membershipType: 'REGULAR',
  joinDate: new Date().toISOString(),
};

const mockSignupRequest = {
  name: '신규회원',
  email: `test_${Date.now()}@example.com`,
  password: 'test1234',
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AU-01: 로그인 성공 시 토큰 저장', () => {
    it('setToken이 accessToken으로 호출된다', async () => {
      postMock.mockResolvedValue({ data: mockToken });

      await authService.login({ email: 'test@example.com', password: 'pass' });

      expect(postMock).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'pass',
      });
      expect(setTokenMock).toHaveBeenCalledWith(mockToken.accessToken);
    });
  });

  describe('AU-02: 로그인 성공 시 반환값 확인', () => {
    it('TokenResponse를 반환한다', async () => {
      postMock.mockResolvedValue({ data: mockToken });

      const result = await authService.login({ email: 'test@example.com', password: 'pass' });

      expect(result).toEqual(mockToken);
    });
  });

  describe('AU-03: 로그인 실패 시 에러 전파', () => {
    it('401 에러가 reject된다', async () => {
      const error = Object.assign(new Error('Unauthorized'), {
        response: { status: 401 },
        isAxiosError: true,
      });
      postMock.mockRejectedValue(error);

      await expect(
        authService.login({ email: 'wrong@example.com', password: 'wrong' })
      ).rejects.toMatchObject({ response: { status: 401 } });

      expect(setTokenMock).not.toHaveBeenCalled();
    });
  });

  describe('AU-04: 회원가입 성공', () => {
    it('새로 가입한 회원 정보를 반환한다', async () => {
      postMock.mockResolvedValue({ data: mockMember });

      const result = await authService.signup(mockSignupRequest);

      expect(postMock).toHaveBeenCalledWith('/api/auth/signup', mockSignupRequest);
      expect(result).toEqual(mockMember);
    });
  });

  describe('AU-05: 회원가입 이메일 중복 — 409', () => {
    it('409 에러가 reject된다', async () => {
      const error = Object.assign(new Error('Conflict'), {
        response: { status: 409, data: { message: '이미 사용 중인 이메일입니다.' } },
        isAxiosError: true,
      });
      postMock.mockRejectedValue(error);

      await expect(
        authService.signup({ ...mockSignupRequest, email: 'dup@example.com' })
      ).rejects.toMatchObject({ response: { status: 409 } });
    });
  });

  describe('AU-06: 로그아웃 시 인증 정보 클리어', () => {
    it('clearAuth()가 호출된다', () => {
      authService.logout();

      expect(clearAuthMock).toHaveBeenCalledOnce();
    });
  });
});
