import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './fixtures/auth';

/**
 * E2E 주문 시나리오 (E-OR)
 *
 * 전제 조건: Spring Boot 백엔드(localhost:8080)가 실행 중이어야 한다.
 * 정책: 모든 테스트 회원은 테스트 시작 시 신규 가입한다.
 */

test.describe('E-OR: 주문 시나리오', () => {
  async function setupLoggedInUser(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext) {
    const user = await createTestUser(request);
    const token = await loginUser(request, user.email, user.password);

    await page.goto('/client');
    await page.evaluate((t) => {
      localStorage.setItem('library_access_token', t);
      localStorage.setItem('library_current_user', JSON.stringify({
        id: 0,
        name: '테스트 사용자',
        email: 'test@example.com',
        membershipType: 'REGULAR',
        joinDate: new Date().toISOString(),
      }));
    }, token);

    return user;
  }

  test('E-OR-01: 로그인 후 내 주문 내역 페이지 접근', async ({ page, request }) => {
    await setupLoggedInUser(page, request);

    await page.goto('/client/orders');
    await expect(page).toHaveURL(/\/client\/orders/);
    await expect(page.getByText('내 주문 내역')).toBeVisible();
  });

  test('E-OR-02: 비로그인 상태에서 주문 페이지 접근 차단', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('library_access_token');
      localStorage.removeItem('library_current_user');
    });

    await page.goto('/client/orders');
    await expect(page).toHaveURL(/\/client\/login/);
  });

  test('E-OR-03: 주문 통계 카드 확인', async ({ page, request }) => {
    await setupLoggedInUser(page, request);

    await page.goto('/client/orders');

    // 통계 카드 확인
    await expect(page.getByText('총 주문')).toBeVisible();
    await expect(page.getByText('접수')).toBeVisible();
  });

  test('E-OR-04: 빈 주문 목록 메시지', async ({ page, request }) => {
    await setupLoggedInUser(page, request);

    await page.goto('/client/orders');

    // 신규 회원은 주문이 없음
    await expect(
      page.getByText('아직 주문 내역이 없습니다.')
    ).toBeVisible({ timeout: 10000 });
  });

  test('E-OR-05: 주문 필터 버튼 동작', async ({ page, request }) => {
    await setupLoggedInUser(page, request);

    await page.goto('/client/orders');

    // 필터 버튼들 확인
    await expect(page.getByRole('button', { name: /전체/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /접수/ })).toBeVisible();

    // 필터 클릭
    await page.getByRole('button', { name: /접수/ }).click();
    await expect(
      page.getByText('접수 상태의 주문이 없습니다.').or(page.getByText('아직 주문 내역이 없습니다.'))
    ).toBeVisible();
  });
});
