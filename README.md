# 📚 bookstore-ui (도서 구매·대여 포털 프론트엔드)

React 19 + TypeScript + Vite 7 + TailwindCSS 기반으로 구축된 **도서 구매·대여 서비스 포털 웹 애플리케이션**입니다.  
학생/일반 사용자 포털과 관리자 포털이 **단일 레포지토리 듀얼 앱(ClientApp / AdminApp)** 구조로 분리되어 있으며, Vercel을 통해 프로덕션 배포됩니다.

[![GitHub Repo](https://img.shields.io/badge/GitHub-bookstore--ui-181717?logo=github)](https://github.com/skfkfkvlrm/bookstore-ui)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646C9A?logo=vite)](https://vitejs.dev/)
[![Vercel Production](https://img.shields.io/badge/Production-book.skfkfkvlrm.kr-black?logo=vercel)](https://book.skfkfkvlrm.kr)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📌 1. 듀얼 앱 구조 (ClientApp / AdminApp)

단일 레포지토리 내에서 학생/사용자 포털과 관리자 포털을 완전히 분리하여 권한 오염을 원천 차단합니다.

| 구분 | 사용자 포털 (`ClientApp`) | 관리자 포털 (`AdminApp`) |
|:---|:---|:---|
| **진입 경로** | `/` (루트) | `/admin` |
| **접근 대상** | 일반 사용자 (도서 검색·대여·구매) | 관리자 (도서 등록·회원 관리·주문 관제) |
| **인증 방식** | JWT 토큰 기반 로그인 | 별도 관리자 계정 로그인 (`AdminLogin`) |
| **라우팅 보호** | `ProtectedRoute` | `AdminProtectedRoute` |

---

## ✨ 2. 주요 기능

### 사용자 포털 (ClientApp)
| 페이지 | 경로 | 주요 기능 |
|:---|:---|:---|
| **홈** | `/` | 신간·추천 도서 목록, 배너 |
| **도서 목록** | `/books` | 60권+ 내장 도서 데이터 검색 및 필터링 |
| **도서 상세** | `/books/:id` | 상세 정보, 저자 페이지 연결, 장바구니 담기 |
| **장바구니** | `/cart` | 수량 조절, 선택 삭제, 총 금액 계산 |
| **결제 (체크아웃)** | `/checkout` | **2-Phase PG 결제 모달** (결제 정보 입력 → 확인 → 완료) |
| **내 주문** | `/my-orders` | 주문 내역 조회 및 승인 상태 추적 |
| **내 대여** | `/my-loans` | 대여 현황 조회 및 반납 처리 |
| **내 계정** | `/my-account` | 프로필 조회 및 수정 |
| **구매 승인 요청** | `/approvals` | 기관 구매 전자결재 요청 및 취소 |

### 관리자 포털 (AdminApp)
| 페이지 | 경로 | 주요 기능 |
|:---|:---|:---|
| **대시보드** | `/admin` | 전체 주문·대여·회원 현황 요약 |
| **도서 관리** | `/admin/books` | 도서 등록·수정·삭제, 1,010권 마이그레이션 데이터 시딩 |
| **회원 관리** | `/admin/members` | 회원 목록 조회 및 상세 포트폴리오 확인 |
| **주문 관리** | `/admin/orders` | 주문 상태 전환 (주문 → 처리 → 완료) 및 수동 상태 Override 모달 |
| **구매 승인 관리** | `/admin/approvals` | 전자결재 승인/반려, 상태 수동 전환 |
| **설정** | `/admin/settings` | 시딩 Preset 선택 (60권 내장 / 1,010권 마이그레이션) |

---

## 🚀 3. 기술 스택

| 분류 | 기술 |
|---|---|
| **Core** | React 19, TypeScript 5.x, Vite 7 |
| **Routing** | React Router DOM v7 (듀얼 앱 + 와일드카드 Fallback) |
| **Styling** | TailwindCSS 3.x |
| **HTTP Client** | Axios (`apiClient.ts` — JWT 인터셉터 탑재) |
| **Payment** | 2-Phase PG 결제 모달 (`paymentService.ts`) |
| **Testing** | Vitest / React Testing Library, Playwright (E2E) |
| **Deploy** | Vercel (SPA Rewrite + `/api/*` Cloud Run 역방향 프록시) |

---

## 🔒 4. 프론트엔드 안전 가드

1. **Vercel SPA 404 원천 방지**: `vercel.json` 전역 Rewrite 및 `ClientApp` / `AdminApp` 와일드카드 Fallback 라우트 이중 적용.
2. **Cloud Run API 역방향 프록시**: `vercel.json`의 `/api/*` 경로를 Cloud Run 백엔드로 투명하게 프록시하여 CORS 완전 제거.
3. **JWT 인터셉터**: `apiClient.ts`에서 모든 요청에 `Authorization: Bearer` 자동 삽입 및 401 응답 시 자동 세션 파기.
4. **결제 2-Phase 보호**: 결제 정보 입력 → 서버 사전 승인 확인 → 최종 확정의 2단계 트랜잭션으로 중복 결제 방지.

---

## 📁 5. 프로젝트 구조

```text
src/
├── admin/
│   ├── AdminApp.tsx          # 관리자 라우터 루트 (와일드카드 Fallback 포함)
│   ├── AdminLogin.tsx
│   ├── AdminProtectedRoute.tsx
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   ├── Approvals.tsx         # 관리자 전자결재 승인/반려
│   └── ...
├── client/
│   ├── ClientApp.tsx         # 사용자 라우터 루트 (와일드카드 Fallback 포함)
│   ├── BookList.tsx
│   ├── BookDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx          # 2-Phase PG 결제 모달
│   ├── MyOrders.tsx
│   ├── MyLoans.tsx
│   └── ...
├── services/
│   ├── apiClient.ts          # Axios 기반 JWT 인터셉터
│   ├── authService.ts
│   ├── bookService.ts
│   ├── loanService.ts
│   ├── orderService.ts
│   ├── approvalService.ts
│   └── paymentService.ts     # PG 결제 2-Phase 연동
└── App.tsx                   # ClientApp / AdminApp 분기 진입점
```

---

## 📦 6. 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 구동
npm run dev

# 프로덕션 빌드 검증 (Hermes Gate)
npm run build

# 단위/통합 테스트
npm run test

# E2E 테스트 (Playwright)
npx playwright test
```

---

## 🔗 7. 관련 레포지토리
- 🖥️ 백엔드 API 서버: [bookstore-backend](https://github.com/skfkfkvlrm/bookstore-backend)
- 📚 마스터 기획서 및 감사 보고서: [skfkfkvlrm-json-lib](https://github.com/skfkfkvlrm/skfkfkvlrm-json-lib)
