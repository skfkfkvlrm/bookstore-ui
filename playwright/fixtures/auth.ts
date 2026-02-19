import type { APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:8080';

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/**
 * E2E 테스트용 신규 회원 생성 헬퍼
 *
 * 정책: 모든 테스트 회원은 테스트 실행 시 새로 가입(회원가입 API)한다.
 * 기존 DB 회원에 의존하지 않는다.
 */
export async function createTestUser(request: APIRequestContext): Promise<TestUser> {
  const timestamp = Date.now();
  const user: TestUser = {
    name: `테스트유저_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'test1234',
  };

  const res = await request.post(`${API_BASE}/api/auth/signup`, {
    data: { name: user.name, email: user.email, password: user.password },
  });

  if (!res.ok()) {
    throw new Error(`회원 가입 실패: ${res.status()} — ${await res.text()}`);
  }

  return user;
}

/**
 * 로그인하고 accessToken을 반환한다.
 */
export async function loginUser(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> {
  const res = await request.post(`${API_BASE}/api/auth/login`, {
    data: { email, password },
  });

  if (!res.ok()) {
    throw new Error(`로그인 실패: ${res.status()} — ${await res.text()}`);
  }

  const body = await res.json();
  return body.accessToken as string;
}
