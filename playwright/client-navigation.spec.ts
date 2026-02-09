import { test, expect } from '@playwright/test'

test.describe('클라이언트 내비게이션', () => {
  test('홈에서 주요 메뉴 탐색', async ({ page }) => {
    await page.goto('/client')
    await expect(page.getByRole('heading', { name: '스프링 도서관에 오신 것을 환영합니다' })).toBeVisible()

    await page.getByRole('link', { name: '도서 둘러보기' }).click()
    await expect(page).toHaveURL(/\/client\/books/)
    await expect(page.getByText('전체 도서')).toBeVisible()

    await page.goto('/client/about')
    await expect(page.getByText('지식과 사람을 연결하는 차세대 도서관')).toBeVisible()

    await page.goto('/client/contact')
    await expect(page.getByRole('heading', { name: '궁금한 내용을 알려주세요' })).toBeVisible()
    await page.getByLabel('이름').fill('플레이윗 사용자')
    await page.getByLabel('이메일').fill('playwright@example.com')
    await page.getByLabel('문의 유형').selectOption('서비스 이용 문의')
    await page.getByLabel('문의 내용').fill('E2E 테스트에서 남기는 문의입니다.')
    await page.getByRole('button', { name: '문의 전송' }).click()
    await expect(page.getByText(/접수되었습니다/)).toBeVisible()

    await page.goto('/client/privacy')
    await expect(page.getByRole('heading', { name: '개인정보 처리방침' })).toBeVisible()
  })

  test('작가 상세 페이지 확인', async ({ page }) => {
    await page.goto('/client/authors/James%20Clear')
    await expect(page.getByRole('heading', { name: /James Clear/ })).toBeVisible()
    await expect(page.getByText('대표 도서')).toBeVisible()
  })
})
