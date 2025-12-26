# 대출(Loan) 시스템 가이드

## 📚 개요

이 문서는 도서관 관리 시스템의 대출(Loan) 기능을 화면 흐름 순서로 설명합니다. 각 화면마다 어떤 API가 호출되는지, 어떻게 테스트하는지 실습하면서 배울 수 있습니다.

**대상 독자**: 백엔드 개발자, 프론트엔드 개발자, QA 테스터, 초보 개발자

---

## 📌 기본 정보

- **Base URL**: `http://localhost:8080/api`
- **Data Format**: `application/json`
- **Authentication**: JWT Bearer Token 필요
- **관리자 경로**: `/admin/*`
- **사용자 경로**: `/client/*`

### 데이터 모델

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
  "status": "ACTIVE",
  "extensionCount": 0,
  "overdueFee": 0
}
```

**상태 (status)**:
- `ACTIVE`: 대출 중
- `OVERDUE`: 연체 중
- `RETURNED`: 반납 완료

---

## 👑 관리자 기능

### 1. 대출 목록 조회하기

관리자가 가장 먼저 보게 되는 화면입니다. 모든 회원의 대출 기록을 한눈에 볼 수 있습니다.

#### 📱 화면 흐름

Admin > Loans > 목록 (페이지 로드 시 자동 API 호출)

**페이지**: `/admin/loans`
**파일**: `src/admin/pages/loans/LoanList.tsx:22-30`

#### 🔌 API 명세

**엔드포인트**: `GET /api/admin/loans`

**Query Parameters**:

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `page` | number | 페이지 번호 (0부터 시작) | 0 |
| `size` | number | 페이지 당 항목 수 | 10 |
| `searchQuery` | string | 도서명, 회원명, 이메일 검색 | - |
| `statusFilter` | string | ACTIVE, OVERDUE, RETURNED, all | all |
| `sortKey` | string | loanDate, dueDate, bookTitle | loanDate |
| `sortOrder` | string | asc, desc | desc |

#### 💻 curl 예제

```bash
# 기본 조회 (첫 페이지, 10개)
curl -X GET "http://localhost:8080/api/admin/loans" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 검색: "James"라는 이름이 포함된 대출
curl -X GET "http://localhost:8080/api/admin/loans?searchQuery=James" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 연체 대출만 조회
curl -X GET "http://localhost:8080/api/admin/loans?statusFilter=OVERDUE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 반납일 기준 오름차순 정렬
curl -X GET "http://localhost:8080/api/admin/loans?sortKey=dueDate&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### ✅ 성공 응답 (200 OK)

```json
{
  "content": [
    {
      "id": 1,
      "bookTitle": "The Silent Patient",
      "bookAuthor": "Alex Michaelides",
      "memberName": "James Wilson",
      "memberEmail": "james.wilson@email.com",
      "loanDate": "2025-10-02T11:45:00Z",
      "dueDate": "2025-10-16T11:45:00Z",
      "status": "ACTIVE"
    }
  ],
  "totalPages": 5,
  "totalElements": 50,
  "number": 0,
  "size": 10
}
```

#### 📂 관련 코드

- **페이지**: `src/admin/pages/loans/LoanList.tsx`
- **API 호출**: `getLoans()` 함수 (`mockLoanApi.ts:39-81`)
- **렌더링**: `LoanList.tsx:254-289` (테이블)

---

### 2. 대출 생성하기

관리자가 오프라인 요청을 받아 새로운 대출을 등록합니다.

#### 📱 화면 흐름

Admin > Loans > 목록 > New Loan 버튼 > 회원/도서 선택 > Create Loan (성공 시 목록으로 이동)

**페이지**: `/admin/loans/add`
**파일**: `src/admin/pages/loans/LoanAdd.tsx:25-51`

#### 🔌 API 명세

**엔드포인트**: `POST /api/admin/loans`

**Request Body**:

```json
{
  "memberId": 4,
  "bookId": 15,
  "loanDate": "2025-10-02T11:45:00Z",
  "dueDate": "2025-10-16T11:45:00Z"
}
```

**비즈니스 로직**:
- 서버는 `bookId`로 도서 정보 조회 후 `bookTitle`, `bookAuthor` 자동 설정
- 서버는 `memberId`로 회원 정보 조회 후 `memberName`, `memberEmail` 자동 설정
- 도서의 `available` 상태를 `false`로 변경
- 초기 상태는 `ACTIVE`

#### 💻 curl 예제

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

#### ✅ 성공 응답 (201 Created)

```json
{
  "id": 21,
  "bookId": 15,
  "bookTitle": "The Silent Patient",
  "bookAuthor": "Alex Michaelides",
  "memberId": 4,
  "memberName": "James Wilson",
  "memberEmail": "james.wilson@email.com",
  "loanDate": "2025-10-02T11:45:00Z",
  "dueDate": "2025-10-16T11:45:00Z",
  "returnDate": null,
  "status": "ACTIVE",
  "extensionCount": 0
}
```

**화면 동작**:
- 성공 메시지: "도서가 성공적으로 대출되었습니다."
- 자동 이동: `/admin/loans` (대출 목록)

#### ❌ 실패 응답

**1) 도서가 이미 대출 중인 경우** (409 Conflict)

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
    "currentLoanId": 18,
    "expectedReturnDate": "2025-10-20T11:45:00Z"
  }
}
```

**화면 동작**: alert("이미 대여 중인 도서입니다.")

**2) 회원이 대출 권수 초과** (409 Conflict)

```json
{
  "status": 409,
  "code": "LOAN_LIMIT_EXCEEDED",
  "message": "대여 가능 권수를 초과했습니다. (현재: 3/3)",
  "details": {
    "memberId": 4,
    "memberGrade": "BASIC",
    "currentLoans": 3,
    "maxLoans": 3
  }
}
```

**화면 동작**: alert("대여 가능 권수를 초과했습니다. (현재: 3/3)")

**3) 회원에게 연체 중인 대출이 있는 경우** (409 Conflict)

```json
{
  "status": 409,
  "code": "MEMBER_HAS_OVERDUE",
  "message": "연체 중인 도서가 있습니다. 먼저 반납해주세요.",
  "details": {
    "memberId": 4,
    "overdueLoans": [
      {
        "loanId": 12,
        "bookTitle": "Circe",
        "dueDate": "2025-10-02T11:20:00Z",
        "overdueDays": 13
      }
    ]
  }
}
```

**화면 동작**: alert("연체 중인 도서가 있습니다. 먼저 반납해주세요.")

#### 📂 관련 코드

- **UI**: `src/admin/pages/loans/LoanAdd.tsx:25-51` (handleSubmit)
- **API 호출**: `createLoan()` (`mockLoanApi.ts:94-106`)
- **회원 선택 모달**: `LoanAdd.tsx:159-177`
- **도서 선택 모달**: `LoanAdd.tsx:179-197`

---

### 3. 대출 상세 조회하기

특정 대출의 모든 정보를 확인하고 관리합니다.

#### 📱 화면 흐름

Admin > Loans > 목록 > 대출 항목 클릭 > 대출 상세

**페이지**: `/admin/loans/:id`
**파일**: `src/admin/pages/loans/LoanDetail.tsx:15-24`

#### 🔌 API 명세

**엔드포인트**: `GET /api/admin/loans/{id}`

**Path Parameters**:
- `id`: 대출 ID (number)

#### 💻 curl 예제

```bash
curl -X GET "http://localhost:8080/api/admin/loans/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### ✅ 성공 응답 (200 OK)

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
  "status": "ACTIVE",
  "extensionCount": 0
}
```

**화면 동작**:
- 상태에 따라 액션 버튼 표시
  - `ACTIVE` / `OVERDUE`: Mark as Returned, Extend Due Date, Send Reminder
  - `RETURNED`: 모든 액션 비활성화
- 연체인 경우 경고 배너 표시

#### ❌ 실패 응답

**대출을 찾을 수 없는 경우** (404 Not Found)

```json
{
  "status": 404,
  "code": "LOAN_NOT_FOUND",
  "message": "존재하지 않는 대출 기록입니다.",
  "details": {
    "loanId": 999
  }
}
```

**화면 동작**: "Loan Not Found" 메시지 + "Back to List" 버튼

#### 📂 관련 코드

- **UI**: `src/admin/pages/loans/LoanDetail.tsx`
- **API 호출**: `getLoanById()` (`mockLoanApi.ts:86-89`)
- **연체 확인**: `isOverdue()` (`LoanDetail.tsx:77-80`)

---

### 4. 반납 처리하기

대출 중인 도서를 반납 완료 상태로 변경합니다.

#### 📱 화면 흐름

Admin > Loans > 대출 상세 > Mark as Returned 버튼 > 확인 다이얼로그 > Yes

**페이지**: `/admin/loans/:id`
**파일**: `src/admin/pages/loans/LoanDetail.tsx:35-43`

#### 🔌 API 명세

**엔드포인트**: `PATCH /api/admin/loans/{id}`

**Request Body**:

```json
{
  "status": "RETURNED"
}
```

**비즈니스 로직**:
- 서버는 `returnDate`를 현재 시간으로 자동 설정
- 도서의 `available` 상태를 `true`로 변경
- 연체인 경우 연체료 계산 (1일당 500원, 최대 10,000원)

#### 💻 curl 예제

```bash
curl -X PATCH "http://localhost:8080/api/admin/loans/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RETURNED"
  }'
```

#### ✅ 성공 응답 (200 OK)

**정상 반납 (연체 없음)**

```json
{
  "message": "도서가 정상 반납되었습니다. 이용해주셔서 감사합니다.",
  "loan": {
    "id": 1,
    "status": "RETURNED",
    "returnDate": "2025-10-15T14:30:00Z",
    "overdueFee": 0
  }
}
```

**연체 반납**

```json
{
  "message": "도서가 반납되었습니다.",
  "loan": {
    "id": 12,
    "status": "RETURNED",
    "returnDate": "2025-10-15T14:30:00Z",
    "overdueFee": 3500,
    "overdueDays": 7
  },
  "notification": "연체료 3,500원이 부과되었습니다. 마이페이지에서 결제해주세요."
}
```

**화면 동작**:
- 성공 메시지 표시
- 상태 배지 업데이트
- returnDate 표시
- 액션 버튼 숨김

#### ❌ 실패 응답

**이미 반납된 대출인 경우** (409 Conflict)

```json
{
  "status": 409,
  "code": "ALREADY_RETURNED",
  "message": "이미 반납된 도서입니다.",
  "details": {
    "loanId": 1,
    "returnDate": "2025-10-10T09:30:00Z"
  }
}
```

**화면 동작**: alert("이미 반납된 도서입니다.")

#### 📂 관련 코드

- **UI**: `src/admin/pages/loans/LoanDetail.tsx:35-43` (handleReturn)
- **API 호출**: `updateLoan()` (`mockLoanApi.ts:111-131`)

---

### 5. 반납일 연장하기

대출 기간을 연장합니다.

#### 📱 화면 흐름

Admin > Loans > 대출 상세 > Extend Due Date 버튼 > 날짜 입력 > Save Extension

**페이지**: `/admin/loans/:id`
**파일**: `src/admin/pages/loans/LoanDetail.tsx:63-75`

#### 🔌 API 명세

**엔드포인트**: `PATCH /api/admin/loans/{id}`

**Request Body**:

```json
{
  "dueDate": "2025-10-30T23:59:59Z"
}
```

**비즈니스 로직**:
- 새 반납일이 현재 시간보다 미래인 경우 `status`를 `ACTIVE`로 변경
- `extensionCount` 증가
- 회원 등급별 연장 가능 횟수 확인

#### 💻 curl 예제

```bash
curl -X PATCH "http://localhost:8080/api/admin/loans/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2025-10-30T23:59:59Z"
  }'
```

#### ✅ 성공 응답 (200 OK)

```json
{
  "message": "대여 기간이 연장되었습니다.",
  "loan": {
    "id": 1,
    "dueDate": "2025-10-30T23:59:59Z",
    "status": "ACTIVE",
    "extensionCount": 1
  },
  "newDueDate": "2025-10-30T23:59:59Z",
  "remainingExtensions": 2,
  "notification": "새로운 반납 예정일은 2025-10-30입니다."
}
```

**화면 동작**:
- 성공 메시지 표시
- dueDate 업데이트
- 연장 모드 종료

#### ❌ 실패 응답

**연장 가능 횟수 초과** (409 Conflict)

```json
{
  "status": 409,
  "code": "EXTENSION_LIMIT_EXCEEDED",
  "message": "연장 가능 횟수를 초과했습니다. (최대: 3회)",
  "details": {
    "memberGrade": "GOLD",
    "maxExtensions": 3,
    "currentExtensions": 3
  }
}
```

**화면 동작**: alert("연장 가능 횟수를 초과했습니다. (최대: 3회)")

**연장 시기가 너무 이른 경우** (409 Conflict)

```json
{
  "status": 409,
  "code": "EXTENSION_TOO_EARLY",
  "message": "반납 예정일 3일 전부터 연장 가능합니다.",
  "details": {
    "dueDate": "2025-10-20T11:45:00Z",
    "daysUntilDue": 5,
    "minDaysBeforeExtension": 3
  }
}
```

**화면 동작**: alert("반납 예정일 3일 전부터 연장 가능합니다.")

#### 📂 관련 코드

- **UI**: `src/admin/pages/loans/LoanDetail.tsx:63-75` (handleSaveExtension)
- **연장 모드**: `LoanDetail.tsx:218-244`

---

### 6. 일괄 반납 처리하기

여러 대출을 동시에 반납 처리합니다.

#### 📱 화면 흐름

Admin > Loans > 목록 > 항목 체크박스 선택 (2개 이상) > Mark as Returned 버튼

**페이지**: `/admin/loans`
**파일**: `src/admin/pages/loans/LoanList.tsx:70-83`

#### 🔌 API 명세

**엔드포인트**: `PATCH /api/admin/loans/{id}` (각 대출마다 개별 호출)

**Request Body** (각 대출마다):

```json
{
  "status": "RETURNED"
}
```

#### 💻 curl 예제

```bash
# 대출 ID 1 반납
curl -X PATCH "http://localhost:8080/api/admin/loans/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "status": "RETURNED" }'

# 대출 ID 2 반납
curl -X PATCH "http://localhost:8080/api/admin/loans/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "status": "RETURNED" }'
```

#### ✅ 성공 응답

각 요청마다 개별 응답 수신, 모두 성공 후:

**화면 동작**:
- "2개의 대출이 반납 처리되었습니다."
- 선택 해제
- 목록 새로고침

#### 📂 관련 코드

- **UI**: `src/admin/pages/loans/LoanList.tsx:70-83` (handleBulkAction)
- **선택 관리**: `LoanList.tsx:48-68`

---

## 👤 사용자 기능

### 1. 도서 대출하기

사용자가 직접 도서를 대출합니다.

#### 📱 화면 흐름

Client > Books > 도서 카드 클릭 > 도서 상세 > 대출 기간 선택 > Borrow Book 버튼

**페이지**: `/client/books/:id`
**파일**: `src/client/pages/BookDetail.tsx:32-66`

#### 🔌 API 명세

**현재 구현**: localStorage 기반 (서버 API 미연동)

**향후 API**: `POST /api/my/loans/request`

**Request Body**:

```json
{
  "bookId": 15,
  "loanPeriod": 14
}
```

**비즈니스 로직**:
- JWT 토큰에서 회원 ID 자동 추출
- `loanDate`: 현재 시간
- `dueDate`: 현재 시간 + loanPeriod일
- 도서의 `available` 상태 확인
- 회원의 대출 가능 권수 확인
- 회원의 연체 여부 확인

#### 💻 현재 동작 (localStorage)

```javascript
// BookDetail.tsx:32-66
const handleBorrowBook = () => {
  const memberId = getCurrentMemberId();
  const loanDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + parseInt(loanPeriod));

  const newLoan = addLoan({
    bookId: book.id,
    bookTitle: book.title,
    bookAuthor: book.author,
    memberId: member.id,
    memberName: member.name,
    memberEmail: member.email,
    loanDate: loanDate.toISOString(),
    dueDate: dueDate.toISOString(),
    status: "ACTIVE",
  });

  // 성공 시 My Loans로 이동
  navigate("/client/my-loans");
}
```

#### ✅ 성공 응답 (201 Created - 향후)

```json
{
  "id": 25,
  "bookId": 15,
  "bookTitle": "The Silent Patient",
  "bookAuthor": "Alex Michaelides",
  "memberId": 4,
  "memberName": "James Wilson",
  "memberEmail": "james.wilson@email.com",
  "loanDate": "2025-10-15T10:00:00Z",
  "dueDate": "2025-10-29T10:00:00Z",
  "status": "ACTIVE",
  "extensionCount": 0,
  "message": "Successfully borrowed \"The Silent Patient\" for 14 days!"
}
```

**화면 동작**:
- 성공 메시지 표시
- "View your loans?" 확인 다이얼로그
- Yes 클릭 시 `/client/my-loans`로 이동

#### ❌ 실패 응답 (향후)

**도서가 대출 불가능한 경우** (409 Conflict)

```json
{
  "status": 409,
  "code": "BOOK_NOT_AVAILABLE",
  "message": "이 도서는 현재 대여할 수 없습니다.",
  "details": {
    "bookId": 15,
    "available": false
  }
}
```

**대출 권수 초과** (409 Conflict)

```json
{
  "status": 409,
  "code": "LOAN_LIMIT_EXCEEDED",
  "message": "대여 가능 권수를 초과했습니다. (현재: 3/3)",
  "details": {
    "memberGrade": "BASIC",
    "currentLoans": 3,
    "maxLoans": 3
  }
}
```

**연체 중인 도서가 있는 경우** (409 Conflict)

```json
{
  "status": 409,
  "code": "MEMBER_HAS_OVERDUE",
  "message": "연체 중인 도서가 있습니다. 먼저 반납해주세요.",
  "details": {
    "overdueLoans": [
      {
        "loanId": 12,
        "bookTitle": "Circe",
        "overdueDays": 13
      }
    ]
  }
}
```

**로그인하지 않은 경우**

```javascript
// 현재 구현 (localStorage)
if (!member) {
  alert("Please log in to borrow books");
  return;
}
```

#### 📂 관련 코드

- **UI**: `src/client/pages/BookDetail.tsx:32-66` (handleBorrowBook)
- **도서 목록**: `src/client/pages/BookList.tsx`
- **Storage**: `addLoan()` (`loanStorage.ts`)

---

### 2. 내 대출 조회하기

사용자가 자신의 대출 기록을 확인합니다.

#### 📱 화면 흐름

Client > My Loans (헤더 메뉴에서 클릭, 페이지 로드 시 자동 API 호출)

**페이지**: `/client/my-loans`
**파일**: `src/client/pages/MyLoans.tsx:14-16`

#### 🔌 API 명세

**엔드포인트**: `GET /api/my/loans`

**Query Parameters**:

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `statusFilter` | string | ACTIVE, OVERDUE, RETURNED, ALL | ALL |

**인증**: JWT 토큰에서 회원 ID 자동 추출

#### 💻 curl 예제

```bash
# 내 모든 대출 조회
curl -X GET "http://localhost:8080/api/my/loans" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 대출 중인 도서만 조회
curl -X GET "http://localhost:8080/api/my/loans?statusFilter=ACTIVE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 연체 중인 도서만 조회
curl -X GET "http://localhost:8080/api/my/loans?statusFilter=OVERDUE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### ✅ 성공 응답 (200 OK)

```json
[
  {
    "id": 20,
    "bookId": 1,
    "bookTitle": "Atomic Habits",
    "bookAuthor": "James Clear",
    "loanDate": "2025-10-05T10:00:00Z",
    "dueDate": "2025-10-19T10:00:00Z",
    "status": "ACTIVE"
  },
  {
    "id": 12,
    "bookId": 7,
    "bookTitle": "Circe",
    "bookAuthor": "Madeline Miller",
    "loanDate": "2025-09-18T11:20:00Z",
    "dueDate": "2025-10-02T11:20:00Z",
    "status": "OVERDUE",
    "overdueDays": 13,
    "overdueFee": 6500
  }
]
```

**화면 동작**:
- 대출 목록 렌더링
- 통계 카드 업데이트 (Total, Active, Overdue, Returned)
- 상태별 필터 버튼

#### 📂 관련 코드

- **UI**: `src/client/pages/MyLoans.tsx`
- **API 호출**: `getUserLoans()` (`loanStorage.ts`)
- **통계 계산**: `MyLoans.tsx:34-41`

---

### 3. 도서 검색하기

사용자가 도서를 검색합니다.

#### 📱 화면 흐름

Client > Books > 검색창에 키워드 입력 (제목/저자/ISBN)

**페이지**: `/client/books`
**파일**: `src/client/pages/BookList.tsx:26-33`

#### 💻 현재 동작 (클라이언트 필터링)

```javascript
// BookList.tsx:45-53
const filteredBooks = (booksData as Book[]).filter((book) => {
  if (!searchQuery) return true;
  const query = searchQuery.toLowerCase();
  return (
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.isbn.includes(query)
  );
});
```

**Query Parameters**:
- `search`: 검색 키워드
- `page`: 페이지 번호

**향후 API**: `GET /api/books?search={keyword}&page={page}&size={size}`

#### 📂 관련 코드

- **UI**: `src/client/pages/BookList.tsx:26-33` (handleSearch)
- **필터링**: `BookList.tsx:45-53`
- **페이지네이션**: `BookList.tsx:55-57`

---

### 4. 반납 신청하기

사용자가 직접 도서 반납을 신청합니다.

#### 📱 화면 흐름

Client > My Loans > 대출 카드 > Return Book 버튼 > 확인 다이얼로그 > Yes

**페이지**: `/client/my-loans`
**파일**: `src/client/pages/MyLoans.tsx:43-62`

#### 🔌 API 명세

**엔드포인트**: `POST /api/my/loans/{id}/return`

**Path Parameters**:
- `id`: 대출 ID (number)

**Request Body**: 없음

**비즈니스 로직**:
- 서버는 JWT 토큰으로 회원 ID 확인
- 해당 대출이 요청자의 것인지 검증
- `status`를 `RETURNED`로 변경
- `returnDate`를 현재 시간으로 설정
- 연체인 경우 연체료 계산

#### 💻 curl 예제

```bash
curl -X POST "http://localhost:8080/api/my/loans/20/return" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### ✅ 성공 응답 (200 OK)

**정상 반납**

```json
{
  "message": "도서가 정상 반납되었습니다. 이용해주셔서 감사합니다.",
  "loan": {
    "id": 20,
    "status": "RETURNED",
    "returnDate": "2025-10-15T14:30:00Z",
    "overdueFee": 0
  }
}
```

**연체 반납**

```json
{
  "message": "도서가 반납되었습니다.",
  "loan": {
    "id": 12,
    "status": "RETURNED",
    "returnDate": "2025-10-15T14:30:00Z",
    "overdueFee": 3500,
    "overdueDays": 7
  },
  "notification": "연체료 3,500원이 부과되었습니다. 마이페이지에서 결제해주세요."
}
```

**화면 동작**:
- 성공 메시지 표시
- localStorage 업데이트
- 목록 새로고침
- 통계 카드 업데이트

#### ❌ 실패 응답

**권한 없음 (다른 사람의 대출)** (403 Forbidden)

```json
{
  "status": 403,
  "code": "FORBIDDEN",
  "message": "해당 대출 기록에 접근할 권한이 없습니다.",
  "details": {
    "loanId": 20,
    "requestedBy": 5,
    "ownedBy": 1
  }
}
```

**화면 동작**: alert("해당 대출 기록에 접근할 권한이 없습니다.")

#### 📂 관련 코드

- **UI**: `src/client/pages/MyLoans.tsx:43-62` (handleReturnBook)
- **Storage**: `returnBook()` (`loanStorage.ts`)

---

### 5. 대출 이력 삭제하기

반납 완료된 대출 기록을 삭제합니다.

#### 📱 화면 흐름

Client > My Loans > RETURNED 필터 > 대출 카드 > Delete 버튼 > 확인 다이얼로그 > Yes

**페이지**: `/client/my-loans`
**파일**: `src/client/pages/MyLoans.tsx:64-83`

#### 🔌 API 명세

**엔드포인트**: `DELETE /api/my/loans/{id}`

**Path Parameters**:
- `id`: 대출 ID (number)

**제약 조건**:
- `RETURNED` 상태인 대출만 삭제 가능

#### 💻 curl 예제

```bash
curl -X DELETE "http://localhost:8080/api/my/loans/13" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### ✅ 성공 응답 (204 No Content)

본문 없음

**화면 동작**:
- "대출 이력이 삭제되었습니다."
- 해당 카드 제거
- 통계 카드 업데이트

#### ❌ 실패 응답

**반납되지 않은 대출 삭제 시도** (409 Conflict)

```json
{
  "status": 409,
  "code": "CANNOT_DELETE_ACTIVE_LOAN",
  "message": "반납 완료된 대출만 삭제할 수 있습니다.",
  "details": {
    "loanId": 20,
    "currentStatus": "ACTIVE"
  }
}
```

**화면 동작**: alert("반납 완료된 대출만 삭제할 수 있습니다.")

#### 📂 관련 코드

- **UI**: `src/client/pages/MyLoans.tsx:64-83` (handleDeleteLoan)
- **Storage**: `deleteLoan()` (`loanStorage.ts`)

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

**대여 가능 조건**:
- 책이 대여 가능한 상태 (`available: true`)
- 회원의 현재 대여 중인 책 수 < 등급별 최대 권수
- 회원에게 연체 중인 책이 없음
- 회원 계정이 정지 상태가 아님

**연체 처리**:
- 반납 예정일(`dueDate`) 경과 시 자동으로 `OVERDUE` 상태로 변경
- 연체 중인 회원은 새로운 대출 불가
- 연체료: **1일당 500원** (최대 10,000원)

**대여 연장**:
- 반납 예정일 **3일 전부터** 연장 신청 가능
- 등급별 연장 가능 횟수 제한
- 다른 회원의 예약이 있는 경우 연장 불가

---

## ⚠️ 예외 처리 및 에러 메시지

### HTTP 상태 코드

| 코드 | 설명 | 사용 예시 |
|------|------|----------|
| 200 | OK | 조회, 수정 성공 |
| 201 | Created | 대출 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | 잘못된 요청 데이터 |
| 401 | Unauthorized | 인증 토큰 없음/만료 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 409 | Conflict | 비즈니스 규칙 위반 |
| 422 | Unprocessable Entity | 유효성 검증 실패 |

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

### 주요 에러 코드

#### 도서 관련 (BOOK_*)

- `BOOK_NOT_FOUND`: 존재하지 않는 도서입니다.
- `BOOK_ALREADY_LOANED`: 이미 대여 중인 도서입니다.
- `BOOK_RESERVED_BY_OTHER`: 다른 회원이 예약한 도서입니다.
- `BOOK_NOT_AVAILABLE`: 대여 가능하지 않은 도서입니다.

#### 회원 관련 (MEMBER_*)

- `MEMBER_NOT_FOUND`: 존재하지 않는 회원입니다.
- `MEMBER_ACCOUNT_SUSPENDED`: 정지된 계정입니다. 관리자에게 문의하세요.
- `MEMBER_HAS_OVERDUE`: 연체 중인 도서가 있습니다. 먼저 반납해주세요.
- `MEMBER_UNPAID_FEES`: 미납된 연체료가 있습니다.

#### 대출 관련 (LOAN_*)

- `LOAN_NOT_FOUND`: 존재하지 않는 대출 기록입니다.
- `LOAN_LIMIT_EXCEEDED`: 대여 가능 권수를 초과했습니다.
- `DUPLICATE_LOAN`: 이미 대여 중인 도서입니다.
- `ALREADY_RETURNED`: 이미 반납된 도서입니다.

#### 연장 관련 (EXTENSION_*)

- `EXTENSION_LIMIT_EXCEEDED`: 연장 가능 횟수를 초과했습니다.
- `EXTENSION_TOO_EARLY`: 반납 예정일 3일 전부터 연장 가능합니다.
- `CANNOT_EXTEND_OVERDUE`: 연체 중인 도서는 연장할 수 없습니다.
- `CANNOT_EXTEND_RESERVED_BOOK`: 예약이 있는 도서는 연장할 수 없습니다.

---

## 🚀 향후 구현 필요 기능

### 1. 사용자 대출 신청 서버 API 연동

**현재**: localStorage 기반으로 동작 (클라이언트에서만 저장)
**필요**: 서버 API 연동으로 실제 백엔드에 대출 요청

```bash
# 화면: /client/books/{id} > "Borrow Book" 버튼 (이미 구현됨)
# API만 연동 필요
curl -X POST "http://localhost:8080/api/my/loans/request" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "bookId": 15, "loanPeriod": 14 }'
```

### 2. 리마인더 이메일 발송 API

**현재**: 버튼만 있고 실제 API 미연동

```bash
# 화면: /admin/loans/{id} > "Send Reminder Email" 버튼
curl -X POST "http://localhost:8080/api/admin/loans/1/reminder" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 예약 기능 API

**비즈니스 규칙에 정의되어 있으나 UI/API 모두 미구현**

```bash
# 화면: /client/books/{id} > "Reserve" 버튼 (available=false일 때)
curl -X POST "http://localhost:8080/api/my/reservations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "bookId": 15 }'
```

### 4. 연체료 결제 API

**비즈니스 규칙에 정의되어 있으나 UI/API 모두 미구현**

```bash
# 화면: /client/account > 미납 연체료 표시 및 결제 버튼
curl -X GET "http://localhost:8080/api/my/fees" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X POST "http://localhost:8080/api/my/fees/1/pay" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📂 코드 참조

### 타입 정의
- **Loan 타입**: `src/shared/types/index.ts:107-122`
- **Member 타입**: `src/shared/types/index.ts:5-13`

### Mock API
- **Mock 함수**: `src/shared/utils/mockLoanApi.ts`
- **Storage**: `src/client/utils/loanStorage.ts`

### UI 컴포넌트
- **관리자 목록**: `src/admin/pages/loans/LoanList.tsx`
- **관리자 생성**: `src/admin/pages/loans/LoanAdd.tsx`
- **관리자 상세**: `src/admin/pages/loans/LoanDetail.tsx`
- **사용자 목록**: `src/client/pages/MyLoans.tsx`

### 초기 데이터
- **대출 데이터**: `src/shared/data/loans.json` (20개)
- **회원 데이터**: `src/shared/data/members.json` (5명, 등급 포함)

---

## 💡 학습 가이드

### 1단계: 기본 조회부터 시작

```bash
# 1. 대출 목록 조회 (가장 기본)
curl -X GET "http://localhost:8080/api/admin/loans"

# 2. 특정 대출 조회
curl -X GET "http://localhost:8080/api/admin/loans/1"

# 3. 내 대출 조회 (사용자)
curl -X GET "http://localhost:8080/api/my/loans"
```

### 2단계: 검색/필터 실습

```bash
# 검색
curl -X GET "http://localhost:8080/api/admin/loans?searchQuery=James"

# 필터
curl -X GET "http://localhost:8080/api/admin/loans?statusFilter=OVERDUE"

# 정렬
curl -X GET "http://localhost:8080/api/admin/loans?sortKey=dueDate&sortOrder=asc"
```

### 3단계: 생성/수정 실습

```bash
# 대출 생성
curl -X POST "http://localhost:8080/api/admin/loans" \
  -d '{ "memberId": 4, "bookId": 15, ... }'

# 반납 처리
curl -X PATCH "http://localhost:8080/api/admin/loans/1" \
  -d '{ "status": "RETURNED" }'

# 연장
curl -X PATCH "http://localhost:8080/api/admin/loans/1" \
  -d '{ "dueDate": "2025-10-30T23:59:59Z" }'
```

### 4단계: 에러 케이스 테스트

```bash
# 이미 대출 중인 도서 대출 시도 (409 에러 발생)
curl -X POST "http://localhost:8080/api/admin/loans" \
  -d '{ "memberId": 4, "bookId": 1, ... }'

# 이미 반납된 대출 재반납 시도 (409 에러 발생)
curl -X PATCH "http://localhost:8080/api/admin/loans/14" \
  -d '{ "status": "RETURNED" }'
```

---

**이 문서를 화면 순서대로 따라가면서 실습하면 대출 시스템 전체를 이해할 수 있습니다!** 🎓
