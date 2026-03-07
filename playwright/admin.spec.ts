import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './fixtures/auth';

/**
 * E2E 관리자 시나리오 (E-AD)
 *
 * 전제 조건: Spring Boot 백엔드(localhost:8080)가 실행 중이어야 한다.
 * 정책: 모든 테스트 회원은 테스트 시작 시 신규 가입한다.
 */

const API_BASE = 'http://localhost:8080';

/** 테스트용 토큰을 localStorage에 주입 */
async function injectToken(page: import('@playwright/test').Page, token: string) {
  await page.goto('/admin');
  await page.evaluate((t) => {
    localStorage.setItem('library_access_token', t);
  }, token);
}

/** 회원 이름으로 검색하여 첫 번째 회원 ID를 반환 */
async function getMemberIdByName(
  request: import('@playwright/test').APIRequestContext,
  token: string,
  name: string,
): Promise<number | null> {
  const res = await request.get(`${API_BASE}/api/members/search`, {
    params: { name, page: 0, size: 10 },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return null;
  const body = await res.json();
  return body.content?.[0]?.id ?? null;
}

/** 도서 목록에서 첫 번째 도서 ID를 반환 */
async function getFirstBookId(
  request: import('@playwright/test').APIRequestContext,
  token: string,
): Promise<number | null> {
  const res = await request.get(`${API_BASE}/api/books`, {
    params: { page: 0, size: 1 },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return null;
  const body = await res.json();
  return body.content?.[0]?.id ?? null;
}

/** PENDING 주문을 API로 생성하고 주문 ID를 반환 */
async function createTestOrder(
  request: import('@playwright/test').APIRequestContext,
  token: string,
  memberId: number,
  bookId: number,
): Promise<number | null> {
  const res = await request.post(`${API_BASE}/api/orders`, {
    data: { memberId, items: [{ bookId, quantity: 1 }] },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return null;
  const body = await res.json();
  return body.id ?? null;
}

/** 관리자 API로 대출을 생성하고 대출 ID를 반환 */
async function createTestLoan(
  request: import('@playwright/test').APIRequestContext,
  token: string,
  memberId: number,
  bookId: number,
): Promise<number | null> {
  const future = new Date();
  future.setDate(future.getDate() + 14);

  const res = await request.post(`${API_BASE}/api/admin/loans`, {
    data: {
      memberId,
      bookId,
      dueDate: future.toISOString(),
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return null;
  const body = await res.json();
  return body.id ?? null;
}

test.describe('E-AD: 관리자 시나리오', () => {
  test('E-AD-01: 주문 확정 처리', async ({ page, request }) => {
    const user = await createTestUser(request);
    const token = await loginUser(request, user.email, user.password);
    await injectToken(page, token);

    const memberId = await getMemberIdByName(request, token, user.name);
    if (!memberId) {
      test.skip(true, '회원 ID를 찾을 수 없습니다.');
      return;
    }

    const bookId = await getFirstBookId(request, token);
    if (!bookId) {
      test.skip(true, '도서가 없습니다.');
      return;
    }

    const orderId = await createTestOrder(request, token, memberId, bookId);
    if (!orderId) {
      test.skip(true, '테스트 주문 생성 실패.');
      return;
    }

    // 관리자 주문 상세 페이지 이동
    await page.goto(`/admin/orders/${orderId}`);
    await expect(page.getByRole('heading', { name: /Order Details/i })).toBeVisible();

    // PENDING 상태의 "주문 확정" 버튼 클릭
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '주문 확정' }).click();

    // 상태가 CONFIRMED(확정)로 변경되어야 함
    await expect(page.getByText('확정')).toBeVisible({ timeout: 10000 });
  });

  test('E-AD-02: 배송 처리 흐름 (확정 → 배송 시작)', async ({ page, request }) => {
    const user = await createTestUser(request);
    const token = await loginUser(request, user.email, user.password);
    await injectToken(page, token);

    const memberId = await getMemberIdByName(request, token, user.name);
    if (!memberId) {
      test.skip(true, '회원 ID를 찾을 수 없습니다.');
      return;
    }

    const bookId = await getFirstBookId(request, token);
    if (!bookId) {
      test.skip(true, '도서가 없습니다.');
      return;
    }

    const orderId = await createTestOrder(request, token, memberId, bookId);
    if (!orderId) {
      test.skip(true, '테스트 주문 생성 실패.');
      return;
    }

    // 주문 확정 (API로 직접 처리)
    await request.patch(`${API_BASE}/api/orders/${orderId}/confirm`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 관리자 주문 상세 페이지 이동
    await page.goto(`/admin/orders/${orderId}`);
    await expect(page.getByRole('heading', { name: /Order Details/i })).toBeVisible();

    // CONFIRMED 상태의 "배송 시작" 버튼 클릭
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '배송 시작' }).click();

    // 상태가 SHIPPED(배송 중)로 변경되어야 함
    await expect(page.getByText('배송 중')).toBeVisible({ timeout: 10000 });
  });

  test('E-AD-03: 대출 반납 처리', async ({ page, request }) => {
    const user = await createTestUser(request);
    const token = await loginUser(request, user.email, user.password);
    await injectToken(page, token);

    const memberId = await getMemberIdByName(request, token, user.name);
    if (!memberId) {
      test.skip(true, '회원 ID를 찾을 수 없습니다.');
      return;
    }

    const bookId = await getFirstBookId(request, token);
    if (!bookId) {
      test.skip(true, '도서가 없습니다.');
      return;
    }

    const loanId = await createTestLoan(request, token, memberId, bookId);
    if (!loanId) {
      test.skip(true, '테스트 대출 생성 실패.');
      return;
    }

    // 관리자 대출 상세 페이지 이동
    await page.goto(`/admin/loans/${loanId}`);
    await expect(page.getByRole('heading', { name: /Loan Details/i })).toBeVisible();

    // "Mark as Returned" 버튼 클릭
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Mark as Returned' }).click();

    // 상태가 RETURNED로 변경되어야 함
    await expect(page.getByText('RETURNED')).toBeVisible({ timeout: 10000 });
  });

  test('E-AD-04: 도서 정보 수정 (가격 변경)', async ({ page, request }) => {
    const user = await createTestUser(request);
    const token = await loginUser(request, user.email, user.password);
    await injectToken(page, token);

    const bookId = await getFirstBookId(request, token);
    if (!bookId) {
      test.skip(true, '도서가 없습니다.');
      return;
    }

    // 관리자 도서 상세 페이지 이동
    await page.goto(`/admin/books/${bookId}`);
    await expect(page.getByRole('heading', { name: '도서 상세' })).toBeVisible();

    // 편집 버튼 클릭
    await page.getByRole('button', { name: '편집' }).click();

    // 가격 필드 변경
    const priceInput = page.getByRole('spinbutton');
    await priceInput.clear();
    await priceInput.fill('19999');

    // 변경 사항 저장 버튼 클릭
    await page.getByRole('button', { name: '변경 사항 저장' }).click();

    // 변경된 가격이 화면에 반영되어야 함
    await expect(page.getByText('19,999원')).toBeVisible({ timeout: 10000 });
  });

  test('E-AD-05: 회원 검색', async ({ page, request }) => {
    const user = await createTestUser(request);
    const token = await loginUser(request, user.email, user.password);
    await injectToken(page, token);

    // 관리자 회원 목록 페이지 이동
    await page.goto('/admin/members');
    await expect(page.getByRole('heading', { name: 'Manage Members' })).toBeVisible();

    // 테스트 회원 이름으로 검색 (placeholder: "이름으로 검색 후 Enter")
    const searchInput = page.getByPlaceholder('이름으로 검색 후 Enter');
    await searchInput.fill(user.name);
    await searchInput.press('Enter');

    // 해당 회원이 검색 결과에 노출되어야 함
    await expect(page.getByText(user.email)).toBeVisible({ timeout: 10000 });
  });
});
