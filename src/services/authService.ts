import { apiClient } from './apiClient';
import { setToken, clearAuth } from '../client/utils/authStorage';
import type { LoginRequest, SignupRequest, TokenResponse, Member } from '../shared/types';

export const authService = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/api/auth/login', data);
    setToken(res.data.accessToken);
    return res.data;
  },

  signup: async (data: SignupRequest): Promise<Member> => {
    const res = await apiClient.post<Member>('/api/auth/signup', data);
    return res.data;
  },

  logout: (): void => {
    clearAuth();
  },
};
