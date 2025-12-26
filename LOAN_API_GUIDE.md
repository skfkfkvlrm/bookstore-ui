#  लोन (Loan) API 가이드

## 📚 개요

이 문서는 도서관 관리 시스템의 대출(Loan) 관련 REST API 사용법을 설명합니다. 관리자(Admin)와 일반 사용자(Client)의 역할에 따라 엔드포인트를 구분하여 명세합니다.

## 📌 기본 정보

- **Base URL**: `/api`
- **Data Format**: `application/json`
- **Authentication**: 모든 요청은 인증(예: JWT Bearer Token)이 필요하다고 가정합니다. 서버는 토큰을 통해 요청자의 역할(관리자/사용자)과 ID를 식별합니다.

## 📄 데이터 모델

### Loan

```json
{
  "id": 1,
  "bookId": 15,
  "bookTitle": "The Silent Patient",
  "bookAuthor": "Alex Michaelides",
  "memberId": 4,
  "memberName": "James Wilson",
  "memberEmail": "james.wilson@email.com",
  "loanDate": "2025-10-02T11:45:00Z",
  "dueDate": "2025-10-16T11:45:00Z",
  "returnDate": null,
  "status": "ACTIVE"
}
```

- **status**: 대출 상태
  - `ACTIVE`: 대출 중
  - `OVERDUE`: 연체 중
  - `RETURNED`: 반납 완료

---

## 👑 관리자 (Admin) API

관리자는 모든 회원의 대출 기록을 관리할 수 있습니다.

### 1. 전체 대출 목록 조회

모든 대출 기록을 검색, 필터링, 정렬, 페이징하여 조회합니다.

- **GET** `/api/admin/loans`

**Query Parameters:**

| 파라미터         | 타입     | 설명                                             | 기본값     |
| ---------------- | -------- | ------------------------------------------------ | ---------- |
| `page`           | `number` | 페이지 번호 (0부터 시작)                         | `0`        |
| `size`           | `number` | 페이지 당 항목 수                                | `10`       |
| `searchQuery`    | `string` | 도서명, 회원명, 이메일로 검색                    | (없음)     |
| `statusFilter`   | `string` | 대출 상태 (`ACTIVE`, `OVERDUE`, `RETURNED`)      | `all`      |
| `sortKey`        | `string` | 정렬 기준 (`loanDate`, `dueDate`, `bookTitle`)   | `loanDate` |
| `sortOrder`      | `string` | 정렬 순서 (`asc`, `desc`)                        | `desc`     |

**curl 예제:**

```bash
# 기본 조회 (첫 페이지, 10개 항목)
curl -X GET "http://localhost:8080/api/admin/loans" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 검색 + 필터 + 정렬
curl -X GET "http://localhost:8080/api/admin/loans?searchQuery=James&statusFilter=ACTIVE&sortKey=dueDate&sortOrder=asc&page=0&size=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 연체 대출만 조회
curl -X GET "http://localhost:8080/api/admin/loans?statusFilter=OVERDUE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**응답 (200 OK):**

```json
{
  "content": [
    {
      "id": 1,
      "bookTitle": "The Silent Patient",
      "memberName": "James Wilson",
      "loanDate": "2025-10-02T11:45:00Z",
      "dueDate": "2025-10-16T11:45:00Z",
      "status": "ACTIVE"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": { "sorted": true, "unsorted": false, "empty": false },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 5,
  "totalElements": 50,
  "last": false,
  "first": true,
  "numberOfElements": 10,
  "size": 10,
  "number": 0,
  "empty": false
}
```

### 2. 단일 대출 상세 조회

특정 대출의 모든 정보를 조회합니다.

- **GET** `/api/admin/loans/{id}`

**curl 예제:**

```bash
curl -X GET "http://localhost:8080/api/admin/loans/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**응답 (200 OK):**

```json
{
  "id": 1,
  "bookId": 15,
  "bookTitle": "The Silent Patient",
  "bookAuthor": "Alex Michaelides",
  "memberId": 4,
  "memberName": "James Wilson",
  "memberEmail": "james.wilson@email.com",
  "loanDate": "2025-10-02T11:45:00Z",
  "dueDate": "2025-10-16T11:45:00Z",
  "returnDate": null,
  "status": "ACTIVE"
}
```

### 3. 신규 대출 생성

관리자가 오프라인 요청 등을 통해 새로운 대출을 직접 생성합니다.

- **POST** `/api/admin/loans`

**요청 본문:**

```json
{
  "memberId": 4,
  "bookId": 15,
  "loanDate": "2025-10-02T11:45:00Z",
  "dueDate": "2025-10-16T11:45:00Z"
}
```
> 서버는 요청을 받으면 `bookId`와 `memberId`로 책/회원 정보를 채우고, 책의 `available` 상태를 `false`로 변경해야 합니다.

**curl 예제:**

```bash
curl -X POST "http://localhost:8080/api/admin/loans" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 4,
    "bookId": 15,
    "loanDate": "2025-10-02T11:45:00Z",
    "dueDate": "2025-10-16T11:45:00Z"
  }'
```

**응답 (201 Created):** 생성된 `Loan` 객체 전체

### 4. 대출 정보 수정 (반납, 날짜 연장)

대출 상태를 변경하거나 반납일을 연장합니다.

- **PATCH** `/api/admin/loans/{id}`

**요청 본문 (반납 처리 시):**

```json
{
  "status": "RETURNED"
}
```
> 서버는 `status`가 `RETURNED`로 변경되면 `returnDate`를 현재 시간으로 설정하고, 해당 도서의 `available` 상태를 `true`로 변경해야 합니다.

**요청 본문 (날짜 연장 시):**

```json
{
  "dueDate": "2025-10-30T11:45:00Z"
}
```
> 서버는 `dueDate`가 현재 시간보다 미래인 경우, `status`를 `ACTIVE`로 변경해야 합니다.

**curl 예제:**

```bash
# 반납 처리
curl -X PATCH "http://localhost:8080/api/admin/loans/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RETURNED"
  }'

# 반납일 연장
curl -X PATCH "http://localhost:8080/api/admin/loans/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2025-10-30T11:45:00Z"
  }'
```

**응답 (200 OK):** 수정된 `Loan` 객체 전체

### 5. 대출 기록 삭제

- **DELETE** `/api/admin/loans/{id}`

**curl 예제:**

```bash
curl -X DELETE "http://localhost:8080/api/admin/loans/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**응답 (204 No Content):** 본문 없음

---

## 👤 사용자 (Client) API

인증된 사용자는 자신의 대출 기록만 조회하고 관리할 수 있습니다.

### 1. 내 대출 목록 조회

- **GET** `/api/my/loans`

**Query Parameters:**

| 파라미터       | 타입     | 설명                                        | 기본값  |
| -------------- | -------- | ------------------------------------------- | ------- |
| `statusFilter` | `string` | 대출 상태 (`ACTIVE`, `OVERDUE`, `RETURNED`) | `ALL`   |

**curl 예제:**

```bash
# 내 모든 대출 조회
curl -X GET "http://localhost:8080/api/my/loans" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 대출 중인 도서만 조회
curl -X GET "http://localhost:8080/api/my/loans?statusFilter=ACTIVE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 연체 중인 도서만 조회
curl -X GET "http://localhost:8080/api/my/loans?statusFilter=OVERDUE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**응답 (200 OK):** `Loan` 객체의 배열

```json
[
  {
    "id": 1,
    "bookId": 15,
    "bookTitle": "The Silent Patient",
    "loanDate": "2025-10-02T11:45:00Z",
    "dueDate": "2025-10-16T11:45:00Z",
    "status": "ACTIVE"
  }
]
```

### 2. 도서 반납 신청

사용자가 직접 도서를 반납했음을 시스템에 알립니다. (실제 반납은 별도 절차)

- **POST** `/api/my/loans/{id}/return`

> 서버는 해당 대출이 요청한 사용자의 것인지 확인해야 합니다.

**요청 본문:** 없음

**curl 예제:**

```bash
curl -X POST "http://localhost:8080/api/my/loans/1/return" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**응답 (200 OK):** `status`가 `RETURNED`로 변경된 `Loan` 객체

---

## 📋 비즈니스 규칙

### 회원 등급별 대여 규칙

| 회원 등급 | 최대 대여 권수 | 대여 기간 | 연장 가능 횟수 | 연장 기간 |
|----------|-------------|----------|--------------|----------|
| `BASIC`  | 3권         | 14일      | 1회          | 7일      |
| `SILVER` | 5권         | 21일      | 2회          | 7일      |
| `GOLD`   | 10권        | 30일      | 3회          | 14일     |
| `VIP`    | 무제한       | 60일      | 무제한        | 30일     |

### 대여 기본 규칙

1. **대여 가능 조건**
   - 책이 대여 가능한 상태(`available: true`)여야 함
   - 회원의 현재 대여 중인 책 수가 등급별 최대 권수 미만이어야 함
   - 회원에게 연체 중인 책이 없어야 함
   - 회원 계정이 정지 상태가 아니어야 함

2. **연체 처리**
   - 반납 예정일(`dueDate`)이 경과하면 자동으로 `OVERDUE` 상태로 변경
   - 연체 중인 회원은 새로운 대출 불가
   - 연체료: 1일당 500원 (최대 10,000원)

3. **대여 연장**
   - 반납 예정일 3일 전부터 연장 신청 가능
   - 등급별 연장 가능 횟수 제한
   - 다른 회원의 예약이 있는 경우 연장 불가

4. **예약 우선순위**
   - 예약이 있는 도서는 반납 즉시 예약자에게 자동 대출 처리
   - 예약 대기 시간: 3일 (미수령시 다음 예약자에게 이전)

---

## 🚨 예외 상황 및 검증 규칙

### 대출 생성 시 검증

| 검증 항목 | 조건 | 실패 시 에러 코드 | 에러 메시지 |
|----------|------|-----------------|------------|
| 도서 존재 여부 | `bookId`에 해당하는 도서가 존재해야 함 | `BOOK_NOT_FOUND` | "존재하지 않는 도서입니다." |
| 도서 대여 가능 여부 | 도서의 `available`이 `true`여야 함 | `BOOK_ALREADY_LOANED` | "이미 대여 중인 도서입니다." |
| 회원 존재 여부 | `memberId`에 해당하는 회원이 존재해야 함 | `MEMBER_NOT_FOUND` | "존재하지 않는 회원입니다." |
| 회원 계정 상태 | 회원 계정이 `ACTIVE` 상태여야 함 | `MEMBER_ACCOUNT_SUSPENDED` | "정지된 계정입니다. 관리자에게 문의하세요." |
| 연체 여부 | 회원에게 연체 중인 대출이 없어야 함 | `MEMBER_HAS_OVERDUE` | "연체 중인 도서가 있습니다. 먼저 반납해주세요." |
| 대여 권수 제한 | 현재 대출 수 < 등급별 최대 권수 | `LOAN_LIMIT_EXCEEDED` | "대여 가능 권수를 초과했습니다. (현재: {current}/{max})" |
| 중복 대여 방지 | 동일 회원이 동일 도서를 대여 중이 아니어야 함 | `DUPLICATE_LOAN` | "이미 대여 중인 도서입니다." |
| 예약 우선권 | 예약이 있는 경우 예약자만 대여 가능 | `BOOK_RESERVED_BY_OTHER` | "다른 회원이 예약한 도서입니다." |

### 대출 수정 시 검증

| 검증 항목 | 조건 | 실패 시 에러 코드 | 에러 메시지 |
|----------|------|-----------------|------------|
| 대출 존재 여부 | `loanId`에 해당하는 대출이 존재해야 함 | `LOAN_NOT_FOUND` | "존재하지 않는 대출 기록입니다." |
| 권한 확인 | 사용자 본인의 대출이거나 관리자여야 함 | `FORBIDDEN` | "해당 대출 기록에 접근할 권한이 없습니다." |
| 연장 가능 여부 | 연장 횟수가 등급별 제한 미만이어야 함 | `EXTENSION_LIMIT_EXCEEDED` | "연장 가능 횟수를 초과했습니다. (최대: {max}회)" |
| 연장 시기 | 반납일 3일 전부터 연장 가능 | `EXTENSION_TOO_EARLY` | "반납 예정일 3일 전부터 연장 가능합니다." |
| 예약 확인 | 예약이 없어야 연장 가능 | `CANNOT_EXTEND_RESERVED_BOOK` | "예약이 있는 도서는 연장할 수 없습니다." |
| 반납 가능 여부 | `ACTIVE` 또는 `OVERDUE` 상태만 반납 가능 | `ALREADY_RETURNED` | "이미 반납된 도서입니다." |

### 반납 처리 시 검증

| 검증 항목 | 조건 | 실패 시 에러 코드 | 에러 메시지 |
|----------|------|-----------------|------------|
| 반납 가능 상태 | `status`가 `RETURNED`가 아니어야 함 | `ALREADY_RETURNED` | "이미 반납 처리된 대출입니다." |
| 연체료 계산 | 반납일이 예정일보다 늦은 경우 연체료 부과 | `OVERDUE_FEE_REQUIRED` | "연체료 {fee}원이 부과되었습니다." |

---

## 🔄 상태 전이 규칙 및 처리 로직

### 상태 다이어그램

```
[신규 대출] → ACTIVE → [반납] → RETURNED
                ↓
            [기한 경과]
                ↓
             OVERDUE → [반납] → RETURNED
```

### 상태별 처리 규칙

#### 1. ACTIVE (대출 중)

**진입 조건:**
- 새로운 대출 생성
- 연체 상태에서 대여 기간 연장

**자동 처리:**
- 매일 자정에 `dueDate` 확인하여 경과 시 `OVERDUE`로 변경
- 도서의 `available` 상태를 `false`로 설정

**가능한 작업:**
- 대여 기간 연장 (조건 충족 시)
- 반납 처리
- 대출 정보 조회

**알림 메시지:**
- 반납 3일 전: "반납 예정일이 3일 남았습니다. ({bookTitle}, 반납일: {dueDate})"
- 반납 1일 전: "반납 예정일이 내일입니다. ({bookTitle}, 반납일: {dueDate})"

#### 2. OVERDUE (연체 중)

**진입 조건:**
- `dueDate`를 경과한 `ACTIVE` 대출

**자동 처리:**
- 연체료 일일 계산 (500원/일, 최대 10,000원)
- 회원의 추가 대출 차단
- 연체 3일 경과 시 관리자에게 알림

**가능한 작업:**
- 반납 처리 (연체료 납부 필요)
- 대출 정보 조회

**알림 메시지:**
- 연체 발생 시: "도서 반납이 지연되었습니다. ({bookTitle}, 연체료: {fee}원)"
- 연체 3일차: "연체가 3일 경과했습니다. 빠른 반납 부탁드립니다. (연체료: {fee}원)"
- 연체 7일차: "연체가 1주일 경과했습니다. 계정 정지될 수 있으니 즉시 반납해주세요."

#### 3. RETURNED (반납 완료)

**진입 조건:**
- `ACTIVE` 또는 `OVERDUE` 상태에서 반납 처리

**자동 처리:**
- `returnDate`를 현재 시간으로 설정
- 도서의 `available` 상태를 `true`로 변경
- 예약이 있는 경우 예약자에게 알림 발송
- 연체료가 있는 경우 회원의 미납금에 추가

**가능한 작업:**
- 대출 정보 조회만 가능

**알림 메시지:**
- 정상 반납: "도서가 정상 반납되었습니다. 이용해주셔서 감사합니다. ({bookTitle})"
- 연체 반납: "도서가 반납되었습니다. 연체료 {fee}원이 부과되었습니다. ({bookTitle})"
- 예약자 알림: "예약하신 도서가 반납되었습니다. 3일 내에 대출해주세요. ({bookTitle})"

---

## ⚠️ 오류 응답

### HTTP 상태 코드

- **400 Bad Request**: 요청 데이터가 유효하지 않음
- **401 Unauthorized**: 인증되지 않은 요청
- **403 Forbidden**: 해당 작업을 수행할 권한이 없음
- **404 Not Found**: 요청한 리소스를 찾을 수 없음
- **409 Conflict**: 비즈니스 로직 충돌
- **422 Unprocessable Entity**: 유효성 검증 실패
- **500 Internal Server Error**: 서버 내부 오류

### 에러 응답 형식

```json
{
  "timestamp": "2025-10-15T14:30:00Z",
  "status": 409,
  "error": "Conflict",
  "code": "BOOK_ALREADY_LOANED",
  "message": "이미 대여 중인 도서입니다.",
  "details": {
    "bookId": 15,
    "bookTitle": "The Silent Patient",
    "currentLoanId": 42,
    "expectedReturnDate": "2025-10-20T11:45:00Z"
  },
  "path": "/api/admin/loans"
}
```

### 주요 에러 코드 및 메시지

#### 도서 관련 (BOOK_*)

| 코드 | HTTP 상태 | 메시지 | 설명 |
|-----|----------|--------|------|
| `BOOK_NOT_FOUND` | 404 | "존재하지 않는 도서입니다." | 요청한 bookId가 존재하지 않음 |
| `BOOK_ALREADY_LOANED` | 409 | "이미 대여 중인 도서입니다." | 도서가 이미 대여 중 |
| `BOOK_RESERVED_BY_OTHER` | 409 | "다른 회원이 예약한 도서입니다." | 예약 우선권이 다른 회원에게 있음 |
| `BOOK_NOT_AVAILABLE` | 409 | "대여 가능하지 않은 도서입니다." | 분실, 훼손 등으로 대여 불가 |

#### 회원 관련 (MEMBER_*)

| 코드 | HTTP 상태 | 메시지 | 설명 |
|-----|----------|--------|------|
| `MEMBER_NOT_FOUND` | 404 | "존재하지 않는 회원입니다." | 요청한 memberId가 존재하지 않음 |
| `MEMBER_ACCOUNT_SUSPENDED` | 403 | "정지된 계정입니다. 관리자에게 문의하세요." | 회원 계정이 정지 상태 |
| `MEMBER_HAS_OVERDUE` | 409 | "연체 중인 도서가 있습니다. 먼저 반납해주세요." | 연체 중인 대출이 있어 신규 대출 불가 |
| `MEMBER_UNPAID_FEES` | 409 | "미납된 연체료가 있습니다. (금액: {amount}원)" | 미납 연체료가 있어 대출 불가 |

#### 대출 관련 (LOAN_*)

| 코드 | HTTP 상태 | 메시지 | 설명 |
|-----|----------|--------|------|
| `LOAN_NOT_FOUND` | 404 | "존재하지 않는 대출 기록입니다." | 요청한 loanId가 존재하지 않음 |
| `LOAN_LIMIT_EXCEEDED` | 409 | "대여 가능 권수를 초과했습니다. (현재: {current}/{max})" | 등급별 최대 대출 권수 초과 |
| `DUPLICATE_LOAN` | 409 | "이미 대여 중인 도서입니다." | 동일 회원이 동일 도서를 이미 대여 중 |
| `ALREADY_RETURNED` | 409 | "이미 반납된 도서입니다." | 이미 반납 처리된 대출 |
| `CANNOT_MODIFY_RETURNED_LOAN` | 409 | "반납 완료된 대출은 수정할 수 없습니다." | RETURNED 상태의 대출 수정 시도 |

#### 연장 관련 (EXTENSION_*)

| 코드 | HTTP 상태 | 메시지 | 설명 |
|-----|----------|--------|------|
| `EXTENSION_LIMIT_EXCEEDED` | 409 | "연장 가능 횟수를 초과했습니다. (최대: {max}회)" | 등급별 연장 가능 횟수 초과 |
| `EXTENSION_TOO_EARLY` | 409 | "반납 예정일 3일 전부터 연장 가능합니다." | 연장 가능 시기 이전에 요청 |
| `CANNOT_EXTEND_OVERDUE` | 409 | "연체 중인 도서는 연장할 수 없습니다." | OVERDUE 상태에서 연장 시도 |
| `CANNOT_EXTEND_RESERVED_BOOK` | 409 | "예약이 있는 도서는 연장할 수 없습니다." | 예약 대기 중인 도서 연장 시도 |

#### 권한 관련 (AUTH_*)

| 코드 | HTTP 상태 | 메시지 | 설명 |
|-----|----------|--------|------|
| `UNAUTHORIZED` | 401 | "인증이 필요합니다." | 인증 토큰이 없거나 유효하지 않음 |
| `FORBIDDEN` | 403 | "해당 작업을 수행할 권한이 없습니다." | 권한 부족 |
| `TOKEN_EXPIRED` | 401 | "인증 토큰이 만료되었습니다. 다시 로그인해주세요." | JWT 토큰 만료 |

#### 유효성 검증 (VALIDATION_*)

| 코드 | HTTP 상태 | 메시지 | 설명 |
|-----|----------|--------|------|
| `INVALID_DATE_RANGE` | 400 | "반납 예정일은 대출일보다 이후여야 합니다." | 잘못된 날짜 범위 |
| `INVALID_DUE_DATE` | 400 | "반납 예정일은 현재 시간보다 이후여야 합니다." | 과거 날짜로 설정 시도 |
| `REQUIRED_FIELD_MISSING` | 400 | "필수 항목이 누락되었습니다: {fieldName}" | 필수 필드 누락 |
| `INVALID_STATUS_TRANSITION` | 400 | "허용되지 않은 상태 전이입니다. ({from} → {to})" | 잘못된 상태 변경 |

---

## 💡 성공 응답 메시지

### 대출 생성 성공
```json
{
  "message": "도서가 성공적으로 대출되었습니다.",
  "loan": { /* Loan 객체 */ },
  "notification": "반납 예정일은 {dueDate}입니다. 연장은 반납 3일 전부터 가능합니다."
}
```

### 반납 성공
```json
{
  "message": "도서가 정상 반납되었습니다. 이용해주셔서 감사합니다.",
  "loan": { /* Loan 객체 */ },
  "overdueFee": 0
}
```

### 연체 반납 성공
```json
{
  "message": "도서가 반납되었습니다.",
  "loan": { /* Loan 객체 */ },
  "overdueFee": 3500,
  "overdueDays": 7,
  "notification": "연체료 3,500원이 부과되었습니다. 마이페이지에서 결제해주세요."
}
```

### 연장 성공
```json
{
  "message": "대여 기간이 연장되었습니다.",
  "loan": { /* Loan 객체 */ },
  "newDueDate": "2025-11-15T11:45:00Z",
  "extensionCount": 1,
  "remainingExtensions": 2,
  "notification": "새로운 반납 예정일은 {newDueDate}입니다."
}
```

---

## 📌 추가 참고사항

### 자동화 프로세스

1. **연체 상태 자동 업데이트**
   - 매일 자정(00:00) 배치 작업 실행
   - `dueDate < 현재시간` && `status = ACTIVE` → `status = OVERDUE` 변경

2. **알림 발송**
   - 반납 3일 전: 반납 예정 알림
   - 반납 1일 전: 반납 임박 알림
   - 연체 발생: 즉시 연체 알림
   - 연체 3일/7일: 경고 알림

3. **계정 자동 정지**
   - 연체 14일 경과 시 계정 자동 정지
   - 연체료 완납 및 도서 반납 후 정지 해제 가능

### 관리자 전용 기능

- 연체료 면제/조정
- 대출 기간 강제 연장
- 정지된 계정 수동 해제
- 분실 도서 처리
- 대출 기록 삭제 (데이터 정리용)

### 통계 및 리포트

- 회원별 대출 이력
- 도서별 대출 통계
- 연체율 분석
- 인기 도서 순위
