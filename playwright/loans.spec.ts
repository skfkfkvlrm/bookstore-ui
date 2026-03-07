import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './fixtures/auth';

/**
 * E2E 대출 시나리오 (E-LN)
 *
 * 전제 조건: Spring Boot 백엔드(localhost:8080)가 실행 중이어야 한다.
 * 정책: 모든 테스트 회원은 테스트 시작 시 신규 가입한다.
 */

test.describe('E-LN: 대출 시나리오', () => {
  test('E-LN-01: 로그인 후 내 대출 내역 페이지 접근', async ({ page, request }) => {
    const user = await createTestUser(request);
    const token = await loginUser(request, user.email, user.password);

    // localStorage에 토큰 설정 후 페이지 이동
    await page.goto('/client');
    await page.evaluate((t) => {
      localStorage.setItem('library_access_token', t);
      // 최소 사용자 정보 설정 (페이지 접근용)
      localStorage.setItem('library_current_user', JSON.stringify({
        id: 0,
        name: '테스트 사용자',
        email: t,
        membershipType: 'REGULAR',
        joinDate: new Date().toISOString(),
      }));
    }, token);

    await page.goto('/client/loans');
    await expect(page).toHaveURL(/\/client\/loans/);

    // 신규 회원은 대출이 없으므로 빈 메시지 노출
    await expect(page.getByText('내 대출 내역')).toBeVisible();
  });

  test('E-LN-02: 비로그인 상태에서 대출 페이지 접근 차단', async ({ page }) => {
    // localStorage 초기화
    await page.evaluate(() => {
      localStorage.removeItem('library_access_token');
      localStorage.removeItem('library_current_user');
    });

    await page.goto('/client/loans');

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/client\/login/);
  });

  test('E-LN-03: 대출 내역 통계 카드 확인', async ({ page, request }) => {
    const user = await createTestUser(request);
    const token = await loginUser(request, user.email, user.password);

    await page.goto('/client');
    await page.evaluate((t) => {
      localStorage.setItem('library_access_token', t);
      localStorage.setItem('library_current_user', JSON.stringify({
        id: 0,
        name: user.name,
        email: user.email,
        membershipType: 'REGULAR',
        joinDate: new Date().toISOString(),
      }));
    }, token);

    await page.goto('/client/loans');

    // 통계 카드 확인 (신규 회원은 모두 0)
    await expect(page.getByText('총 대출 건수')).toBeVisible();
    await expect(page.getByText('대여 중')).toBeVisible();
    await expect(page.getByText('반납 완료')).toBeVisible();
  });

  test('E-LN-04: 대출 필터 버튼 동작', async ({ page, request }) => {
    const user = await createTestUser(request);
    const token = await loginUser(request, user.email, user.password);

    await page.goto('/client');
    await page.evaluate((t) => {
      localStorage.setItem('library_access_token', t);
      localStorage.setItem('library_current_user', JSON.stringify({
        id: 0,
        name: user.name,
        email: user.email,
        membershipType: 'REGULAR',
        joinDate: new Date().toISOString(),
      }));
    }, token);

    await page.goto('/client/loans');

    // 필터 버튼들 확인
    await expect(page.getByRole('button', { name: /전체/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /대여 중/ })).toBeVisible();

    // 대여 중 필터 클릭
    await page.getByRole('button', { name: /대여 중/ }).click();
    // 필터가 활성화되어도 빈 상태 메시지 노출 (신규 회원)
    await expect(
      page.getByText('대여 중 상태의 내역이 없습니다.').or(page.getByText('대출한 도서가 아직 없습니다.'))
    ).toBeVisible();
  });
});
