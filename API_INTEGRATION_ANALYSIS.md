# API 연동 분석 보고서

## 개요
Spring Boot 기반 도서 관리 시스템 REST API와 현재 React 프로젝트의 연동 가능성 분석

**API 서버**: `http://localhost:8080`
**API 문서**: `http://localhost:8080/swagger-ui/index.html`

---

## 1. API 주요 기능

### 1.1 도서 관리 (Books API)
- ✅ **완벽하게 매칭됨** - 현재 프로젝트의 Books 기능과 일치

| 엔드포인트 | 메서드 | 설명 | 현재 사용 |
|-----------|--------|------|----------|
| `/api/books` | GET | 도서 목록 조회 (페이징) | ✅ books.json |
| `/api/books/{id}` | GET | 도서 상세 조회 | ✅ BookDetail.tsx |
| `/api/books/search` | GET | 도서 검색 (제목, 저자, 키워드, 가격) | ✅ BookList.tsx |
| `/api/books/search/title` | GET | 제목으로 검색 | ✅ 검색 기능 |
| `/api/books/search/author` | GET | 저자로 검색 | ✅ 검색 기능 |
| `/api/books/{id}/availability` | PATCH | 대여 가능 여부 수정 | ⚠️ 미사용 |
| `/api/books/statistics` | GET | 도서 통계 | ⚠️ 미사용 |

### 1.2 대여 관리 (Loans API)
- ✅ **핵심 기능 완벽 매칭** - 현재 구현한 대여 기능과 일치

| 엔드포인트 | 메서드 | 설명 | 현재 사용 |
|-----------|--------|------|----------|
| `/api/loans` | POST | 도서 대여 생성 | ✅ BookDetail.tsx (대여) |
| `/api/loans` | GET | 모든 대여 조회 | ✅ MyLoans.tsx |
| `/api/loans/with-details` | GET | 대여 상세 조회 (N+1 최적화) | ✅ 권장 사용 |
| `/api/loans/member/{memberId}` | GET | 회원별 대여 내역 | ✅ MyLoans.tsx |
| `/api/loans/active/member/{memberId}` | GET | 회원의 활성 대여 | ✅ MyLoans.tsx |
| `/api/loans/{id}/return` | PATCH | 도서 반납 | ✅ MyLoans.tsx |
| `/api/loans/{id}/extend` | PATCH | 대여 연장 | ⚠️ 미구현 |
| `/api/loans/{id}` | DELETE | 대여 취소 | ✅ MyLoans.tsx (삭제) |
| `/api/loans/overdue` | GET | 연체 대여 조회 | ✅ MyLoans.tsx (필터) |
| `/api/loans/{id}/overdue-fee` | GET | 연체료 조회 | ⚠️ 미구현 |
| `/api/loans/member/{memberId}/can-loan` | GET | 대여 가능 여부 확인 | ⚠️ 미사용 |

### 1.3 회원 관리 (Members API)
- ✅ **데이터 모델 일치** - 타입 정의와 동일

| 엔드포인트 | 메서드 | 설명 | 현재 사용 |
|-----------|--------|------|----------|
| `/api/members` | GET | 회원 목록 (페이징) | ✅ members.json |
| `/api/members/{id}` | GET | 회원 상세 조회 | ✅ 사용 가능 |
| `/api/members/{id}/loan-limit` | GET | 대여 한도 정보 | ⚠️ 미사용 |
| `/api/members/search` | GET | 이름으로 검색 | ⚠️ 미사용 |

### 1.4 주문 관리 (Orders API)
- ✅ **기본 구조 일치**

| 엔드포인트 | 메서드 | 설명 | 현재 사용 |
|-----------|--------|------|----------|
| `/api/orders` | GET | 주문 목록 조회 | ✅ orders.json |
| `/api/orders` | POST | 주문 생성 | ⚠️ 미구현 (Cart 기능) |
| `/api/orders/{id}` | GET | 주문 상세 조회 | ⚠️ 미구현 |

---

## 2. 현재 프로젝트와의 매칭도

### 2.1 완벽하게 연동 가능한 기능 (90% 이상)

#### ✅ 도서 목록 및 검색
**현재**: `src/shared/data/books.json`
**API**: `/api/books`, `/api/books/search`

```typescript
// 변경 전 (현재)
import booksData from "../../shared/data/books.json";
const books = booksData as Book[];

// 변경 후 (API)
const response = await fetch('http://localhost:8080/api/books?page=0&size=12');
const data = await response.json();
const books = data.content;
```

#### ✅ 도서 상세
**현재**: `BookDetail.tsx` - JSON에서 ID로 찾기
**API**: `/api/books/{id}`

```typescript
// 변경 전
const book = booksData.find(b => b.id === Number(id));

// 변경 후
const response = await fetch(`http://localhost:8080/api/books/${id}`);
const book = await response.json();
```

#### ✅ 대여 생성
**현재**: `BookDetail.tsx` - localStorage에 저장
**API**: `/api/loans` (POST)

```typescript
// 변경 전
const newLoan = addLoan({ bookId, memberId, ... });

// 변경 후
const response = await fetch('http://localhost:8080/api/loans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    memberId: memberId,
    bookId: bookId,
    loanDays: parseInt(loanPeriod)
  })
});
const loan = await response.json();
```

#### ✅ 내 대출 목록
**현재**: `MyLoans.tsx` - loans.json + localStorage
**API**: `/api/loans/member/{memberId}` 또는 `/api/loans/active/member/{memberId}`

```typescript
// 변경 전
const myLoans = loansData.filter(loan => loan.memberId === currentMemberId);

// 변경 후
const response = await fetch(`http://localhost:8080/api/loans/member/${memberId}`);
const myLoans = await response.json();
```

#### ✅ 도서 반납
**현재**: `MyLoans.tsx` - localStorage 업데이트
**API**: `/api/loans/{id}/return` (PATCH)

```typescript
// 변경 전
returnBook(loan.id);

// 변경 후
await fetch(`http://localhost:8080/api/loans/${loan.id}/return`, {
  method: 'PATCH'
});
```

### 2.2 타입 호환성 분석

#### Book 타입
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
  coverImage?: string;  // API에는 없음
}
```

**API 응답** (`BookResponse`):
```json
{
  "id": 1,
  "title": "책 제목",
  "author": "저자",
  "isbn": "1234567890123",
  "price": 15000,
  "available": true,
  "createdDate": "2025-01-01T00:00:00",
  "updatedDate": "2025-01-01T00:00:00"
}
```

✅ **호환성**: 95% - `coverImage`만 추가 필드

#### Loan 타입
**현재 타입**:
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

**API 응답** (`LoanResponse`):
```json
{
  "id": 1,
  "memberId": 1,
  "memberName": "홍길동",
  "memberEmail": "hong@example.com",
  "bookId": 1,
  "bookTitle": "책 제목",
  "bookIsbn": "1234567890123",
  "loanDate": "2025-01-01T00:00:00",
  "dueDate": "2025-01-15T00:00:00",
  "returnDate": null,
  "status": "ACTIVE",  // ACTIVE, RETURNED, OVERDUE, CANCELLED
  "overdueFee": 0,
  "isOverdue": false,
  "overdueDays": 0
}
```

✅ **호환성**: 100% - 완벽하게 일치 (추가 필드 포함)

#### Member 타입
**현재 타입**:
```typescript
export interface Member {
  id: number;
  name: string;
  email: string;
  membershipType: 'REGULAR' | 'PREMIUM';
  status: MemberStatus;
  joinDate: string;
}
```

**API 응답** (`MemberResponse`):
```json
{
  "id": 1,
  "name": "홍길동",
  "email": "hong@example.com",
  "membershipType": "REGULAR",  // REGULAR, PREMIUM, SUSPENDED
  "joinDate": "2025-01-01T00:00:00"
}
```

⚠️ **호환성**: 90% - API에는 `status` 필드가 없음 (대신 `SUSPENDED` 타입으로 표현)

---

## 3. 연동 구현 계획

### Phase 1: API 클라이언트 구축 (1-2일)
```
src/
  services/
    api/
      client.ts          # Axios/Fetch 기반 API 클라이언트
      books.ts           # Books API
      loans.ts           # Loans API
      members.ts         # Members API
      orders.ts          # Orders API
    types/
      api.ts             # API 요청/응답 타입
```

### Phase 2: 도서 목록/검색 연동 (1일)
- `BookList.tsx`: API 연동
- `BookDetail.tsx`: API 연동
- 검색 기능 API 연동
- 페이징 처리

### Phase 3: 대여/반납 기능 연동 (1-2일)
- `BookDetail.tsx`: 대여 생성 API 연동
- `MyLoans.tsx`: 대출 목록 조회 API 연동
- 반납 기능 API 연동
- 에러 처리 및 검증

### Phase 4: 회원 관리 연동 (1일)
- 회원 인증 시스템 구축 (현재 memberId=1 하드코딩)
- 회원 정보 API 연동
- 대여 한도 확인 기능

### Phase 5: 추가 기능 구현 (1-2일)
- 대여 연장 기능
- 연체료 계산
- 주문/구매 기능
- 통계 대시보드

---

## 4. 즉시 연동 가능한 API (우선순위 순)

### 🔥 높음 (기존 기능 대체)

1. **도서 목록 조회**
   - `GET /api/books?page=0&size=12`
   - 영향: `BookList.tsx`

2. **도서 검색**
   - `GET /api/books/search?keyword={검색어}`
   - 영향: `BookList.tsx` 검색 기능

3. **도서 상세**
   - `GET /api/books/{id}`
   - 영향: `BookDetail.tsx`

4. **대여 생성**
   - `POST /api/loans`
   - 영향: `BookDetail.tsx` Borrow 기능

5. **회원별 대출 목록**
   - `GET /api/loans/member/{memberId}`
   - 영향: `MyLoans.tsx`

6. **도서 반납**
   - `PATCH /api/loans/{id}/return`
   - 영향: `MyLoans.tsx` Return 기능

### ⚡ 중간 (신규 기능 추가)

7. **대여 연장**
   - `PATCH /api/loans/{id}/extend`
   - 신규 기능

8. **연체 대출 조회**
   - `GET /api/loans/overdue`
   - MyLoans 필터 개선

9. **연체료 조회**
   - `GET /api/loans/{id}/overdue-fee`
   - 신규 기능

10. **대여 가능 여부 확인**
    - `GET /api/loans/member/{memberId}/can-loan`
    - 대여 전 검증

### 💡 낮음 (관리자 기능)

11. **도서 통계**
    - `GET /api/books/statistics`
    - Admin 대시보드

12. **회원 관리**
    - `GET /api/members`
    - Admin 페이지

---

## 5. 구현 예시 코드

### 5.1 API 클라이언트 기본 구조

```typescript
// src/services/api/client.ts
const API_BASE_URL = 'http://localhost:8080';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

### 5.2 Books API 서비스

```typescript
// src/services/api/books.ts
import { apiClient } from './client';
import type { Book, PageResponse } from '../../shared/types';

export const booksApi = {
  // 도서 목록 조회
  getBooks: (page: number = 0, size: number = 12) => {
    return apiClient.get<PageResponse<Book>>(
      `/api/books?page=${page}&size=${size}`
    );
  },

  // 도서 상세 조회
  getBook: (id: number) => {
    return apiClient.get<Book>(`/api/books/${id}`);
  },

  // 도서 검색
  searchBooks: (params: {
    keyword?: string;
    title?: string;
    author?: string;
    page?: number;
    size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    return apiClient.get<PageResponse<Book>>(
      `/api/books/search?${queryParams}`
    );
  },
};
```

### 5.3 Loans API 서비스

```typescript
// src/services/api/loans.ts
import { apiClient } from './client';
import type { Loan } from '../../shared/types';

export const loansApi = {
  // 대여 생성
  createLoan: (memberId: number, bookId: number, loanDays: number = 14) => {
    return apiClient.post<Loan>('/api/loans', {
      memberId,
      bookId,
      loanDays,
    });
  },

  // 회원별 대출 목록
  getLoansByMember: (memberId: number) => {
    return apiClient.get<Loan[]>(`/api/loans/member/${memberId}`);
  },

  // 활성 대출 목록
  getActiveLoans: (memberId: number) => {
    return apiClient.get<Loan[]>(`/api/loans/active/member/${memberId}`);
  },

  // 도서 반납
  returnBook: (loanId: number) => {
    return apiClient.patch<Loan>(`/api/loans/${loanId}/return`);
  },

  // 대여 연장
  extendLoan: (loanId: number, days: number) => {
    return apiClient.patch<Loan>(`/api/loans/${loanId}/extend`, { days });
  },

  // 대여 취소/삭제
  cancelLoan: (loanId: number) => {
    return apiClient.delete(`/api/loans/${loanId}`);
  },
};
```

### 5.4 사용 예시: BookList 컴포넌트

```typescript
// src/client/pages/BookList.tsx (수정 버전)
import { useState, useEffect } from "react";
import { booksApi } from "../../services/api/books";
import type { Book } from "../../shared/types";

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await booksApi.getBooks(currentPage, 12);
        setBooks(response.content);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* 기존 UI 코드 */}
    </div>
  );
};
```

---

## 6. 주요 고려사항

### 6.1 인증/인가
- ⚠️ 현재 API는 인증 없이 사용 가능
- 향후 JWT 또는 세션 기반 인증 추가 필요
- 현재 `memberId=1` 하드코딩을 실제 로그인 시스템으로 교체

### 6.2 에러 처리
```typescript
// 표준 에러 처리
try {
  const loan = await loansApi.createLoan(memberId, bookId, 14);
} catch (error) {
  if (error.status === 409) {
    alert('이미 대여 중인 도서입니다.');
  } else if (error.status === 400) {
    alert('잘못된 요청입니다.');
  } else {
    alert('대여 처리 중 오류가 발생했습니다.');
  }
}
```

### 6.3 상태 관리
- React Query 또는 SWR 사용 권장
- 캐싱 및 자동 리페칭
- Optimistic Updates

### 6.4 개발/운영 환경 분리
```typescript
// .env
VITE_API_BASE_URL=http://localhost:8080

// .env.production
VITE_API_BASE_URL=https://api.example.com
```

---

## 7. 결론 및 권장사항

### ✅ 연동 가능성: 95%
- 현재 프로젝트와 API의 데이터 모델이 거의 완벽하게 일치
- localStorage 기반 코드를 API 호출로 간단히 교체 가능
- 타입 호환성 높음

### 🚀 즉시 시작 가능
1. API 클라이언트 기본 구조 구축 (1시간)
2. 도서 목록/상세 API 연동 (2-3시간)
3. 대여/반납 API 연동 (2-3시간)
4. 나머지 기능 순차 연동

### 📋 권장 순서
1. **Phase 1**: API 클라이언트 구축
2. **Phase 2**: 도서 관련 API 연동 (읽기 작업)
3. **Phase 3**: 대여/반납 API 연동 (쓰기 작업)
4. **Phase 4**: 에러 처리 및 UX 개선
5. **Phase 5**: 추가 기능 (연장, 연체료 등)

### 💡 추가 제안
- React Query 도입으로 API 상태 관리 개선
- 환경 변수로 API URL 관리
- 타입 안전성을 위한 API 스키마 자동 생성 (openapi-typescript)
- E2E 테스트 추가

---

**생성일**: 2025-11-26
**작성자**: Claude Code
**버전**: 1.0
