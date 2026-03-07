# API 연동 분석 보고서

## 개요

Spring Boot 기반 도서 관리 시스템 REST API와 현재 React 프로젝트의 연동 가능성 분석

- **API 서버**: `http://localhost:8080`
- **API 문서**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

## 1. 인증 체계

API 서버는 JWT 기반 인증을 사용합니다.

### 공개 엔드포인트 (인증 불필요)
- `POST /api/auth/signup`
- `POST /api/auth/login`

### 보호된 엔드포인트
모든 나머지 엔드포인트는 JWT 토큰이 필요합니다.

```http
Authorization: Bearer <access-token>
```

### 현재 상태
- ⚠️ 현재 프로젝트는 `authStorage.ts`에서 로컬 인증 상태만 관리
- `memberId=1` 하드코딩 → 실제 JWT 토큰 발급으로 교체 필요
- Axios interceptor로 모든 요청에 자동 토큰 첨부 구현 필요

---

## 2. API 주요 기능

### 2.1 Auth API (`/api/auth`)

| 엔드포인트 | 메서드 | 설명 | 현재 상태 |
|-----------|--------|------|----------|
| `/api/auth/signup` | POST | 회원가입 | ⚠️ 미연동 (로컬 상태만) |
| `/api/auth/login` | POST | 로그인 | ⚠️ 미연동 (로컬 상태만) |

### 2.2 도서 관리 (`/api/books`) — 17개

| 엔드포인트 | 메서드 | 설명 | 현재 상태 |
|-----------|--------|------|----------|
| `/api/books` | GET | 도서 목록 조회 (페이징) | ⚠️ books.json 사용 중 |
| `/api/books/{id}` | GET | 도서 상세 조회 | ⚠️ books.json 사용 중 |
| `/api/books` | POST | 도서 등록 | ⚠️ 미연동 |
| `/api/books/{id}` | PUT | 도서 수정 | ⚠️ 미연동 |
| `/api/books/{id}` | DELETE | 도서 삭제 (Soft Delete) | ⚠️ 미연동 |
| `/api/books/{id}/restore` | PATCH | 도서 복원 | ⚠️ 미연동 |
| `/api/books/isbn/{isbn}` | GET | ISBN으로 조회 | ⚠️ 미연동 |
| `/api/books/search/title` | GET | 제목으로 검색 | ⚠️ 미연동 |
| `/api/books/search/author` | GET | 저자로 검색 | ⚠️ 미연동 |
| `/api/books/search/keyword` | GET | 키워드 검색 (제목+저자) | ⚠️ 미연동 |
| `/api/books/search/price` | GET | 가격 범위 검색 | ⚠️ 미연동 |
| `/api/books/search` | GET | 복합 조건 검색 (페이징) | ⚠️ 미연동 |
| `/api/books/search/query` | GET | 통합 검색 | ⚠️ 미연동 |
| `/api/books/availability/{available}` | GET | 재고 상태별 조회 | ⚠️ 미연동 |
| `/api/books/{id}/availability` | PATCH | 재고 상태 변경 | ⚠️ 미연동 |
| `/api/books/validate/isbn` | GET | ISBN 중복 확인 | ⚠️ 미연동 |
| `/api/books/statistics` | GET | 도서 통계 | ⚠️ 미연동 |

### 2.3 회원 관리 (`/api/members`) — 10개

| 엔드포인트 | 메서드 | 설명 | 현재 상태 |
|-----------|--------|------|----------|
| `/api/members` | GET | 회원 목록 조회 (페이징) | ⚠️ members.json 사용 중 |
| `/api/members/{id}` | GET | 회원 상세 조회 | ⚠️ 미연동 |
| `/api/members` | POST | 회원 등록 | ⚠️ 미연동 |
| `/api/members/{id}` | PUT | 회원 정보 수정 | ⚠️ 미연동 |
| `/api/members/{id}` | DELETE | 회원 삭제 | ⚠️ 미연동 |
| `/api/members/search` | GET | 이름으로 검색 | ⚠️ 미연동 |
| `/api/members/membership/{type}` | GET | 등급별 회원 조회 | ⚠️ 미연동 |
| `/api/members/{id}/membership` | PUT | 회원 등급 변경 | ⚠️ 미연동 |
| `/api/members/email/validate` | GET | 이메일 중복 확인 | ⚠️ 미연동 |
| `/api/members/{id}/loan-limit` | GET | 대출 한도 조회 | ⚠️ 미연동 |

### 2.4 주문 관리 (`/api/orders`) — 13개

| 엔드포인트 | 메서드 | 설명 | 현재 상태 |
|-----------|--------|------|----------|
| `/api/orders` | POST | 주문 생성 | ⚠️ 미연동 |
| `/api/orders` | GET | 주문 목록 조회 (페이징) | ⚠️ orders.json 사용 중 |
| `/api/orders/{id}` | GET | 주문 단건 조회 | ⚠️ 미연동 |
| `/api/orders/{id}/confirm` | PATCH | 주문 확인 | ⚠️ 미연동 |
| `/api/orders/{id}/ship` | PATCH | 배송 시작 | ⚠️ 미연동 |
| `/api/orders/{id}/deliver` | PATCH | 배송 완료 | ⚠️ 미연동 |
| `/api/orders/{id}/cancel` | PATCH | 주문 취소 | ⚠️ 미연동 |
| `/api/orders/status/{status}` | GET | 상태별 주문 조회 | ⚠️ 미연동 |
| `/api/orders/date-range` | GET | 기간별 주문 조회 | ⚠️ 미연동 |
| `/api/orders/amount-range` | GET | 금액 범위별 주문 조회 | ⚠️ 미연동 |
| `/api/orders/book/{bookId}` | GET | 도서별 주문 조회 | ⚠️ 미연동 |
| `/api/orders/statistics` | GET | 주문 통계 | ⚠️ 미연동 |
| `/api/orders/revenue` | GET | 매출 조회 | ⚠️ 미연동 |

### 2.5 대출 관리 — 19개

#### 관리자 (`/api/admin/loans`) — 15개

| 엔드포인트 | 메서드 | 설명 | 현재 상태 |
|-----------|--------|------|----------|
| `/api/admin/loans` | GET | 대출 목록 조회 | ⚠️ loans.json 사용 중 |
| `/api/admin/loans/{id}` | GET | 대출 단건 조회 | ⚠️ 미연동 |
| `/api/admin/loans` | POST | 대출 등록 | ⚠️ 미연동 |
| `/api/admin/loans/{id}` | PATCH | 대출 정보 수정 | ⚠️ 미연동 |
| `/api/admin/loans/{id}` | DELETE | 대출 삭제 | ⚠️ 미연동 |
| `/api/admin/loans/overdue` | GET | 연체 대출 목록 | ⚠️ 미연동 |
| `/api/admin/loans/active` | GET | 활성 대출 목록 | ⚠️ 미연동 |
| `/api/admin/loans/member/{memberId}` | GET | 회원별 대출 목록 | ⚠️ 미연동 |
| `/api/admin/loans/book/{bookId}` | GET | 도서별 대출 목록 | ⚠️ 미연동 |
| `/api/admin/loans/search/by-member-name` | GET | 회원 이름으로 검색 | ⚠️ 미연동 |
| `/api/admin/loans/search/by-book-title` | GET | 도서 제목으로 검색 | ⚠️ 미연동 |
| `/api/admin/loans/with-details` | GET | 상세 정보 포함 목록 | ⚠️ 미연동 |
| `/api/admin/loans/search/members-by-book-title` | GET | 도서 제목으로 회원 검색 | ⚠️ 미연동 |
| `/api/admin/loans/member/{memberId}/borrowed-books` | GET | 회원의 대출 도서 목록 | ⚠️ 미연동 |
| `/api/admin/loans/overdue/with-member-info` | GET | 연체 대출 + 회원 정보 | ⚠️ 미연동 |

#### 사용자 (`/api/client/loans`) — 4개

| 엔드포인트 | 메서드 | 설명 | 현재 상태 |
|-----------|--------|------|----------|
| `/api/client/loans` | GET | 내 대출 목록 | ⚠️ 미연동 |
| `/api/client/loans/{id}/return` | POST | 반납 처리 | ⚠️ 미연동 |
| `/api/client/loans/{id}` | DELETE | 대출 신청 취소 | ⚠️ 미연동 |
| `/api/client/loans/request` | POST | 대출 신청 | ⚠️ 미연동 |

### 2.6 배송 관리 (`/api/deliveries`) — 8개

| 엔드포인트 | 메서드 | 설명 | 현재 상태 |
|-----------|--------|------|----------|
| `/api/deliveries/{id}` | GET | 배송 단건 조회 | ⚠️ 미구현 |
| `/api/deliveries/order/{orderId}` | GET | 주문별 배송 조회 | ⚠️ 미구현 |
| `/api/deliveries/tracking/{trackingNumber}` | GET | 운송장 번호로 조회 | ⚠️ 미구현 |
| `/api/deliveries/status/{status}` | GET | 상태별 배송 조회 | ⚠️ 미구현 |
| `/api/deliveries/{id}/start` | PATCH | 배송 시작 | ⚠️ 미구현 |
| `/api/deliveries/{id}/complete` | PATCH | 배송 완료 | ⚠️ 미구현 |
| `/api/deliveries/{id}/status` | PATCH | 배송 상태 변경 | ⚠️ 미구현 |
| `/api/deliveries/{id}/address` | PATCH | 배송지 변경 | ⚠️ 미구현 |

### 2.7 결제 관리 (`/api/payments`) — 7개

| 엔드포인트 | 메서드 | 설명 | 현재 상태 |
|-----------|--------|------|----------|
| `/api/payments/{id}` | GET | 결제 단건 조회 | ⚠️ 미구현 |
| `/api/payments/order/{orderId}` | GET | 주문별 결제 조회 | ⚠️ 미구현 |
| `/api/payments/status/{status}` | GET | 상태별 결제 조회 | ⚠️ 미구현 |
| `/api/payments/{id}/complete` | PATCH | 결제 완료 | ⚠️ 미구현 |
| `/api/payments/{id}/fail` | PATCH | 결제 실패 | ⚠️ 미구현 |
| `/api/payments/{id}/cancel` | PATCH | 결제 취소 | ⚠️ 미구현 |
| `/api/payments/{id}/refund` | PATCH | 환불 처리 | ⚠️ 미구현 |

### 2.8 환불 관리 (`/api/refunds`) — 11개

| 엔드포인트 | 메서드 | 설명 | 현재 상태 |
|-----------|--------|------|----------|
| `/api/refunds` | POST | 환불 신청 | ⚠️ 미구현 |
| `/api/refunds/{id}` | GET | 환불 단건 조회 | ⚠️ 미구현 |
| `/api/refunds/order/{orderId}` | GET | 주문별 환불 조회 | ⚠️ 미구현 |
| `/api/refunds/status/{status}` | GET | 상태별 환불 조회 | ⚠️ 미구현 |
| `/api/refunds/pending` | GET | 처리 대기 환불 목록 | ⚠️ 미구현 |
| `/api/refunds/{id}/approve` | PATCH | 환불 승인 | ⚠️ 미구현 |
| `/api/refunds/{id}/reject` | PATCH | 환불 거절 | ⚠️ 미구현 |
| `/api/refunds/{id}/start-processing` | PATCH | 환불 처리 시작 | ⚠️ 미구현 |
| `/api/refunds/{id}/complete` | PATCH | 환불 완료 | ⚠️ 미구현 |
| `/api/refunds/{id}/fail` | PATCH | 환불 실패 | ⚠️ 미구현 |
| `/api/refunds/order/{orderId}/total-amount` | GET | 주문별 총 환불 금액 | ⚠️ 미구현 |

---

## 3. 타입 호환성 분석

### Book 타입
**현재 타입** (`src/shared/types/index.ts`):
```typescript
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  price: number;
  available: boolean;
  createdDate: string;
  coverImage?: string;  // API에는 없는 필드
}
```

**API 응답:**
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "price": 45000,
  "available": true,
  "createdDate": "2026-02-19T10:00:00",
  "updatedDate": "2026-02-19T10:00:00"
}
```

✅ **호환성**: 95% — `coverImage`는 프론트 전용 필드로 유지 가능

---

### Member 타입
**현재 타입:**
```typescript
export interface Member {
  id: number;
  name: string;
  email: string;
  membershipType: 'REGULAR' | 'PREMIUM';  // 변경 필요
  status: MemberStatus;
  joinDate: string;
}
```

**API 응답:**
```json
{
  "id": 1,
  "name": "홍길동",
  "email": "hong@example.com",
  "membershipType": "BASIC",
  "status": "ACTIVE",
  "joinDate": "2026-02-19T10:00:00"
}
```

⚠️ **호환성**: 80%
- `membershipType` 값 변경 필요: `REGULAR/PREMIUM` → `BASIC/SILVER/GOLD/VIP`
- `status` 필드는 API에서도 제공 (`ACTIVE | SUSPENDED | DORMANT | WITHDRAWN`)

---

### Loan 타입
**현재 타입:**
```typescript
export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
}
```

**API 응답:**
```json
{
  "id": 1,
  "memberId": 1,
  "memberName": "홍길동",
  "bookId": 1,
  "bookTitle": "Clean Code",
  "loanDate": "2026-02-19T10:00:00",
  "dueDate": "2026-03-19T10:00:00",
  "returnDate": null,
  "status": "ACTIVE"
}
```

✅ **호환성**: 95% — 구조 일치, 추가 필드는 optional로 처리 가능

---

### Order 타입
**현재 타입:**
```typescript
export interface Order {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  orderDate: string;
  items: OrderItem[];
}
```

✅ **호환성**: 95% — 상태 흐름 일치

---

## 4. 연동 구현 계획

### Phase 1: 기반 구조 구축 (브랜치: `feature/api-client-setup`)
```
src/
  services/
    apiClient.ts          # Axios 인스턴스 + JWT interceptor
    authService.ts        # 로그인/회원가입 API
    bookService.ts        # Books API
    memberService.ts      # Members API
    orderService.ts       # Orders API
    loanService.ts        # Loans API (admin + client)
    deliveryService.ts    # Deliveries API
    paymentService.ts     # Payments API
    refundService.ts      # Refunds API
```

### Phase 2: 인증 연동 (브랜치: `feature/auth-api`)
- `Login.tsx`, `Register.tsx` → Auth API 연동
- `authStorage.ts` → JWT 토큰 저장/관리
- Axios interceptor → 모든 요청에 토큰 자동 첨부
- 토큰 만료 시 자동 로그아웃

### Phase 3: 도서 연동 — 클라이언트 (브랜치: `feature/book-api`)
- `BookList.tsx` → `GET /api/books` (페이징, 검색)
- `BookDetail.tsx` → `GET /api/books/{id}`
- 대출 신청 → `POST /api/client/loans/request`

### Phase 4: 대출/반납 연동 (브랜치: `feature/loan-api`)
- `MyLoans.tsx` → `GET /api/client/loans`
- 반납 → `POST /api/client/loans/{id}/return`
- 대출 취소 → `DELETE /api/client/loans/{id}`

### Phase 5: 주문 연동 (브랜치: `feature/order-api`)
- `Cart.tsx` → `POST /api/orders` (주문 생성)
- `MyOrders.tsx` → `GET /api/orders` (주문 목록)
- 주문 취소 → `PATCH /api/orders/{id}/cancel`

### Phase 6: 관리자 연동 (브랜치: `feature/admin-api`)
- 도서 CRUD → Books Admin API
- 회원 관리 → Members Admin API
- 대출 관리 → `GET/POST/PATCH /api/admin/loans`
- 주문 상태 변경 → confirm/ship/deliver/cancel
- 통계 대시보드 → statistics, revenue API

---

## 5. 즉시 연동 가능한 API (우선순위)

### 높음 (기존 mock 데이터 대체)

1. **도서 목록** — `GET /api/books` → `BookList.tsx`
2. **도서 검색** — `GET /api/books/search/keyword` → `BookList.tsx`
3. **도서 상세** — `GET /api/books/{id}` → `BookDetail.tsx`
4. **대출 신청** — `POST /api/client/loans/request` → `BookDetail.tsx`
5. **내 대출 목록** — `GET /api/client/loans` → `MyLoans.tsx`
6. **반납** — `POST /api/client/loans/{id}/return` → `MyLoans.tsx`
7. **주문 목록** — `GET /api/orders` → `MyOrders.tsx`
8. **관리자 대출 목록** — `GET /api/admin/loans` → Admin Loans

### 중간 (신규 기능)

9. **연체 대출 조회** — `GET /api/admin/loans/overdue`
10. **주문 상태 변경** — `PATCH /api/orders/{id}/confirm|ship|deliver|cancel`
11. **도서 통계** — `GET /api/books/statistics` → Dashboard
12. **주문 통계** — `GET /api/orders/statistics` → Dashboard

### 낮음 (고급 기능)

13. **배송 추적** — `GET /api/deliveries/order/{orderId}`
14. **결제 관리** — Payment API
15. **환불 처리** — Refund API

---

## 6. API 클라이언트 구현 예시

### 6.1 Axios 인스턴스 + JWT 인터셉터

```typescript
// src/services/apiClient.ts
import axios from 'axios';
import { getToken, clearAuth } from '../client/utils/authStorage';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = '/client/login';
    }
    return Promise.reject(error);
  }
);
```

### 6.2 Books 서비스

```typescript
// src/services/bookService.ts
import { apiClient } from './apiClient';
import type { Book, PageResponse } from '../shared/types';

export const bookService = {
  getBooks: (page = 0, size = 12) =>
    apiClient.get<PageResponse<Book>>('/api/books', { params: { page, size } })
      .then(r => r.data),

  getBook: (id: number) =>
    apiClient.get<Book>(`/api/books/${id}`).then(r => r.data),

  searchByKeyword: (keyword: string, page = 0, size = 12) =>
    apiClient.get<PageResponse<Book>>('/api/books/search/keyword', {
      params: { keyword, page, size }
    }).then(r => r.data),

  searchComplex: (params: {
    title?: string; author?: string;
    minPrice?: number; maxPrice?: number;
    available?: boolean; page?: number; size?: number;
  }) =>
    apiClient.get<PageResponse<Book>>('/api/books/search', { params })
      .then(r => r.data),
};
```

### 6.3 Loan 서비스

```typescript
// src/services/loanService.ts
import { apiClient } from './apiClient';
import type { Loan } from '../shared/types';

export const loanService = {
  // 클라이언트
  getMyLoans: () =>
    apiClient.get<Loan[]>('/api/client/loans').then(r => r.data),

  requestLoan: (bookId: number) =>
    apiClient.post<Loan>('/api/client/loans/request', { bookId })
      .then(r => r.data),

  returnLoan: (loanId: number) =>
    apiClient.post<Loan>(`/api/client/loans/${loanId}/return`)
      .then(r => r.data),

  cancelLoan: (loanId: number) =>
    apiClient.delete(`/api/client/loans/${loanId}`),

  // 관리자
  getAllLoans: () =>
    apiClient.get<Loan[]>('/api/admin/loans').then(r => r.data),

  getOverdueLoans: () =>
    apiClient.get<Loan[]>('/api/admin/loans/overdue').then(r => r.data),

  getLoansByMember: (memberId: number) =>
    apiClient.get<Loan[]>(`/api/admin/loans/member/${memberId}`).then(r => r.data),
};
```

### 6.4 Order 서비스

```typescript
// src/services/orderService.ts
import { apiClient } from './apiClient';
import type { Order, PageResponse } from '../shared/types';

export const orderService = {
  createOrder: (data: { memberId: number; items: { bookId: number; quantity: number }[] }) =>
    apiClient.post<Order>('/api/orders', data).then(r => r.data),

  getOrders: (page = 0, size = 10) =>
    apiClient.get<PageResponse<Order>>('/api/orders', { params: { page, size } })
      .then(r => r.data),

  getOrder: (id: number) =>
    apiClient.get<Order>(`/api/orders/${id}`).then(r => r.data),

  confirmOrder: (id: number) =>
    apiClient.patch<Order>(`/api/orders/${id}/confirm`).then(r => r.data),

  shipOrder: (id: number) =>
    apiClient.patch<Order>(`/api/orders/${id}/ship`).then(r => r.data),

  deliverOrder: (id: number) =>
    apiClient.patch<Order>(`/api/orders/${id}/deliver`).then(r => r.data),

  cancelOrder: (id: number) =>
    apiClient.patch<Order>(`/api/orders/${id}/cancel`).then(r => r.data),

  getStatistics: () =>
    apiClient.get('/api/orders/statistics').then(r => r.data),
};
```

---

## 7. 주요 고려사항

### 7.1 타입 수정 필요 사항

`src/shared/types/index.ts`에서 수정이 필요한 항목:

```typescript
// 변경 전
membershipType: 'REGULAR' | 'PREMIUM'

// 변경 후 (API 명세 기준)
membershipType: 'BASIC' | 'SILVER' | 'GOLD' | 'VIP'
```

### 7.2 에러 처리 표준화

```typescript
// API 공통 에러 응답 타입
interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  errorCode: string;
  message: string;
  path: string;
  fieldErrors?: { field: string; rejectedValue: string; message: string }[];
}

// 에러 처리 예시
try {
  await loanService.requestLoan(bookId);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    if (error.response?.status === 409) {
      alert('이미 대출 중인 도서입니다.');
    } else {
      alert(apiError?.message ?? '오류가 발생했습니다.');
    }
  }
}
```

### 7.3 환경 변수 설정

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080

# .env.production
VITE_API_BASE_URL=https://api.production.com
```

---

## 8. 결론

### 연동 가능성: 95%

| 영역 | 현재 | 목표 | 우선순위 |
|------|------|------|----------|
| 인증 | 로컬 상태 | JWT 연동 | 높음 |
| 도서 | JSON 파일 | Books API | 높음 |
| 대출 | localStorage | Client/Admin Loans API | 높음 |
| 주문 | JSON 파일 | Orders API | 중간 |
| 배송/결제/환불 | 미구현 | Delivery/Payment/Refund API | 낮음 |

### 타입 수정 필요
- `membershipType`: `REGULAR/PREMIUM` → `BASIC/SILVER/GOLD/VIP`

### 권장 구현 순서 (브랜치별)
1. `feature/api-client-setup` — Axios 인스턴스 + 서비스 레이어
2. `feature/auth-api` — 인증 API 연동
3. `feature/book-api` — 도서 API 연동
4. `feature/loan-api` — 대출 API 연동
5. `feature/order-api` — 주문 API 연동
6. `feature/admin-api` — 관리자 API 연동

---

**작성일**: 2026-02-19
**작성자**: Claude Code
**버전**: 2.0 (최종 점검 반영)
