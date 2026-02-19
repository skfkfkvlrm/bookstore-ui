import { test, expect } from '@playwright/test';

/**
 * E2E 도서 검색 시나리오 (E-BK)
 *
 * 전제 조건: Spring Boot 백엔드(localhost:8080)가 실행 중이어야 한다.
 */

test.describe('E-BK: 도서 브라우징 시나리오', () => {
  test('E-BK-01: 도서 목록 페이지 진입', async ({ page }) => {
    await page.goto('/client/books');

    await expect(page.getByText('전체 도서')).toBeVisible();
    // API에서 도서 데이터를 불러오거나 "조건에 맞는 도서를 찾지 못했습니다" 노출
    await expect(
      page.getByText('전체 도서').or(page.getByText('조건에 맞는 도서를 찾지 못했습니다.'))
    ).toBeVisible();
  });

  test('E-BK-02: 도서 키워드 검색', async ({ page }) => {
    await page.goto('/client/books');

    const searchInput = page.getByPlaceholder('제목·저자·ISBN으로 검색');
    await searchInput.fill('리액트');
    await searchInput.press('Enter');

    // URL에 search 파라미터 포함
    await expect(page).toHaveURL(/search=리액트/);

    // 검색 결과 헤더 확인
    await expect(
      page.getByText('"리액트" 검색 결과').or(page.getByText('조건에 맞는 도서를 찾지 못했습니다.'))
    ).toBeVisible();
  });

  test('E-BK-03: 도서 상세 페이지 이동', async ({ page }) => {
    await page.goto('/client/books');

    // 도서가 있으면 첫 번째 도서 클릭
    const bookCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /.+/ });
    const count = await bookCards.count();

    if (count > 0) {
      await bookCards.first().click();
      // 도서 상세 URL 패턴 확인
      await expect(page).toHaveURL(/\/client\/books\/\d+/);
    } else {
      // 도서가 없으면 테스트 스킵 (백엔드 데이터 없음)
      test.skip();
    }
  });

  test('E-BK-04: 홈에서 도서 검색창 사용', async ({ page }) => {
    await page.goto('/client');

    const heroSearch = page.getByPlaceholder(/도서를 검색/i).first();
    if (await heroSearch.isVisible()) {
      await heroSearch.fill('타입스크립트');
      await heroSearch.press('Enter');
      await expect(page).toHaveURL(/search=타입스크립트/);
    } else {
      // 홈에 검색창이 없으면 직접 북 목록으로 이동
      await page.getByRole('link', { name: /도서 둘러보기/ }).click();
      await expect(page).toHaveURL(/\/client\/books/);
    }
  });
});
