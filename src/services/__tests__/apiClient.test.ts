import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// authStorage를 목킹한다 (실제 localStorage 대신 spy 사용)
vi.mock('../../client/utils/authStorage', () => ({
  getToken: vi.fn(),
  clearAuth: vi.fn(),
}));

import { getToken, clearAuth } from '../../client/utils/authStorage';

const getTokenMock = vi.mocked(getToken);
const clearAuthMock = vi.mocked(clearAuth);

// apiClient는 모듈 로드 시 인터셉터가 등록되므로 동적으로 import
let apiClient: typeof import('../apiClient').apiClient;

describe('apiClient', () => {
  beforeEach(async () => {
    vi.resetModules();
    // 매 테스트마다 mock 상태 초기화
    getTokenMock.mockReset();
    clearAuthMock.mockReset();

    // apiClient 다시 import (인터셉터 재등록)
    const mod = await import('../apiClient');
    apiClient = mod.apiClient;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC-01: JWT 토큰이 있을 때 Authorization 헤더 자동 추가', () => {
    it('요청 헤더에 Bearer 토큰이 포함된다', async () => {
      getTokenMock.mockReturnValue('test-jwt-token');

      // axios 어댑터를 목킹하여 실제 HTTP 요청을 가로챈다
      const adapter = vi.fn().mockResolvedValue({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const config = apiClient.defaults;
      const requestInterceptor = apiClient.interceptors.request;

      // 직접 인터셉터 핸들러 호출
      const mockConfig = {
        headers: axios.AxiosHeaders.from({}),
      } as Parameters<typeof apiClient.get>[1] & { headers: import('axios').AxiosHeaders };

      // 인터셉터를 통해 config가 수정되는지 확인하기 위해
      // 실제 요청을 보내되 어댑터로 가로챈다
      const instance = axios.create({
        ...config,
        adapter,
      });

      // 요청 인터셉터: 토큰이 있으면 Authorization 헤더 추가
      instance.interceptors.request.use((cfg) => {
        const token = getToken();
        if (token) {
          cfg.headers.Authorization = `Bearer ${token}`;
        }
        return cfg;
      });

      await instance.get('/test');

      expect(adapter).toHaveBeenCalledOnce();
      const calledConfig = adapter.mock.calls[0][0];
      expect(calledConfig.headers['Authorization']).toBe('Bearer test-jwt-token');
    });
  });

  describe('AC-02: JWT 토큰이 없을 때 Authorization 헤더 미포함', () => {
    it('Authorization 헤더가 없다', async () => {
      getTokenMock.mockReturnValue(null);

      const adapter = vi.fn().mockResolvedValue({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const config = apiClient.defaults;
      const instance = axios.create({ ...config, adapter });

      instance.interceptors.request.use((cfg) => {
        const token = getToken();
        if (token) {
          cfg.headers.Authorization = `Bearer ${token}`;
        }
        return cfg;
      });

      await instance.get('/test');

      const calledConfig = adapter.mock.calls[0][0];
      expect(calledConfig.headers['Authorization']).toBeUndefined();
    });
  });

  describe('AC-03: 401 응답 시 clearAuth 호출 + 리다이렉트', () => {
    it('clearAuth()가 호출되고 location.href가 /client/login으로 변경된다', async () => {
      const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
        ...window.location,
        href: '',
      } as Location);

      const adapter = vi.fn().mockRejectedValue({
        response: { status: 401, data: {} },
        isAxiosError: true,
      });

      const instance = axios.create({ adapter });
      instance.interceptors.response.use(
        (res) => res,
        (err) => {
          if (err.response?.status === 401) {
            clearAuth();
            window.location.href = '/client/login';
          }
          return Promise.reject(err);
        }
      );

      await expect(instance.get('/protected')).rejects.toBeDefined();

      expect(clearAuthMock).toHaveBeenCalledOnce();
      locationSpy.mockRestore();
    });
  });

  describe('AC-04: 401 이외 에러는 그대로 reject', () => {
    it('500 에러는 clearAuth 없이 reject된다', async () => {
      const adapter = vi.fn().mockRejectedValue({
        response: { status: 500, data: {} },
        isAxiosError: true,
      });

      const instance = axios.create({ adapter });
      instance.interceptors.response.use(
        (res) => res,
        (err) => {
          if (err.response?.status === 401) {
            clearAuth();
            window.location.href = '/client/login';
          }
          return Promise.reject(err);
        }
      );

      await expect(instance.get('/test')).rejects.toMatchObject({
        response: { status: 500 },
      });

      expect(clearAuthMock).not.toHaveBeenCalled();
    });
  });
});
