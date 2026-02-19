# 테스트 계획서 (Test Plan)

**프로젝트**: Library Management UI
**작성일**: 2026-02-19
**버전**: 1.0
**대상 브랜치**: feature/admin-api (API 연동 완료 상태)

---

## 1. 테스트 목적

Spring Boot 백엔드 API와 연동된 React 클라이언트의 기능이 명세대로 동작하는지 검증한다.
주요 검증 항목은 다음과 같다.

- API 서비스 레이어가 올바른 엔드포인트로 요청을 전송하는지
- 각 페이지가 API 응답을 정상적으로 렌더링하는지
- 인증/인가 흐름이 올바르게 동작하는지
- 주요 사용자 시나리오가 E2E 수준에서 정상 동작하는지

---

## 2. 테스트 환경

### 도구

| 구분 | 도구 | 버전 | 용도 |
|------|------|------|------|
| 단위/통합 | Vitest | ^4.0.18 | 서비스·컴포넌트 테스트 |
| DOM 렌더링 | @testing-library/react | ^16.3.2 | React 컴포넌트 렌더링 |
| 사용자 이벤트 | @testing-library/user-event | ^14.6.1 | 클릭·타이핑 시뮬레이션 |
| DOM 단언 | @testing-library/jest-dom | ^6.9.1 | `toBeInTheDocument` 등 |
| API 목킹 | vitest `vi.mock` / `vi.fn` | - | HTTP 요청 인터셉트 |
| E2E | Playwright | ^1.58.2 | 브라우저 기반 통합 테스트 |

### 실행 명령

```bash
npm run test          # 단위/통합 테스트 1회 실행
npm run test:watch    # 단위/통합 테스트 Watch 모드
npm run test:e2e      # E2E 테스트 (dev 서버 자동 기동)
```

### 디렉토리 구조 (목표)

```
src/
├── services/__tests__/
│   ├── apiClient.test.ts
│   ├── authService.test.ts
│   ├── bookService.test.ts
│   ├── loanService.test.ts
│   ├── orderService.test.ts
│   └── memberService.test.ts
├── client/__tests__/
│   ├── publicPages.test.tsx     ← 기존
│   ├── Login.test.tsx
│   ├── Register.test.tsx
│   ├── BookList.test.tsx
│   ├── BookDetail.test.tsx
│   ├── MyLoans.test.tsx
│   └── MyOrders.test.tsx
└── admin/__tests__/
    ├── LoanList.test.tsx
    ├── LoanDetail.test.tsx
    ├── OrderList.test.tsx
    ├── OrderDetail.test.tsx
    ├── BookList.test.tsx
    ├── BookDetail.test.tsx
    ├── MemberList.test.tsx
    └── MemberDetail.test.tsx

playwright/
├── auth.spec.ts
├── books.spec.ts
├── loans.spec.ts
├── orders.spec.ts
└── admin.spec.ts
```

---

## 3. 단위 테스트 — 서비스 레이어

> **전략**: `vi.mock('../apiClient')` 로 Axios를 목킹하고, 각 서비스 함수가 올바른 URL·파라미터로 호출하는지 검증한다.

### 3-1. `apiClient.test.ts`

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|-----------|
| AC-01 | JWT 토큰이 있을 때 Authorization 헤더 자동 추가 | localStorage에 토큰 저장 | 요청 헤더에 `Bearer {token}` 포함 |
| AC-02 | JWT 토큰이 없을 때 Authorization 헤더 미포함 | localStorage 토큰 없음 | Authorization 헤더 없음 |
| AC-03 | 401 응답 시 localStorage 클리어 + 로그인 페이지 리다이렉트 | API 응답 401 | clearAuth() 호출, location.href 변경 |
| AC-04 | 401 이외 에러는 그대로 reject | API 응답 500 | Promise.reject 발생 |

### 3-2. `authService.test.ts`

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|-----------|
| AU-01 | 로그인 성공 시 토큰 저장 | `POST /api/auth/login` → `{ accessToken }` | `setToken()` 호출, 토큰 localStorage 저장 |
| AU-02 | 로그인 성공 시 사용자 정보 저장 | JWT 페이로드에 email 포함 | `setCurrentUserFromToken()` 호출 |
| AU-03 | 로그인 실패 시 에러 전파 | API 응답 401 | `Promise.reject` 전파 |
| AU-04 | 회원가입 성공 | `POST /api/auth/signup` → 201 | 정상 반환 |
| AU-05 | 회원가입 이메일 중복 | API 응답 409 | `Promise.reject` 전파 |
| AU-06 | 로그아웃 시 토큰·사용자 정보 클리어 | - | `clearAuth()` 호출 |

### 3-3. `bookService.test.ts`

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|-----------|
| BK-01 | 도서 목록 조회 — 기본 파라미터 | `getBooks()` | `GET /api/books?page=0&size=12` |
| BK-02 | 도서 목록 조회 — 커스텀 페이지 | `getBooks(2, 20)` | `GET /api/books?page=2&size=20` |
| BK-03 | 단일 도서 조회 | `getBook(5)` | `GET /api/books/5` |
| BK-04 | 키워드 검색 | `searchByKeyword('react', 0, 12)` | `GET /api/books/search/keyword?keyword=react&page=0&size=12` |
| BK-05 | 도서 등록 | `create({title, author, isbn, price, available})` | `POST /api/books` + 반환 값 검증 |
| BK-06 | 도서 수정 | `update(1, {...})` | `PUT /api/books/1` |
| BK-07 | 도서 삭제 | `delete(1)` | `DELETE /api/books/1` |
| BK-08 | 재고 상태 변경 | `updateAvailability(1, false)` | `PATCH /api/books/1/availability?available=false` |

### 3-4. `loanService.test.ts`

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|-----------|
| LN-01 | 내 대출 목록 조회 | `getMyLoans()` | `GET /api/client/loans` |
| LN-02 | 대출 신청 | `requestLoan({ bookId: 1, loanPeriod: 14 })` | `POST /api/client/loans/request` |
| LN-03 | 반납 처리 | `returnLoan(3)` | `POST /api/client/loans/3/return` |
| LN-04 | 대출 취소 | `cancelLoan(3)` | `DELETE /api/client/loans/3` |
| LN-05 | 관리자 — 전체 대출 조회 | `getAllLoans()` | `GET /api/admin/loans` |
| LN-06 | 관리자 — 단일 대출 조회 | `getLoan(5)` | `GET /api/admin/loans/5` |
| LN-07 | 관리자 — 대출 상태 업데이트 | `updateLoan(5, { status: 'RETURNED' })` | `PATCH /api/admin/loans/5` |
| LN-08 | 관리자 — 연체 대출 목록 | `getOverdueLoans()` | `GET /api/admin/loans/overdue` |
| LN-09 | 관리자 — 회원명으로 검색 | `searchByMemberName('홍길동')` | `GET /api/admin/loans/search/by-member-name?name=홍길동` |

### 3-5. `orderService.test.ts`

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|-----------|
| OR-01 | 주문 목록 조회 | `getOrders(0, 10)` | `GET /api/orders?page=0&size=10` |
| OR-02 | 단일 주문 조회 | `getOrder(1)` | `GET /api/orders/1` |
| OR-03 | 주문 확정 | `confirmOrder(1)` | `PATCH /api/orders/1/confirm` |
| OR-04 | 배송 시작 | `shipOrder(1)` | `PATCH /api/orders/1/ship` |
| OR-05 | 배송 완료 | `deliverOrder(1)` | `PATCH /api/orders/1/deliver` |
| OR-06 | 주문 취소 | `cancelOrder(1)` | `PATCH /api/orders/1/cancel` |
| OR-07 | 주문 통계 조회 | `getStatistics()` | `GET /api/orders/statistics` |

### 3-6. `memberService.test.ts`

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|-----------|
| MB-01 | 회원 목록 조회 | `getMembers(0, 10)` | `GET /api/members?page=0&size=10` |
| MB-02 | 단일 회원 조회 | `getMember(3)` | `GET /api/members/3` |
| MB-03 | 회원 검색 | `search('김', 0, 10)` | `GET /api/members/search?name=김&page=0&size=10` |
| MB-04 | 회원 정보 수정 | `updateMember(3, { name: '홍길동' })` | `PUT /api/members/3` |
| MB-05 | 멤버십 변경 | `updateMembership(3, 'PREMIUM')` | `PUT /api/members/3/membership?membershipType=PREMIUM` |
| MB-06 | 이메일 유효성 검증 | `validateEmail('test@test.com')` | `GET /api/members/email/validate?email=test@test.com` |
| MB-07 | 대출 한도 조회 | `getLoanLimit(3)` | `GET /api/members/3/loan-limit` |

---

## 4. 통합 테스트 — 컴포넌트

> **전략**: 서비스 모듈을 `vi.mock`으로 목킹한 뒤, 컴포넌트가 API 응답에 따라 올바르게 렌더링·상호작용하는지 검증한다.

### 4-1. 클라이언트 페이지

#### `Login.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| LP-01 | 초기 렌더링 | 페이지 접속 | 이메일·비밀번호 입력 필드, 로그인 버튼 노출 |
| LP-02 | 로그인 성공 | 올바른 자격증명 입력 후 제출 | `authService.login` 호출, `/client` 리다이렉트 |
| LP-03 | 로그인 실패 — 401 | 잘못된 비밀번호 | 에러 메시지 "이메일 또는 비밀번호가 올바르지 않습니다" 노출 |
| LP-04 | 로그인 실패 — 네트워크 오류 | API 호출 실패 | 에러 메시지 "서버에 연결할 수 없습니다" 노출 |
| LP-05 | 로딩 상태 | 제출 후 응답 대기 중 | 버튼 비활성화, 스피너 노출 |
| LP-06 | 회원가입 링크 | 페이지 하단 링크 클릭 | `/client/register` 이동 |

#### `Register.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| RG-01 | 이름 미입력 제출 | 이름 필드 비워두고 제출 | "이름을 입력하세요" 에러 |
| RG-02 | 이메일 형식 오류 | 잘못된 이메일 형식 입력 | "올바른 이메일 형식을 입력하세요" 에러 |
| RG-03 | 비밀번호 6자 미만 | 짧은 비밀번호 입력 | "비밀번호는 6자 이상이어야 합니다" 에러 |
| RG-04 | 비밀번호 불일치 | 확인 비밀번호 다르게 입력 | "비밀번호가 일치하지 않습니다" 에러 |
| RG-05 | 회원가입 성공 | 정상 데이터 입력 후 제출 | `authService.signup` 호출, `/client/login` 리다이렉트 |
| RG-06 | 이메일 중복 — 409 | 서버 409 응답 | "이미 사용 중인 이메일입니다" 에러 |

#### `BookList.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| BL-01 | 초기 로딩 | 페이지 접속 | 스피너 노출 후 도서 목록 렌더링 |
| BL-02 | 도서 카드 렌더링 | API 응답 3권 | 도서 제목·저자·가격 모두 노출 |
| BL-03 | 검색 기능 | 검색어 입력 후 Enter | `searchByKeyword` 호출, 결과 갱신 |
| BL-04 | 검색 결과 없음 | 결과 0건 응답 | "조건에 맞는 도서를 찾지 못했습니다" 노출 |
| BL-05 | 페이지네이션 | 2페이지 클릭 | `getBooks(1, 12)` 호출 |
| BL-06 | API 에러 | 서버 500 응답 | 에러 메시지 + 다시 시도 버튼 노출 |
| BL-07 | 다시 시도 | 에러 후 버튼 클릭 | `getBooks` 재호출 |

#### `BookDetail.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| BD-01 | 도서 정보 렌더링 | API 응답 1권 | 제목·저자·ISBN·가격·재고 상태 노출 |
| BD-02 | 대출하기 — 비로그인 | 로그인 안 된 상태에서 클릭 | 경고 alert + 로그인 페이지 이동 |
| BD-03 | 대출하기 — 성공 | `requestLoan` 성공 응답 | confirm 다이얼로그 노출 |
| BD-04 | 대출하기 — 409 중복 | `requestLoan` 409 응답 | "이미 대출 중인 도서입니다" alert |
| BD-05 | 장바구니 담기 | 버튼 클릭 | `addToCart` 호출, confirm 다이얼로그 |
| BD-06 | 재고 없음 | `available: false` | 대출·장바구니 버튼 비활성화 |
| BD-07 | API 에러 | 서버 오류 | 에러 메시지 + 목록으로 돌아가기 링크 |

#### `MyLoans.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| ML-01 | 대출 목록 렌더링 | API 응답 3건 | 도서명·상태 배지·날짜 노출 |
| ML-02 | 통계 카드 | 대여 중 2, 연체 1 | 통계 카드 숫자 정확 |
| ML-03 | 상태 필터 | "연체" 버튼 클릭 | OVERDUE 상태만 노출 |
| ML-04 | 반납하기 | ACTIVE 대출 반납 버튼 클릭 | confirm → `returnLoan` 호출 → 목록 갱신 |
| ML-05 | 취소하기 | ACTIVE 대출 취소 버튼 클릭 | confirm → `cancelLoan` 호출 → 목록 갱신 |
| ML-06 | 대출 내역 없음 | 빈 배열 응답 | "대출한 도서가 아직 없습니다" 노출 |
| ML-07 | CANCELLED 상태 배지 | 취소된 대출 | 취소됨 배지 노출 |

#### `MyOrders.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| MO-01 | 주문 목록 렌더링 | API 응답 2건 | 주문 번호·날짜·금액·상태 노출 |
| MO-02 | 통계 카드 | 전체 2, 접수 1 | 통계 카드 숫자 정확 |
| MO-03 | 상태 필터 | "접수" 버튼 클릭 | PENDING 상태만 노출 |
| MO-04 | 주문 취소 | 취소 버튼 클릭 | confirm → `cancelOrder` 호출 → 목록 갱신 |
| MO-05 | DELIVERED 취소 버튼 | 배송 완료 주문 | 취소 버튼 미노출 |
| MO-06 | 주문 내역 없음 | 빈 배열 응답 | "아직 주문 내역이 없습니다" 노출 |

---

### 4-2. 관리자 페이지

#### `admin/LoanList.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| AL-01 | 대출 목록 렌더링 | API 응답 5건 | 도서명·회원명·상태 노출 |
| AL-02 | 검색 | 검색어 입력 | 매칭 항목만 노출 |
| AL-03 | 상태 필터 | OVERDUE 선택 | 연체 건만 노출 |
| AL-04 | 일괄 반납 | 체크박스 선택 후 Mark as Returned | confirm → `updateLoan` 다건 호출 |
| AL-05 | CANCELLED 상태 | CANCELLED 포함 데이터 | cancelled 배지 노출 |

#### `admin/OrderDetail.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| AO-01 | 주문 상세 렌더링 | API 응답 1건 | 주문번호·고객정보·아이템·금액 노출 |
| AO-02 | PENDING → 확정 | "주문 확정" 클릭 | confirm → `confirmOrder` 호출 → 상태 갱신 |
| AO-03 | CONFIRMED → 배송 | "배송 시작" 클릭 | confirm → `shipOrder` 호출 → 상태 갱신 |
| AO-04 | SHIPPED → 완료 | "배송 완료" 클릭 | confirm → `deliverOrder` 호출 → 상태 갱신 |
| AO-05 | 주문 취소 | "주문 취소" 클릭 | confirm → `cancelOrder` 호출 → 상태 갱신 |
| AO-06 | DELIVERED 상태 | 배송 완료 주문 | 취소/상태변경 버튼 미노출 |
| AO-07 | 로딩 상태 | API 응답 대기 | 스피너 노출 |
| AO-08 | API 에러 | 서버 오류 | 에러 메시지 노출 |

#### `admin/BookList.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| AB-01 | 도서 목록 렌더링 | API 응답 5권 | 표지·제목·저자·ISBN·재고 노출 |
| AB-02 | 검색 (Enter) | 검색어 입력 후 Enter | `searchByKeyword` 호출 |
| AB-03 | 재고 필터 | "재고 있음" 선택 | available=true 항목만 노출 |
| AB-04 | 정렬 | 가격순 선택 | 가격 오름차순 정렬 |

#### `admin/MemberList.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| AM-01 | 회원 목록 렌더링 | API 응답 3명 | 이름·이메일·멤버십·가입일 노출 |
| AM-02 | 검색 (Enter) | 이름 입력 후 Enter | `search` 호출 |
| AM-03 | 멤버십 필터 | PREMIUM 선택 | PREMIUM 회원만 노출 |

#### `admin/BookDetail.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| ABD-01 | 도서 정보 렌더링 | `getBook` 응답 | 제목·저자·ISBN·가격·재고 노출 |
| ABD-02 | 편집 모드 진입 | 편집 버튼 클릭 | 입력 필드 활성화 |
| ABD-03 | 수정 저장 | 정보 수정 후 저장 | `bookService.update` 호출 |
| ABD-04 | 수정 취소 | 편집 중 취소 | 원래 값으로 복원 |
| ABD-05 | 도서 삭제 | 삭제 버튼 → confirm | `bookService.delete` 호출 → 목록 이동 |

#### `admin/MemberDetail.test.tsx`

| TC-ID | 테스트 케이스 | 시나리오 | 기대 결과 |
|-------|-------------|----------|-----------|
| AMD-01 | 회원 정보 렌더링 | `getMember` 응답 | 이름·이메일·멤버십·가입일 노출 |
| AMD-02 | 편집 모드 진입 | 편집 버튼 클릭 | 입력 필드 활성화 |
| AMD-03 | 수정 저장 | 정보 수정 후 저장 | `memberService.updateMember` 호출 |
| AMD-04 | 멤버십 변경 | PREMIUM 선택 후 저장 | 멤버십 PREMIUM으로 갱신 |

---

## 5. E2E 테스트 — Playwright

> **전제**: `npm run test:e2e` 실행 시 dev 서버(포트 4173)가 자동으로 기동된다. 백엔드 서버(`http://localhost:8080`)가 실행 중이어야 한다.

### 5-1. `auth.spec.ts` — 인증

| TC-ID | 시나리오 | 단계 | 기대 결과 |
|-------|----------|------|-----------|
| E-AU-01 | 로그인 성공 | 이메일·비밀번호 입력 → 로그인 버튼 클릭 | 홈(`/client`) 이동, 내비게이션에 사용자명 노출 |
| E-AU-02 | 로그인 실패 | 잘못된 비밀번호 입력 | 에러 메시지 노출, 페이지 유지 |
| E-AU-03 | 로그아웃 | 로그인 후 로그아웃 클릭 | 로그인 페이지 이동, 보호 경로 접근 차단 |
| E-AU-04 | 회원가입 | 신규 정보 입력 → 가입 | 로그인 페이지 리다이렉트, 성공 메시지 |
| E-AU-05 | 보호 경로 미인증 접근 | 로그인 없이 `/client/my-loans` 접속 | 로그인 페이지로 리다이렉트 |

### 5-2. `books.spec.ts` — 도서

| TC-ID | 시나리오 | 단계 | 기대 결과 |
|-------|----------|------|-----------|
| E-BK-01 | 도서 목록 탐색 | `/client/books` 접속 | 도서 카드 목록 노출 |
| E-BK-02 | 도서 검색 | 검색창에 키워드 입력 후 Enter | 검색 결과로 목록 갱신 |
| E-BK-03 | 도서 상세 이동 | 도서 카드 클릭 | 상세 페이지 이동, 정보 노출 |
| E-BK-04 | 장바구니 추가 | 상세에서 "장바구니 담기" | confirm 다이얼로그, 장바구니 아이콘 카운트 증가 |
| E-BK-05 | 페이지네이션 | 다음 페이지 클릭 | 다음 페이지 도서 목록 노출 |

### 5-3. `loans.spec.ts` — 대출

| TC-ID | 시나리오 | 단계 | 기대 결과 |
|-------|----------|------|-----------|
| E-LN-01 | 도서 대출 신청 | 로그인 → 상세 → "대출하기" 클릭 | 대출 기간 선택 → 신청 → 성공 confirm |
| E-LN-02 | 내 대출 목록 확인 | `/client/my-loans` 접속 | 대출 내역 노출 |
| E-LN-03 | 반납 처리 | 대출 항목 → 반납하기 → confirm | 상태가 RETURNED로 변경 |
| E-LN-04 | 대출 취소 | ACTIVE 항목 → 취소 → confirm | 목록에서 CANCELLED로 변경 |

### 5-4. `orders.spec.ts` — 주문

| TC-ID | 시나리오 | 단계 | 기대 결과 |
|-------|----------|------|-----------|
| E-OR-01 | 주문 내역 조회 | `/client/my-orders` 접속 | 주문 목록 노출 |
| E-OR-02 | 주문 상태 필터 | "접수" 필터 선택 | PENDING 주문만 노출 |
| E-OR-03 | 주문 취소 | PENDING 주문 취소 버튼 → confirm | 상태가 CANCELLED로 변경 |

### 5-5. `admin.spec.ts` — 관리자

| TC-ID | 시나리오 | 단계 | 기대 결과 |
|-------|----------|------|-----------|
| E-AD-01 | 주문 확정 처리 | 관리자 로그인 → 주문 상세 → 주문 확정 | 상태 CONFIRMED 변경 |
| E-AD-02 | 배송 처리 흐름 | 확정 → 배송 시작 → 배송 완료 | 상태 순서대로 변경 |
| E-AD-03 | 대출 반납 처리 | 대출 목록 → 상세 → Mark as Returned | 상태 RETURNED 변경 |
| E-AD-04 | 도서 정보 수정 | 도서 상세 → 편집 → 가격 변경 → 저장 | 변경된 가격 반영 |
| E-AD-05 | 회원 검색 | 회원 목록 → 이름 검색 | 해당 회원만 노출 |

---

## 6. 테스트 우선순위

| 우선순위 | 대상 | 이유 |
|---------|------|------|
| P1 (필수) | 서비스 레이어 단위 테스트 (AC~MB) | API 연동의 핵심, 빠른 실행 |
| P1 (필수) | Login·Register 컴포넌트 테스트 | 인증 흐름은 모든 기능의 전제 |
| P2 (중요) | MyLoans·MyOrders·BookList 컴포넌트 테스트 | 주요 사용자 기능 |
| P2 (중요) | admin/OrderDetail 컴포넌트 테스트 | 상태 전이 로직 복잡 |
| P3 (권장) | 나머지 관리자 페이지 컴포넌트 테스트 | |
| P3 (권장) | E2E 인증·도서 시나리오 | 통합 검증 |
| P4 (선택) | E2E 대출·주문·관리자 시나리오 | 백엔드 서버 필요 |

---

## 7. 테스트 데이터 (Fixture)

### 7-1. 회원 정책

> **원칙: 모든 테스트 회원은 테스트 실행 시 새로 가입(회원가입 API)한다.**
> 사전에 DB에 등록된 회원 데이터에 의존하지 않는다.

- 단위/통합 테스트: `vi.mock`으로 `authService.signup`을 목킹, 회원가입 응답을 시뮬레이션한다.
- E2E 테스트: 각 테스트 실행 전 `beforeEach`에서 회원가입 API를 실제 호출하여 계정을 생성하고, `afterEach`에서 삭제(또는 고유 이메일 타임스탬프 사용)한다.

```typescript
// playwright/fixtures/auth.ts — E2E 용 회원 생성 헬퍼
import { APIRequestContext } from '@playwright/test';

export async function createTestUser(request: APIRequestContext) {
  const timestamp = Date.now();
  const user = {
    name: `테스트유저_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'test1234',
  };
  await request.post('http://localhost:8080/api/auth/signup', { data: user });
  return user;
}
```

### 7-2. Mock Fixtures (단위/통합 테스트용)

```typescript
// src/__fixtures__/books.ts
export const mockBook = {
  id: 1, title: "리액트 딥다이브", author: "홍길동",
  isbn: "978-1234567890", price: 28000,
  available: true, createdDate: "2025-01-01T00:00:00"
};

// src/__fixtures__/loans.ts
export const mockLoan = {
  id: 1, bookId: 1, bookTitle: "리액트 딥다이브", bookAuthor: "홍길동",
  memberId: 1, memberName: "테스트유저", memberEmail: "test@example.com",
  loanDate: "2026-01-01T00:00:00", dueDate: "2026-01-15T00:00:00",
  status: "ACTIVE" as const
};

// src/__fixtures__/orders.ts
export const mockOrder = {
  id: 1001, totalAmount: 28000, orderDate: "2026-01-10T10:00:00",
  status: "PENDING" as const, customerEmail: "test@example.com",
  items: [{ id: 1, bookId: 1, bookTitle: "리액트 딥다이브",
    bookAuthor: "홍길동", quantity: 1, price: 28000 }]
};

// src/__fixtures__/members.ts — 신규 가입 회원 기준
export const mockNewMember = {
  id: 1, name: "테스트유저", email: "test@example.com",
  membershipType: "REGULAR" as const,
  joinDate: new Date().toISOString()  // 가입 시점 기준
};

export const mockSignupRequest = {
  name: "테스트유저",
  email: "test@example.com",
  password: "test1234"
};

// src/__fixtures__/pageResponse.ts
export const mockPageResponse = <T>(content: T[]) => ({
  content, totalElements: content.length,
  totalPages: 1, size: 10, number: 0
});
```

---

## 8. 작업 계획

| 브랜치 | 작업 내용 | 예상 파일 수 |
|--------|----------|-------------|
| `feature/tests-service` | 서비스 레이어 단위 테스트 (P1) | 6개 |
| `feature/tests-client` | 클라이언트 페이지 컴포넌트 테스트 (P1~P2) | 6개 |
| `feature/tests-admin` | 관리자 페이지 컴포넌트 테스트 (P2~P3) | 6개 |
| `feature/tests-e2e` | Playwright E2E 테스트 (P3~P4) | 5개 |

---

## 9. 제외 범위

- `Dashboard.tsx` — 차트 라이브러리(Chart.js) mock이 복잡하여 별도 스프린트에서 처리
- `Settings.tsx` — 템플릿 페이지로 기능 없음
- `Home.tsx`, `About.tsx`, `Contact.tsx`, `Privacy.tsx` — 기존 테스트(`publicPages.test.tsx`)로 커버
- Delivery·Payment·Refund API — 구현 미완료 기능
