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

**응답 (200 OK):** 수정된 `Loan` 객체 전체

### 5. 대출 기록 삭제

- **DELETE** `/api/admin/loans/{id}`

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

**응답 (200 OK):** `status`가 `RETURNED`로 변경된 `Loan` 객체

---

## ⚠️ 오류 응답

- **400 Bad Request**: 요청 데이터가 유효하지 않음 (예: 필수 필드 누락)
- **401 Unauthorized**: 인증되지 않은 요청
- **403 Forbidden**: 해당 작업을 수행할 권한이 없음 (예: 일반 사용자가 관리자 API 호출)
- **404 Not Found**: 요청한 리소스(Loan, Member, Book)를 찾을 수 없음
- **409 Conflict**: 비즈니스 로직 충돌 (예: 이미 대출 중인 도서에 대한 신규 대출 요청)
