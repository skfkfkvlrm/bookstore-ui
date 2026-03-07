
# Spring Library System API 가이드

## 개요

이 문서는 Spring Library System의 REST API 사용법을 설명합니다.

- **Base URL**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

## 인증

### 공개 API (인증 불필요)
- `POST /api/auth/signup`
- `POST /api/auth/login`

### 보호된 API
그 외 모든 API는 JWT 인증이 필요합니다.

```http
Authorization: Bearer <access-token>
```

### 회원가입
```bash
curl -X POST "http://localhost:8080/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "email": "hong@example.com",
    "password": "password123"
  }'
```

### 로그인
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hong@example.com",
    "password": "password123"
  }'
```

**응답 예제:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer"
}
```

이후 모든 요청 헤더에 `Authorization: Bearer <accessToken>` 을 포함합니다.

---

## 공통 에러 응답

```json
{
  "timestamp": "2026-02-19T10:00:00+09:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "입력값이 올바르지 않습니다",
  "path": "/api/orders",
  "fieldErrors": [
    {
      "field": "items",
      "rejectedValue": "[]",
      "message": "주문 항목은 최소 1개 이상이어야 합니다."
    }
  ]
}
```

### 응답 코드
| 코드 | 설명 |
|------|------|
| 200 OK | 성공적인 조회/수정 |
| 201 Created | 성공적인 생성 |
| 204 No Content | 성공적인 삭제 |
| 400 Bad Request | 잘못된 요청 데이터 |
| 401 Unauthorized | 인증 토큰 없음/만료 |
| 403 Forbidden | 권한 없음 |
| 404 Not Found | 리소스를 찾을 수 없음 |
| 409 Conflict | 중복 데이터 (ISBN, Email) |

---

## 페이징 파라미터

| 파라미터 | 설명 | 기본값 |
|----------|------|--------|
| page | 페이지 번호 (0부터 시작) | 0 |
| size | 페이지 크기 | 10 |
| sort | 정렬 기준 | createdDate |
| direction | 정렬 방향 (asc/desc) | desc |

---

## 엔드포인트 목록

### Auth (`/api/auth`) — 2개
| Method | Path | 설명 |
|--------|------|------|
| POST | /signup | 회원가입 |
| POST | /login | 로그인 |

### Book (`/api/books`) — 17개
| Method | Path | 설명 |
|--------|------|------|
| POST | / | 도서 등록 |
| GET | /{id} | 도서 단건 조회 |
| GET | / | 도서 목록 조회 (페이징) |
| PUT | /{id} | 도서 수정 |
| DELETE | /{id} | 도서 삭제 (Soft Delete) |
| PATCH | /{id}/restore | 도서 복원 |
| GET | /isbn/{isbn} | ISBN으로 조회 |
| GET | /search/title | 제목으로 검색 |
| GET | /search/author | 저자로 검색 |
| GET | /search/keyword | 키워드 검색 (제목+저자) |
| GET | /search/price | 가격 범위로 검색 |
| GET | /search | 복합 조건 검색 (페이징) |
| GET | /search/query | 통합 검색 |
| GET | /availability/{available} | 재고 상태별 조회 |
| PATCH | /{id}/availability | 재고 상태 변경 |
| GET | /validate/isbn | ISBN 중복 확인 |
| GET | /statistics | 도서 통계 |

### Member (`/api/members`) — 10개
| Method | Path | 설명 |
|--------|------|------|
| POST | / | 회원 등록 |
| GET | /{id} | 회원 단건 조회 |
| GET | / | 회원 목록 조회 (페이징) |
| PUT | /{id} | 회원 정보 수정 |
| DELETE | /{id} | 회원 삭제 |
| GET | /search | 이름으로 검색 |
| GET | /membership/{type} | 회원 등급별 조회 |
| PUT | /{id}/membership | 회원 등급 변경 |
| GET | /email/validate | 이메일 중복 확인 |
| GET | /{id}/loan-limit | 대출 한도 조회 |

### Order (`/api/orders`) — 13개
| Method | Path | 설명 |
|--------|------|------|
| POST | / | 주문 생성 |
| GET | / | 주문 목록 조회 (페이징) |
| GET | /{id} | 주문 단건 조회 |
| PATCH | /{id}/confirm | 주문 확인 |
| PATCH | /{id}/ship | 배송 시작 |
| PATCH | /{id}/deliver | 배송 완료 |
| PATCH | /{id}/cancel | 주문 취소 |
| GET | /status/{status} | 상태별 주문 조회 |
| GET | /date-range | 기간별 주문 조회 |
| GET | /amount-range | 금액 범위별 주문 조회 |
| GET | /book/{bookId} | 도서별 주문 조회 |
| GET | /statistics | 주문 통계 |
| GET | /revenue | 매출 조회 |

### Loan — 19개

**관리자 (`/api/admin/loans`) — 15개**
| Method | Path | 설명 |
|--------|------|------|
| GET | / | 대출 목록 조회 |
| GET | /{id} | 대출 단건 조회 |
| POST | / | 대출 등록 |
| PATCH | /{id} | 대출 정보 수정 |
| DELETE | /{id} | 대출 삭제 |
| GET | /overdue | 연체 대출 목록 |
| GET | /active | 활성 대출 목록 |
| GET | /member/{memberId} | 회원별 대출 목록 |
| GET | /book/{bookId} | 도서별 대출 목록 |
| GET | /search/by-member-name | 회원 이름으로 검색 |
| GET | /search/by-book-title | 도서 제목으로 검색 |
| GET | /with-details | 상세 정보 포함 목록 |
| GET | /search/members-by-book-title | 도서 제목으로 회원 검색 |
| GET | /member/{memberId}/borrowed-books | 회원의 대출 도서 목록 |
| GET | /overdue/with-member-info | 연체 대출 + 회원 정보 |

**사용자 (`/api/client/loans`) — 4개**
| Method | Path | 설명 |
|--------|------|------|
| GET | / | 내 대출 목록 |
| POST | /{id}/return | 반납 처리 |
| DELETE | /{id} | 대출 신청 취소 |
| POST | /request | 대출 신청 |

### Delivery (`/api/deliveries`) — 8개
| Method | Path | 설명 |
|--------|------|------|
| GET | /{id} | 배송 단건 조회 |
| GET | /order/{orderId} | 주문별 배송 조회 |
| GET | /tracking/{trackingNumber} | 운송장 번호로 조회 |
| GET | /status/{status} | 상태별 배송 조회 |
| PATCH | /{id}/start | 배송 시작 |
| PATCH | /{id}/complete | 배송 완료 |
| PATCH | /{id}/status | 배송 상태 변경 |
| PATCH | /{id}/address | 배송지 변경 |

### Payment (`/api/payments`) — 7개
| Method | Path | 설명 |
|--------|------|------|
| GET | /{id} | 결제 단건 조회 |
| GET | /order/{orderId} | 주문별 결제 조회 |
| GET | /status/{status} | 상태별 결제 조회 |
| PATCH | /{id}/complete | 결제 완료 |
| PATCH | /{id}/fail | 결제 실패 |
| PATCH | /{id}/cancel | 결제 취소 |
| PATCH | /{id}/refund | 환불 처리 |

### Refund (`/api/refunds`) — 11개
| Method | Path | 설명 |
|--------|------|------|
| POST | / | 환불 신청 |
| GET | /{id} | 환불 단건 조회 |
| GET | /order/{orderId} | 주문별 환불 조회 |
| GET | /status/{status} | 상태별 환불 조회 |
| GET | /pending | 처리 대기 환불 목록 |
| PATCH | /{id}/approve | 환불 승인 |
| PATCH | /{id}/reject | 환불 거절 |
| PATCH | /{id}/start-processing | 환불 처리 시작 |
| PATCH | /{id}/complete | 환불 완료 |
| PATCH | /{id}/fail | 환불 실패 |
| GET | /order/{orderId}/total-amount | 주문별 총 환불 금액 |

**총 87개 엔드포인트**

---

## API 사용 예제

### 회원 관리

#### 회원 등록
```bash
curl -X POST "http://localhost:8080/api/members" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "email": "hong@example.com",
    "membershipType": "BASIC"
  }'
```

**응답 예제:**
```json
{
  "id": 1,
  "name": "홍길동",
  "email": "hong@example.com",
  "membershipType": "BASIC",
  "status": "ACTIVE",
  "joinDate": "2026-02-19T10:30:00"
}
```

#### 회원 목록 조회 (페이징)
```bash
curl -X GET "http://localhost:8080/api/members?page=0&size=10" \
  -H "Authorization: Bearer <token>"
```

#### 회원 이름으로 검색
```bash
curl -X GET "http://localhost:8080/api/members/search?name=홍" \
  -H "Authorization: Bearer <token>"
```

#### 회원 등급 변경
```bash
curl -X PUT "http://localhost:8080/api/members/1/membership?membershipType=GOLD" \
  -H "Authorization: Bearer <token>"
```

#### 회원 대출 한도 조회
```bash
curl -X GET "http://localhost:8080/api/members/1/loan-limit" \
  -H "Authorization: Bearer <token>"
```

#### 이메일 중복 확인
```bash
curl -X GET "http://localhost:8080/api/members/email/validate?email=test@example.com" \
  -H "Authorization: Bearer <token>"
```

---

### 도서 관리

#### 도서 등록
```bash
curl -X POST "http://localhost:8080/api/books" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "price": 45000,
    "available": true
  }'
```

**응답 예제:**
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "price": 45000,
  "available": true,
  "createdDate": "2026-02-19T10:35:00"
}
```

#### 도서 목록 조회 (페이징)
```bash
curl -X GET "http://localhost:8080/api/books?page=0&size=10&sort=createdDate&direction=desc" \
  -H "Authorization: Bearer <token>"
```

#### 도서 검색

```bash
# 제목으로 검색
curl -X GET "http://localhost:8080/api/books/search/title?title=Clean" \
  -H "Authorization: Bearer <token>"

# 저자로 검색
curl -X GET "http://localhost:8080/api/books/search/author?author=Martin" \
  -H "Authorization: Bearer <token>"

# 키워드 검색 (제목+저자)
curl -X GET "http://localhost:8080/api/books/search/keyword?keyword=Java" \
  -H "Authorization: Bearer <token>"

# 가격 범위로 검색
curl -X GET "http://localhost:8080/api/books/search/price?minPrice=40000&maxPrice=50000" \
  -H "Authorization: Bearer <token>"

# 복합 조건 검색
curl -X GET "http://localhost:8080/api/books/search?title=Clean&author=Martin&minPrice=40000&maxPrice=60000&available=true&page=0&size=10" \
  -H "Authorization: Bearer <token>"
```

#### 재고 상태 관리
```bash
# 재고 없음으로 변경
curl -X PATCH "http://localhost:8080/api/books/1/availability?available=false" \
  -H "Authorization: Bearer <token>"

# 재고 있는 도서만 조회
curl -X GET "http://localhost:8080/api/books/availability/true" \
  -H "Authorization: Bearer <token>"
```

#### Soft Delete
```bash
# 도서 삭제 (논리 삭제)
curl -X DELETE "http://localhost:8080/api/books/1" \
  -H "Authorization: Bearer <token>"

# 도서 복원
curl -X PATCH "http://localhost:8080/api/books/1/restore" \
  -H "Authorization: Bearer <token>"
```

#### 도서 통계
```bash
curl -X GET "http://localhost:8080/api/books/statistics" \
  -H "Authorization: Bearer <token>"
```

**응답 예제:**
```json
{
  "totalBooks": 10,
  "activeBooks": 8,
  "deletedBooks": 2
}
```

---

### 주문 관리

#### 주문 생성
```bash
curl -X POST "http://localhost:8080/api/orders" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 1,
    "items": [
      { "bookId": 1, "quantity": 1 },
      { "bookId": 2, "quantity": 1 }
    ]
  }'
```

**응답 예제:**
```json
{
  "id": 1,
  "totalAmount": 97000,
  "orderDate": "2026-02-19T10:00:00",
  "status": "PENDING",
  "items": [
    { "bookId": 1, "bookTitle": "Clean Code", "quantity": 1, "price": 45000 },
    { "bookId": 2, "bookTitle": "Spring in Action", "quantity": 1, "price": 52000 }
  ]
}
```

#### 주문 상태 변경
```bash
# PENDING → CONFIRMED
curl -X PATCH "http://localhost:8080/api/orders/1/confirm" \
  -H "Authorization: Bearer <token>"

# CONFIRMED → SHIPPED
curl -X PATCH "http://localhost:8080/api/orders/1/ship" \
  -H "Authorization: Bearer <token>"

# SHIPPED → DELIVERED
curl -X PATCH "http://localhost:8080/api/orders/1/deliver" \
  -H "Authorization: Bearer <token>"

# 주문 취소
curl -X PATCH "http://localhost:8080/api/orders/1/cancel" \
  -H "Authorization: Bearer <token>"
```

**주문 상태 흐름:**
```
PENDING → CONFIRMED → SHIPPED → DELIVERED
                              ↘ CANCELLED (DELIVERED 이전만 가능)
```

#### 주문 조회
```bash
# 상태별 조회
curl -X GET "http://localhost:8080/api/orders/status/PENDING?page=0&size=10" \
  -H "Authorization: Bearer <token>"

# 기간별 조회
curl -X GET "http://localhost:8080/api/orders/date-range?startDate=2026-01-01T00:00:00&endDate=2026-12-31T23:59:59&page=0&size=10" \
  -H "Authorization: Bearer <token>"

# 금액 범위별 조회
curl -X GET "http://localhost:8080/api/orders/amount-range?minAmount=10000&maxAmount=100000&page=0&size=10" \
  -H "Authorization: Bearer <token>"

# 도서별 주문 조회
curl -X GET "http://localhost:8080/api/orders/book/1" \
  -H "Authorization: Bearer <token>"
```

#### 주문 통계 및 매출
```bash
# 주문 통계
curl -X GET "http://localhost:8080/api/orders/statistics" \
  -H "Authorization: Bearer <token>"

# 매출 조회
curl -X GET "http://localhost:8080/api/orders/revenue" \
  -H "Authorization: Bearer <token>"
```

**통계 응답 예제:**
```json
{
  "totalOrders": 100,
  "pendingOrders": 20,
  "confirmedOrders": 30,
  "shippedOrders": 25,
  "deliveredOrders": 20,
  "cancelledOrders": 5,
  "totalRevenue": 5000000,
  "averageOrderAmount": 50000
}
```

---

### 대출 관리 (관리자)

#### 대출 등록
```bash
curl -X POST "http://localhost:8080/api/admin/loans" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 1,
    "bookId": 1,
    "dueDate": "2026-03-19"
  }'
```

#### 대출 목록 조회
```bash
# 전체 대출 목록
curl -X GET "http://localhost:8080/api/admin/loans" \
  -H "Authorization: Bearer <token>"

# 연체 대출 목록
curl -X GET "http://localhost:8080/api/admin/loans/overdue" \
  -H "Authorization: Bearer <token>"

# 활성 대출 목록
curl -X GET "http://localhost:8080/api/admin/loans/active" \
  -H "Authorization: Bearer <token>"

# 회원별 대출 목록
curl -X GET "http://localhost:8080/api/admin/loans/member/1" \
  -H "Authorization: Bearer <token>"

# 도서별 대출 목록
curl -X GET "http://localhost:8080/api/admin/loans/book/1" \
  -H "Authorization: Bearer <token>"

# 연체 대출 + 회원 정보
curl -X GET "http://localhost:8080/api/admin/loans/overdue/with-member-info" \
  -H "Authorization: Bearer <token>"
```

#### 대출 검색
```bash
# 회원 이름으로 검색
curl -X GET "http://localhost:8080/api/admin/loans/search/by-member-name?name=홍" \
  -H "Authorization: Bearer <token>"

# 도서 제목으로 검색
curl -X GET "http://localhost:8080/api/admin/loans/search/by-book-title?title=Clean" \
  -H "Authorization: Bearer <token>"
```

---

### 대출 관리 (사용자)

#### 대출 신청
```bash
curl -X POST "http://localhost:8080/api/client/loans/request" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": 1
  }'
```

#### 반납 처리
```bash
curl -X POST "http://localhost:8080/api/client/loans/1/return" \
  -H "Authorization: Bearer <token>"
```

#### 내 대출 목록 조회
```bash
curl -X GET "http://localhost:8080/api/client/loans" \
  -H "Authorization: Bearer <token>"
```

---

### 배송 관리

#### 배송 조회
```bash
# 단건 조회
curl -X GET "http://localhost:8080/api/deliveries/1" \
  -H "Authorization: Bearer <token>"

# 주문별 배송 조회
curl -X GET "http://localhost:8080/api/deliveries/order/1" \
  -H "Authorization: Bearer <token>"

# 운송장 번호로 조회
curl -X GET "http://localhost:8080/api/deliveries/tracking/TRACK123456" \
  -H "Authorization: Bearer <token>"

# 상태별 조회
curl -X GET "http://localhost:8080/api/deliveries/status/IN_TRANSIT" \
  -H "Authorization: Bearer <token>"
```

#### 배송 상태 변경
```bash
# 배송 시작
curl -X PATCH "http://localhost:8080/api/deliveries/1/start" \
  -H "Authorization: Bearer <token>"

# 배송 완료
curl -X PATCH "http://localhost:8080/api/deliveries/1/complete" \
  -H "Authorization: Bearer <token>"

# 배송지 변경
curl -X PATCH "http://localhost:8080/api/deliveries/1/address" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "서울시 강남구 테헤란로 123"
  }'
```

---

### 결제 관리

#### 결제 조회
```bash
# 단건 조회
curl -X GET "http://localhost:8080/api/payments/1" \
  -H "Authorization: Bearer <token>"

# 주문별 결제 조회
curl -X GET "http://localhost:8080/api/payments/order/1" \
  -H "Authorization: Bearer <token>"

# 상태별 조회
curl -X GET "http://localhost:8080/api/payments/status/COMPLETED" \
  -H "Authorization: Bearer <token>"
```

#### 결제 상태 변경
```bash
# 결제 완료
curl -X PATCH "http://localhost:8080/api/payments/1/complete" \
  -H "Authorization: Bearer <token>"

# 결제 실패
curl -X PATCH "http://localhost:8080/api/payments/1/fail" \
  -H "Authorization: Bearer <token>"

# 결제 취소
curl -X PATCH "http://localhost:8080/api/payments/1/cancel" \
  -H "Authorization: Bearer <token>"

# 환불 처리
curl -X PATCH "http://localhost:8080/api/payments/1/refund" \
  -H "Authorization: Bearer <token>"
```

---

### 환불 관리

#### 환불 신청
```bash
curl -X POST "http://localhost:8080/api/refunds" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "reason": "단순 변심"
  }'
```

#### 환불 조회
```bash
# 단건 조회
curl -X GET "http://localhost:8080/api/refunds/1" \
  -H "Authorization: Bearer <token>"

# 주문별 환불 조회
curl -X GET "http://localhost:8080/api/refunds/order/1" \
  -H "Authorization: Bearer <token>"

# 상태별 조회
curl -X GET "http://localhost:8080/api/refunds/status/PENDING" \
  -H "Authorization: Bearer <token>"

# 처리 대기 목록
curl -X GET "http://localhost:8080/api/refunds/pending" \
  -H "Authorization: Bearer <token>"

# 주문별 총 환불 금액
curl -X GET "http://localhost:8080/api/refunds/order/1/total-amount" \
  -H "Authorization: Bearer <token>"
```

#### 환불 상태 변경 (관리자)
```bash
# 환불 승인
curl -X PATCH "http://localhost:8080/api/refunds/1/approve" \
  -H "Authorization: Bearer <token>"

# 환불 거절
curl -X PATCH "http://localhost:8080/api/refunds/1/reject" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "reason": "환불 기한 초과" }'

# 처리 시작
curl -X PATCH "http://localhost:8080/api/refunds/1/start-processing" \
  -H "Authorization: Bearer <token>"

# 처리 완료
curl -X PATCH "http://localhost:8080/api/refunds/1/complete" \
  -H "Authorization: Bearer <token>"
```

---

## Validation 규칙

### 도서 (Book)
| 필드 | 규칙 |
|------|------|
| title | 필수, 최대 200자 |
| author | 필수, 최대 100자 |
| isbn | 필수, 13자리 숫자 (하이픈 포함 가능) |
| price | 필수, 0보다 큰 수 |

### 회원 (Member)
| 필드 | 규칙 |
|------|------|
| name | 필수, 최대 100자 |
| email | 필수, 유효한 이메일 형식, 중복 불가 |
| membershipType | BASIC, SILVER, GOLD, VIP 중 하나 |

### 주문 (Order)
| 필드 | 규칙 |
|------|------|
| items | 최소 1개 이상 |
| memberId | 필수 |

---

## 개발 환경 정보

### H2 Console
- **URL**: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:devdb`
- **Username**: `sa`
- **Password**: (빈 값)

### Swagger UI
- **URL**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

릴리즈 전 Swagger UI와 본 문서를 함께 확인하세요.

---

## 관련 문서
- `docs/3.3.Curl테스트가이드.md` — cURL 상세 테스트 예제
- `docs/3.4.Swagger설정가이드.md` — Swagger/OpenAPI 설정
- `docs/5.1.보안구현계획.md` — JWT 보안 구현 계획
- `LOAN_GUIDE.md` — 대출 시스템 상세 문서
- `README.md` — 프로젝트 개요
