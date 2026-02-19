import type { Member } from "../../shared/types";
import membersData from "../../shared/data/members.json";

const AUTH_STORAGE_KEY = "library_current_user";
const USERS_STORAGE_KEY = "library_users";
const TOKEN_STORAGE_KEY = "library_access_token";

// Token management
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > (payload.exp as number);
};

export const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearAuth();
    return null;
  }
  return token;
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  dispatchAuthChangeEvent();
};

// Decode JWT payload (client-side, no verification)
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Store minimal user info after API login
export const setCurrentUserFromToken = (token: string, name?: string): void => {
  const payload = decodeToken(token);
  const email = (payload?.sub ?? payload?.email ?? '') as string;
  const memberId = (payload?.memberId ?? payload?.id ?? 0) as number;
  // role: Spring Boot JWT claim — 필드명이 auth / role / roles 중 하나일 수 있음
  const rawRole = payload?.auth ?? payload?.role ?? payload?.roles?.[0] ?? 'USER';
  const role = (typeof rawRole === 'string' ? rawRole.replace('ROLE_', '') : 'USER') as 'USER' | 'ADMIN';
  const partial: Member = {
    id: memberId,
    name: name ?? email.split('@')[0],
    email,
    membershipType: 'REGULAR',
    joinDate: new Date().toISOString(),
    role,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(partial));
  dispatchAuthChangeEvent();
};

export const isAdmin = (): boolean => {
  return getCurrentUser()?.role === 'ADMIN';
};

// Helper function to dispatch auth change event
const dispatchAuthChangeEvent = () => {
  window.dispatchEvent(new CustomEvent('authChange'));
};

export const getStoredUsers = (): Member[] => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const getAllUsers = (): Member[] => {
  const jsonUsers = membersData as Member[];
  const localUsers = getStoredUsers();
  const localUserIds = new Set(localUsers.map(u => u.id));

  // localStorage 유저가 우선, JSON 유저는 중복 제외
  const jsonUsersFiltered = jsonUsers.filter(u => !localUserIds.has(u.id));
  return [...localUsers, ...jsonUsersFiltered];
};

export const getCurrentUser = (): Member | null => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token && isTokenExpired(token)) {
    clearAuth();
    return null;
  }
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const login = (email: string): Member | null => {
  const allUsers = getAllUsers();
  const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    dispatchAuthChangeEvent();
    return user;
  }

  return null;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  dispatchAuthChangeEvent();
};

export const register = (userData: {
  name: string;
  email: string;
  membershipType: "REGULAR" | "PREMIUM";
}): Member => {
  const allUsers = getAllUsers();

  // Check if email already exists
  const existingUser = allUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const localUsers = getStoredUsers();
  const maxId = Math.max(0, ...allUsers.map(u => u.id));

  const newUser: Member = {
    id: maxId + 1,
    name: userData.name,
    email: userData.email,
    membershipType: userData.membershipType,
    status: "ACTIVE",
    joinDate: new Date().toISOString(),
  };

  const updatedUsers = [newUser, ...localUsers];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

  // Auto login after registration
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
  dispatchAuthChangeEvent();

  return newUser;
};

export const updateUser = (userId: number, updates: Partial<Member>): Member => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.id !== userId) {
    throw new Error("Unauthorized");
  }

  const localUsers = getStoredUsers();
  const userIndex = localUsers.findIndex(u => u.id === userId);

  let updatedUser: Member;

  if (userIndex >= 0) {
    // Update existing local user
    updatedUser = { ...localUsers[userIndex], ...updates };
    localUsers[userIndex] = updatedUser;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(localUsers));
  } else {
    // User from JSON, copy to localStorage with updates
    const jsonUser = (membersData as Member[]).find(u => u.id === userId);
    if (!jsonUser) {
      throw new Error("User not found");
    }
    updatedUser = { ...jsonUser, ...updates };
    const newLocalUsers = [updatedUser, ...localUsers];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newLocalUsers));
  }

  // Update current user in auth storage
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  dispatchAuthChangeEvent();

  return updatedUser;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
