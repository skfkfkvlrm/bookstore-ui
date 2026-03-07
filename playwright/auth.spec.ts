import { test, expect } from '@playwright/test';
import { createTestUser } from './fixtures/auth';

/**
 * E2E 인증 시나리오 (E-AU)
 *
 * 전제 조건: Spring Boot 백엔드(localhost:8080)가 실행 중이어야 한다.
 * 정책: 모든 테스트 회원은 테스트 시작 시 신규 가입한다.
 */

test.describe('E-AU: 인증 시나리오', () => {
  test('E-AU-01: 신규 회원가입 후 로그인 성공', async ({ page, request }) => {
    // 신규 회원 생성
    const user = await createTestUser(request);

    // 회원가입 페이지 접속
    await page.goto('/client/register');
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();

    // 이미 가입된 회원으로 로그인 테스트
    await page.goto('/client/login');

    await page.getByLabel('이메일').fill(user.email);
    await page.getByLabel('비밀번호').fill(user.password);
    await page.getByRole('button', { name: '로그인' }).click();

    // 로그인 성공 시 /client 로 이동
    await expect(page).toHaveURL(/\/client$/);
  });

  test('E-AU-02: 잘못된 비밀번호로 로그인 실패', async ({ page, request }) => {
    const user = await createTestUser(request);

    await page.goto('/client/login');

    await page.getByLabel('이메일').fill(user.email);
    await page.getByLabel('비밀번호').fill('wrongpassword');
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(
      page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')
    ).toBeVisible();
  });

  test('E-AU-03: 회원가입 폼 유효성 검사', async ({ page }) => {
    await page.goto('/client/register');

    // 빈 폼 제출 시 에러
    await page.getByRole('button', { name: '회원가입' }).click();
    await expect(page.getByText('이름을 입력하세요.')).toBeVisible();

    // 비밀번호 불일치
    await page.getByLabel('이름').fill('테스트 회원');
    await page.getByLabel('이메일').fill(`test_${Date.now()}@example.com`);
    await page.getByLabel('비밀번호').fill('test1234');
    await page.getByLabel('비밀번호 확인').fill('different');
    await page.getByRole('button', { name: '회원가입' }).click();
    await expect(page.getByText('비밀번호가 일치하지 않습니다.')).toBeVisible();
  });

  test('E-AU-04: 이메일 중복 회원가입 실패', async ({ page, request }) => {
    const user = await createTestUser(request);

    await page.goto('/client/register');

    await page.getByLabel('이름').fill('중복 회원');
    await page.getByLabel('이메일').fill(user.email);
    await page.getByLabel('비밀번호').fill('test1234');
    await page.getByLabel('비밀번호 확인').fill('test1234');
    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(
      page.getByText('이미 사용 중인 이메일입니다.')
    ).toBeVisible();
  });

  test('E-AU-05: 로그아웃 후 보호 라우트 접근 차단', async ({ page, request }) => {
    const user = await createTestUser(request);

    // 로그인
    await page.goto('/client/login');
    await page.getByLabel('이메일').fill(user.email);
    await page.getByLabel('비밀번호').fill(user.password);
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page).toHaveURL(/\/client$/);

    // 계정 페이지 접근 (로그인 상태)
    await page.goto('/client/account');
    await expect(page).toHaveURL(/\/client\/account/);

    // localStorage 토큰 제거로 로그아웃 시뮬레이션
    await page.evaluate(() => {
      localStorage.removeItem('library_access_token');
      localStorage.removeItem('library_current_user');
    });

    // 보호 라우트 재접근 시 로그인 페이지로 이동
    await page.goto('/client/account');
    await expect(page).toHaveURL(/\/client\/login/);
  });
});
