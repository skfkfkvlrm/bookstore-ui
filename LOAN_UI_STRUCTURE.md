# 대출(Loan) UI 구조 문서

## 📋 개요

이 문서는 도서관 관리 시스템의 대출(Loan) 관련 UI 구조를 정리합니다. 네비게이션, 화면, 이벤트 처리 로직을 포함하며, 관리자(Admin)와 사용자(Client) 두 가지 관점으로 구분됩니다.

---

## 🗺️ 네비게이션 구조

### 관리자 (Admin) 네비게이션

**경로**: `/admin`

**사이드바 메뉴** (`src/admin/layout/Sidebar.tsx:3-10`):
```typescript
[
  { to: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/admin/members", icon: "group", label: "Members" },
  { to: "/admin/books", icon: "menu_book", label: "Books" },
  { to: "/admin/loans", icon: "library_books", label: "Loans" },      // 대출 관리 메뉴
  { to: "/admin/orders", icon: "receipt_long", label: "Orders" },
  { to: "/admin/settings", icon: "settings", label: "Settings" }
]
```

**대출 관련 라우트** (`src/admin/AdminApp.tsx:36-38`):
- `/admin/loans` - 대출 목록
- `/admin/loans/add` - 신규 대출 생성
- `/admin/loans/:id` - 대출 상세 조회/수정

### 사용자 (Client) 네비게이션

**경로**: `/client`

**헤더 메뉴** (`src/client/layout/Header.tsx:70-101`):
```typescript
[
  { to: "/client", label: "Home" },
  { to: "/client/books", label: "Books" },
  { to: "/client/my-loans", label: "My Loans" },                     // 내 대출 메뉴
  { to: "/client/cart", label: "Cart" },
  { to: "/client/orders", label: "Orders" }
]
```

**사용자 드롭다운 메뉴** (`src/client/layout/Header.tsx:163-186`):
- My Account
- **My Loans** - 내 대출 관리
- My Orders

**대출 관련 라우트** (`src/client/ClientApp.tsx:26-33`):
- `/client/my-loans` - 내 대출 목록 (인증 필요)

---

## 🖥️ 화면(페이지) 구조

### 1. 관리자 - 대출 목록 (`/admin/loans`)

**파일**: `src/admin/pages/loans/LoanList.tsx`

**주요 기능**:
- 전체 대출 목록 조회 및 관리
- 검색, 필터링, 정렬, 페이징
- 일괄 작업 (반납 처리, 내보내기)
- 대출 상세 조회로 이동

**UI 구성요소**:

1. **헤더 섹션** (163-174):
   - 제목: "Loan Management"
   - 설명: "Manage book loans and returns"
   - 버튼: "New Loan" → `/admin/loans/add`

2. **선택 항목 액션 바** (176-198):
   - 선택된 대출 개수 표시
   - Export 버튼
   - Mark as Returned 버튼 (일괄 반납)

3. **검색 및 필터 영역** (200-252):
   - **검색**: 도서명, 회원명으로 검색
   - **상태 필터**: All Status, Active, Returned, Overdue
   - **정렬**: Loan Date, Due Date, Book Title
   - **정렬 순서**: 오름차순/내림차순

4. **대출 테이블** (254-289):
   | 컬럼 | 설명 |
   |------|------|
   | 체크박스 | 일괄 선택 |
   | Book | 도서 제목 + 저자 (클릭 시 대출 상세) |
   | Member | 회원 이름 + 이메일 (클릭 시 회원 상세) |
   | Loan Date | 대출일 |
   | Due Date | 반납 예정일 |
   | Return Date | 반납일 (미반납 시 "-") |
   | Status | 상태 배지 (ACTIVE, RETURNED, OVERDUE) |

5. **페이지네이션** (291-297):
   - 페이지 당 10개 항목
   - 총 페이지 수 표시
   - 페이지 변경 시 스크롤 최상단 이동

**상태 관리**:
```typescript
const [allLoans, setAllLoans] = useState<Loan[]>([]);
const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [searchQuery, setSearchQuery] = useState("");
const [sortBy, setSortBy] = useState<keyof Loan>("loanDate");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
const [statusFilter, setStatusFilter] = useState<"all" | Loan["status"]>("all");
```

---

### 2. 관리자 - 신규 대출 생성 (`/admin/loans/add`)

**파일**: `src/admin/pages/loans/LoanAdd.tsx`

**주요 기능**:
- 회원 선택
- 대여 가능한 도서 선택
- 대출일/반납일 설정
- 신규 대출 생성

**UI 구성요소**:

1. **헤더 섹션** (56-61):
   - 제목: "New Loan"
   - 설명: "Select a member and a book to register a new loan"

2. **회원 선택 영역** (66-82):
   - 선택 전: Placeholder 카드 + "Select Member" 버튼
   - 선택 후: 회원 정보 카드 (이름, 이메일) + "Change" 버튼

3. **도서 선택 영역** (84-111):
   - 선택 전: Placeholder 카드 + "Select Book" 버튼
   - 선택 후: 도서 정보 카드 (제목, 저자, Available/On Loan 배지) + "Change" 버튼
   - **필터**: 대여 가능한 도서만 표시 (186)

4. **대출 확인 영역** (114-144):
   - **Loan Date**: 날짜 선택 (기본값: 오늘)
   - **Due Date**: 날짜 선택 (기본값: 대출일 + 14일, 자동 계산)

5. **액션 버튼** (146-154):
   - Cancel → `/admin/loans`
   - Create Loan (회원/도서 선택 전 비활성화)

6. **검색 모달** (159-311):
   - **회원 검색**: 이름, 이메일로 검색
   - **도서 검색**: 제목, 저자, ISBN으로 검색
   - 하단 링크: "Register New Member" / "Register New Book"

**상태 관리**:
```typescript
const [selectedMember, setSelectedMember] = useState<Member | null>(null);
const [selectedBook, setSelectedBook] = useState<Book | null>(null);
const [isMemberModalOpen, setMemberModalOpen] = useState(false);
const [isBookModalOpen, setBookModalOpen] = useState(false);
const [loanDate, setLoanDate] = useState(new Date());
const [dueDate, setDueDate] = useState(addDays(new Date(), 14));
```

---

### 3. 관리자 - 대출 상세 (`/admin/loans/:id`)

**파일**: `src/admin/pages/loans/LoanDetail.tsx`

**주요 기능**:
- 대출 상세 정보 조회
- 반납 처리
- 반납일 연장
- 리마인더 이메일 발송

**UI 구성요소**:

1. **헤더 섹션** (112-119):
   - 제목: "Loan Details"
   - Loan ID 표시 (6자리 패딩)

2. **연체 경고 배너** (121-133):
   - OVERDUE 상태이고 미반납일 경우 표시
   - 연체 일수 표시
   - 경고 아이콘 + 빨간색 배경

3. **대출 정보 카드** (135-214):
   - **상태 배지**: ACTIVE, RETURNED, OVERDUE

   **도서 정보**:
   - Title (제목)
   - Author (저자)
   - Book ID

   **회원 정보**:
   - Name (이름)
   - Email (이메일)
   - Member ID

   **대출 날짜**:
   - Loan Date (대출일)
   - Due Date (반납 예정일)
   - Return Date (반납일, 미반납 시 "-")

4. **액션 영역** (216-278):

   **연장 모드 OFF** (246-277):
   - **ACTIVE/OVERDUE 상태**:
     - "Mark as Returned" 버튼 (초록색)
     - "Send Reminder Email" 버튼
     - "Extend Due Date" 버튼
   - **RETURNED 상태**:
     - 안내 메시지: "This loan has been returned. No further actions are available."

   **연장 모드 ON** (218-244):
   - New Due Date 날짜 입력
   - "Save Extension" 버튼
   - "Cancel" 버튼

5. **하단 버튼** (280-285):
   - "Back to List" → `/admin/loans`

**상태 관리**:
```typescript
const [loan, setLoan] = useState<Loan | null>(null);
const [isExtending, setIsExtending] = useState(false);
const [newDueDate, setNewDueDate] = useState("");
```

**Helper 함수**:
- `isOverdue()`: 연체 여부 확인
- `daysUntilDue()`: 반납 예정일까지 남은 일수 계산

---

### 4. 사용자 - 내 대출 목록 (`/client/my-loans`)

**파일**: `src/client/pages/MyLoans.tsx`

**주요 기능**:
- 내 대출 목록 조회
- 상태별 필터링
- 반납 신청
- 대출 이력 삭제

**UI 구성요소**:

1. **헤더 섹션** (129-134):
   - 제목: "My Loans"
   - 설명: "View and manage your borrowed books"

2. **통계 카드** (137-154):
   | 항목 | 설명 |
   |------|------|
   | Total Loans | 전체 대출 수 |
   | Active | 대출 중 (초록색) |
   | Overdue | 연체 중 (빨간색) |
   | Returned | 반납 완료 (회색) |

3. **필터 버튼** (157-198):
   - All (전체)
   - Active (대출 중)
   - Overdue (연체 중)
   - Returned (반납 완료)
   - 각 버튼에 개수 표시

4. **대출 카드 목록** (220-350):

   **카드 구성** (각 대출):
   - **도서 정보**:
     - 제목 (클릭 시 도서 상세 페이지 이동)
     - 저자
   - **상태 배지**: Active, Overdue, Returned
   - **날짜 정보**:
     - Loan Date (대출일)
     - Due Date (반납 예정일)
     - Return Date (반납일, RETURNED인 경우)
     - Days Remaining (남은 일수, ACTIVE/OVERDUE인 경우)
       - 연체: "X days overdue" (빨간색)
       - 3일 이하: 주황색
       - 4일 이상: 기본색

   **액션 버튼**:
   - **ACTIVE**: "Return Book" (파란색)
   - **OVERDUE**: "Return Now" (빨간색)
   - **RETURNED**: "Delete" (회색)

5. **빈 상태** (201-218):
   - 아이콘 + 메시지
   - "Browse Books" 버튼 → `/client/books`

**상태 관리**:
```typescript
const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
const [userLoans, setUserLoans] = useState<Loan[]>([]);
```

**데이터 처리**:
- localStorage의 대출 + JSON 파일의 대출 병합
- 중복 방지 (localStorage 우선)
- 현재 로그인 회원의 대출만 필터링

---

## 🎯 이벤트 처리 로직

### 관리자 - 대출 목록

| 이벤트 | 트리거 | 처리 로직 | 파일 위치 |
|--------|--------|-----------|-----------|
| **검색** | 검색어 입력 | `setSearchQuery()` → `getLoans()` 재호출 → 첫 페이지로 이동 | `LoanList.tsx:85-88` |
| **상태 필터** | 드롭다운 변경 | `setStatusFilter()` → `getLoans()` 재호출 → 첫 페이지로 이동 | `LoanList.tsx:214-217` |
| **정렬 기준** | 드롭다운 변경 | `setSortBy()` → `getLoans()` 재호출 → 첫 페이지로 이동 | `LoanList.tsx:230-233` |
| **정렬 순서** | 버튼 클릭 | `toggleSortOrder()` → asc ↔ desc 전환 → `getLoans()` 재호출 | `LoanList.tsx:90-92, 241-248` |
| **전체 선택** | 체크박스 클릭 | 현재 페이지 전체 선택/해제 | `LoanList.tsx:48-54` |
| **개별 선택** | 체크박스 클릭 | `selectedLoans` 배열에 추가/제거 | `LoanList.tsx:62-68` |
| **일괄 반납** | "Mark as Returned" 버튼 | 선택된 대출 모두 `status: RETURNED`, `returnDate: 현재시간` 업데이트 → 목록 새로고침 | `LoanList.tsx:70-83` |
| **행 클릭** | 테이블 행 클릭 | 대출 상세 페이지로 이동 (`/admin/loans/{id}`) | `LoanList.tsx:269-277` |
| **페이지 변경** | 페이지 번호 클릭 | `setCurrentPage()` → 선택 해제 → 스크롤 최상단 | `LoanList.tsx:56-60` |

### 관리자 - 신규 대출 생성

| 이벤트 | 트리거 | 처리 로직 | 파일 위치 |
|--------|--------|-----------|-----------|
| **회원 선택 열기** | "Select Member" 버튼 | `setMemberModalOpen(true)` → 모달 표시 | `LoanAdd.tsx:79, 164` |
| **회원 선택** | 모달에서 회원 클릭 | `setSelectedMember()` → 모달 닫기 | `LoanAdd.tsx:162-165` |
| **도서 선택 열기** | "Select Book" 버튼 | `setBookModalOpen(true)` → 모달 표시 (available=true만) | `LoanAdd.tsx:108, 184, 186` |
| **도서 선택** | 모달에서 도서 클릭 | `setSelectedBook()` → 모달 닫기 | `LoanAdd.tsx:182-185` |
| **대출일 변경** | 날짜 입력 | `setLoanDate()` → `setDueDate(loanDate + 14일)` 자동 계산 | `LoanAdd.tsx:20-23, 127` |
| **반납일 변경** | 날짜 입력 | `setDueDate()` | `LoanAdd.tsx:139` |
| **대출 생성** | "Create Loan" 버튼 | 유효성 검증 → `createLoan()` 호출 → 대출 목록으로 이동 | `LoanAdd.tsx:25-51` |

**유효성 검증** (`LoanAdd.tsx:25-35`):
1. 회원과 도서 선택 여부 확인
2. 도서 대여 가능 여부 확인 (`available: true`)
3. 실패 시 alert 표시

**생성 데이터**:
```typescript
{
  bookId, bookTitle, bookAuthor,      // 선택된 도서
  memberId, memberName, memberEmail,  // 선택된 회원
  loanDate,                           // 입력된 대출일
  dueDate,                            // 입력된 반납일
  status: "ACTIVE"                    // 초기 상태
}
```

### 관리자 - 대출 상세

| 이벤트 | 트리거 | 처리 로직 | 파일 위치 |
|--------|--------|-----------|-----------|
| **반납 처리** | "Mark as Returned" 버튼 | 확인 다이얼로그 → `updateLoan(id, {status: "RETURNED", returnDate: 현재시간})` → 화면 갱신 | `LoanDetail.tsx:35-43` |
| **리마인더 발송** | "Send Reminder Email" 버튼 | 이메일 발송 (TODO: API 연동) → alert 표시 | `LoanDetail.tsx:45-50` |
| **연장 시작** | "Extend Due Date" 버튼 | `setIsExtending(true)` → 연장 모드 활성화 → 현재 반납일로 입력란 초기화 | `LoanDetail.tsx:52-57` |
| **연장 취소** | "Cancel" 버튼 | `setIsExtending(false)` → 연장 모드 종료 | `LoanDetail.tsx:59-61` |
| **연장 저장** | "Save Extension" 버튼 | 새 반납일로 `updateLoan()` → 상태 자동 계산 (미래: ACTIVE, 과거: OVERDUE) → 연장 모드 종료 | `LoanDetail.tsx:63-75` |

**상태 자동 계산** (`LoanDetail.tsx:70`):
- `newDueDate > 현재시간` → `status: "ACTIVE"`
- `newDueDate <= 현재시간` → `status: "OVERDUE"`

### 사용자 - 내 대출 목록

| 이벤트 | 트리거 | 처리 로직 | 파일 위치 |
|--------|--------|-----------|-----------|
| **상태 필터** | 필터 버튼 클릭 | `setFilterStatus()` → 목록 재렌더링 | `MyLoans.tsx:159, 169, 179, 189` |
| **반납 신청** | "Return Book" / "Return Now" 버튼 | 확인 다이얼로그 → localStorage/JSON 처리 → `returnBook(id)` → 목록 새로고침 | `MyLoans.tsx:43-62` |
| **이력 삭제** | "Delete" 버튼 | 확인 다이얼로그 → localStorage/JSON 처리 → `deleteLoan(id)` → 목록 새로고침 | `MyLoans.tsx:64-83` |
| **도서 상세 이동** | 도서 제목 클릭 | 도서 상세 페이지로 이동 (`/client/books/{bookId}`) | `MyLoans.tsx:230-235` |

**localStorage/JSON 처리 로직**:

1. **JSON 대출인 경우** (localStorage에 없음):
   - JSON 대출을 localStorage로 복사 (새 ID 부여)
   - 복사본에 대해 작업 수행

2. **localStorage 대출인 경우**:
   - 직접 작업 수행

3. **이유**:
   - JSON 파일은 읽기 전용
   - 모든 변경사항은 localStorage에 저장

---

## 💾 임시 데이터 구조

### Loan 타입 정의

**파일**: `src/shared/types/index.ts:107-119`

```typescript
export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  loanDate: string;        // ISO 8601 형식
  dueDate: string;         // ISO 8601 형식
  returnDate?: string;     // ISO 8601 형식 (선택)
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
}
```

### Mock API

**파일**: `src/shared/utils/mockLoanApi.ts`

**Storage Key**: `library_loans`

**API 함수**:

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `initLoans()` | localStorage 초기화 (JSON 데이터 로드) | - | void |
| `getLoans(params)` | 대출 목록 조회 (검색, 필터, 정렬) | `{ searchQuery?, statusFilter?, sortKey?, sortOrder? }` | `Loan[]` |
| `getLoanById(id)` | 대출 상세 조회 | `id: number` | `Loan \| undefined` |
| `createLoan(data)` | 신규 대출 생성 | `Omit<Loan, "id">` | `Loan` |
| `updateLoan(id, updates)` | 대출 수정 | `id: number, updates: Partial<Omit<Loan, "id">>` | `Loan \| undefined` |
| `deleteLoan(id)` | 대출 삭제 | `id: number` | `boolean` |

**검색 로직** (`mockLoanApi.ts:50-58`):
- `bookTitle`, `memberName`, `memberEmail`에서 대소문자 무시하고 검색

**정렬 로직** (`mockLoanApi.ts:65-78`):
- 문자열/날짜 비교
- `asc` (오름차순) / `desc` (내림차순)

**Side Effects**:
- `createLoan()`: 도서 `available = false`로 변경 (로그만 출력)
- `updateLoan()`: `status: RETURNED`로 변경 시 도서 `available = true`로 변경 (로그만 출력)
- `deleteLoan()`: 미반납 대출 삭제 시 도서 `available = true`로 변경 (로그만 출력)

### 초기 데이터 (JSON)

**파일**: `src/shared/data/loans.json`

**데이터 구성**:
- 총 20개 대출 기록
- 회원 5명 (id: 1-5)
- 도서 20권 (id: 1-20)

**상태 분포**:
- **ACTIVE**: 6건 (id: 15-20)
  - 대출일: 2025-10-01 ~ 2025-10-05
  - 반납 예정일: 2025-10-15 ~ 2025-10-19
- **RETURNED**: 12건 (id: 1-10, 13-14)
  - 반납일이 모두 기록됨
- **OVERDUE**: 2건 (id: 11-12)
  - 반납 예정일이 지났지만 미반납

**샘플 데이터**:
```json
{
  "id": 20,
  "bookId": 1,
  "bookTitle": "Atomic Habits",
  "bookAuthor": "James Clear",
  "memberId": 1,
  "memberName": "Sophia Clark",
  "memberEmail": "sophia.clark@email.com",
  "loanDate": "2025-10-05T10:00:00",
  "dueDate": "2025-10-19T10:00:00",
  "status": "ACTIVE"
}
```

### Client Storage

**파일**: `src/client/utils/loanStorage.ts`

**Storage Key**: `user_loans`

**주요 함수**:
- `getUserLoans()`: localStorage에서 사용자 대출 조회
- `addLoan(data)`: 대출 추가
- `returnBook(id)`: 반납 처리
- `deleteLoan(id)`: 대출 삭제
- `getCurrentMemberId()`: 현재 로그인 회원 ID 조회

**localStorage 우선 정책**:
- Client 페이지에서는 localStorage 데이터 우선 표시
- JSON 데이터는 변경 불가하므로 복사 후 작업

---

## 📊 상태 배지 스타일

**파일**: `src/shared/components/common/Badge.tsx`

| Status | Variant | 배경색 | 텍스트색 |
|--------|---------|--------|----------|
| ACTIVE | `active` | 초록색 (`bg-green-100`) | 초록색 (`text-green-800`) |
| RETURNED | `returned` | 회색 (`bg-gray-100`) | 회색 (`text-gray-800`) |
| OVERDUE | `overdue` | 빨간색 (`bg-red-100`) | 빨간색 (`text-red-800`) |

---

## 🔄 데이터 흐름

### 관리자 대출 생성 흐름

```
1. 사용자가 "/admin/loans/add" 접근
2. 회원 선택 모달 열기
   → membersData (JSON) 로드
   → 검색/선택
3. 도서 선택 모달 열기
   → booksData (JSON) 로드
   → available=true 필터링
   → 검색/선택
4. 대출일/반납일 설정
   → loanDate 변경 시 dueDate 자동 계산 (14일 후)
5. "Create Loan" 버튼 클릭
   → 유효성 검증
   → createLoan() 호출
   → localStorage에 저장
   → "/admin/loans"로 이동
```

### 사용자 반납 신청 흐름

```
1. 사용자가 "/client/my-loans" 접근
2. localStorage + JSON 데이터 병합
   → getCurrentMemberId()로 현재 회원 확인
   → 현재 회원의 대출만 필터링
3. "Return Book" 버튼 클릭
4. 확인 다이얼로그
5. 대출 처리:
   - JSON 대출인 경우:
     → localStorage로 복사 (새 ID)
     → 복사본 반납 처리
   - localStorage 대출인 경우:
     → 직접 반납 처리
6. returnBook(id) 호출
   → status: "RETURNED"
   → returnDate: 현재시간
7. 목록 새로고침
```

---

## 🚀 추가 개선 사항 (TODO)

### 1. 예외 처리 강화

현재 UI에는 LOAN_API_GUIDE.md에 정의된 예외 처리가 일부만 구현되어 있습니다. 다음 항목들을 추가해야 합니다:

#### 대출 생성 시 추가 검증:

**회원 등급별 대여 권수 제한**:
```typescript
// LoanAdd.tsx에 추가 필요
const checkLoanLimit = (member: Member): boolean => {
  const memberGrade = member.membershipType; // BASIC, SILVER, GOLD, VIP
  const currentLoans = getLoans({ statusFilter: "ACTIVE" })
    .filter(loan => loan.memberId === member.id).length;

  const limits = {
    BASIC: 3,
    SILVER: 5,
    GOLD: 10,
    VIP: Infinity
  };

  if (currentLoans >= limits[memberGrade]) {
    alert(`대여 가능 권수를 초과했습니다. (현재: ${currentLoans}/${limits[memberGrade]})`);
    return false;
  }
  return true;
};
```

**연체 확인**:
```typescript
// LoanAdd.tsx에 추가 필요
const hasOverdueLoans = (memberId: number): boolean => {
  const overdueLoans = getLoans({ statusFilter: "OVERDUE" })
    .filter(loan => loan.memberId === memberId);

  if (overdueLoans.length > 0) {
    alert("연체 중인 도서가 있습니다. 먼저 반납해주세요.");
    return true;
  }
  return false;
};
```

**중복 대여 방지**:
```typescript
// LoanAdd.tsx에 추가 필요
const hasDuplicateLoan = (memberId: number, bookId: number): boolean => {
  const activeLoans = getLoans({ statusFilter: "ACTIVE" })
    .filter(loan => loan.memberId === memberId && loan.bookId === bookId);

  if (activeLoans.length > 0) {
    alert("이미 대여 중인 도서입니다.");
    return true;
  }
  return false;
};
```

#### 대출 연장 시 추가 검증:

**연장 가능 횟수 제한**:
```typescript
// LoanDetail.tsx에 추가 필요
interface LoanExtended extends Loan {
  extensionCount?: number;  // 연장 횟수 추가
}

const checkExtensionLimit = (loan: LoanExtended, memberGrade: string): boolean => {
  const limits = {
    BASIC: 1,
    SILVER: 2,
    GOLD: 3,
    VIP: Infinity
  };

  if ((loan.extensionCount || 0) >= limits[memberGrade]) {
    alert(`연장 가능 횟수를 초과했습니다. (최대: ${limits[memberGrade]}회)`);
    return false;
  }
  return true;
};
```

**연장 가능 시기 확인**:
```typescript
// LoanDetail.tsx에 추가 필요
const canExtendNow = (dueDate: string): boolean => {
  const due = new Date(dueDate);
  const now = new Date();
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue > 3) {
    alert("반납 예정일 3일 전부터 연장 가능합니다.");
    return false;
  }
  return true;
};
```

### 2. 상태 메시지 추가

#### 성공 메시지:
```typescript
// 대출 생성 성공
{
  message: "도서가 성공적으로 대출되었습니다.",
  notification: "반납 예정일은 2025-10-30입니다. 연장은 반납 3일 전부터 가능합니다."
}

// 반납 성공
{
  message: "도서가 정상 반납되었습니다. 이용해주셔서 감사합니다.",
  overdueFee: 0
}

// 연체 반납
{
  message: "도서가 반납되었습니다.",
  overdueFee: 3500,
  overdueDays: 7,
  notification: "연체료 3,500원이 부과되었습니다. 마이페이지에서 결제해주세요."
}
```

#### 알림 메시지:
```typescript
// 반납 3일 전
"반납 예정일이 3일 남았습니다. (Atomic Habits, 반납일: 2025-10-19)"

// 반납 1일 전
"반납 예정일이 내일입니다. (Atomic Habits, 반납일: 2025-10-19)"

// 연체 발생
"도서 반납이 지연되었습니다. (Atomic Habits, 연체료: 500원)"

// 연체 3일차
"연체가 3일 경과했습니다. 빠른 반납 부탁드립니다. (연체료: 1,500원)"
```

### 3. 임시 데이터 보완

**회원 등급 정보 추가**:
- `members.json`에 `memberGrade` 필드 추가 (BASIC, SILVER, GOLD, VIP)

**대출 연장 정보 추가**:
- `loans.json`에 `extensionCount` 필드 추가

**연체료 계산 필드 추가**:
- `loans.json`에 `overdueFee` 필드 추가

**예약 정보 추가**:
- `books.json`에 `reservations` 필드 추가 (예약자 목록)

### 4. 알림 시스템

**알림 컴포넌트 추가**:
- 반납 3일 전 알림
- 반납 1일 전 알림
- 연체 발생 알림
- 연체 경고 알림 (3일, 7일)

**헤더 알림 배지**:
- 읽지 않은 알림 개수 표시
- 알림 드롭다운 메뉴

### 5. 통계 및 리포트

**관리자 대시보드 추가**:
- 전체 대출 통계
- 연체율 분석
- 인기 도서 순위
- 회원별 대출 이력

---

---

## 🔗 사용자 여정 및 API 매핑

### 관리자 플로우

#### 1. 대출 생성 플로우

```
[메뉴] Sidebar > Loans
  ↓
[페이지] /admin/loans (LoanList)
  ↓
[이벤트] "New Loan" 버튼 클릭
  ↓
[페이지] /admin/loans/add (LoanAdd)
  ↓
[이벤트] "Select Member" 버튼 클릭 → 회원 선택
[이벤트] "Select Book" 버튼 클릭 → 도서 선택
[이벤트] 대출일/반납일 설정
[이벤트] "Create Loan" 버튼 클릭
  ↓
[API 호출] POST /api/admin/loans
  {
    "memberId": 4,
    "bookId": 15,
    "loanDate": "2025-10-02T11:45:00Z",
    "dueDate": "2025-10-16T11:45:00Z"
  }
  ↓
[응답 처리] 201 Created
  - 성공 메시지: "도서가 성공적으로 대출되었습니다."
  - 실패 (409): "이미 대여 중인 도서입니다." / "대여 가능 권수를 초과했습니다."
  ↓
[다음 화면] /admin/loans (LoanList로 이동)
```

#### 2. 대출 조회 및 검색 플로우

```
[메뉴] Sidebar > Loans
  ↓
[페이지] /admin/loans (LoanList)
  ↓
[이벤트] 페이지 로드 시 자동 호출
  ↓
[API 호출] GET /api/admin/loans?page=0&size=10&sortKey=loanDate&sortOrder=desc
  ↓
[응답 처리] 200 OK
  - 대출 목록 렌더링
  - 페이지네이션 정보 표시
  ↓
[이벤트] 검색어 입력 → "James" 입력
  ↓
[API 호출] GET /api/admin/loans?searchQuery=James&page=0&size=10
  ↓
[이벤트] 상태 필터 선택 → "OVERDUE" 선택
  ↓
[API 호출] GET /api/admin/loans?searchQuery=James&statusFilter=OVERDUE&page=0&size=10
  ↓
[이벤트] 대출 행 클릭
  ↓
[다음 화면] /admin/loans/{id} (LoanDetail)
```

#### 3. 대출 상세 조회 플로우

```
[페이지] /admin/loans/{id} (LoanDetail)
  ↓
[이벤트] 페이지 로드 시 자동 호출
  ↓
[API 호출] GET /api/admin/loans/{id}
  ↓
[응답 처리] 200 OK
  - 대출 상세 정보 표시
  - 도서 정보, 회원 정보, 날짜 정보
  - 상태에 따른 액션 버튼 표시
  ↓
[화면 분기]
  - ACTIVE/OVERDUE: "Mark as Returned", "Extend Due Date", "Send Reminder"
  - RETURNED: 액션 없음
```

#### 4. 반납 처리 플로우

```
[페이지] /admin/loans/{id} (LoanDetail)
  ↓
[이벤트] "Mark as Returned" 버튼 클릭
  ↓
[확인] "Are you sure you want to mark this loan as returned?"
  ↓
[API 호출] PATCH /api/admin/loans/{id}
  {
    "status": "RETURNED"
  }
  ↓
[응답 처리] 200 OK
  - 성공 메시지: "도서가 정상 반납되었습니다."
  - returnDate 자동 설정
  - 도서 available = true로 변경
  ↓
[화면 갱신] 대출 상세 정보 업데이트
  - status 배지: RETURNED
  - returnDate 표시
  - 액션 버튼 숨김
```

#### 5. 반납일 연장 플로우

```
[페이지] /admin/loans/{id} (LoanDetail)
  ↓
[이벤트] "Extend Due Date" 버튼 클릭
  ↓
[화면] 연장 모드 활성화
  - 새 반납일 입력 필드 표시
  - "Save Extension", "Cancel" 버튼
  ↓
[이벤트] 새 반납일 입력 → "2025-10-30" 선택
[이벤트] "Save Extension" 버튼 클릭
  ↓
[API 호출] PATCH /api/admin/loans/{id}
  {
    "dueDate": "2025-10-30T23:59:59Z"
  }
  ↓
[응답 처리] 200 OK
  - 성공 메시지: "대여 기간이 연장되었습니다."
  - 실패 (409): "연장 가능 횟수를 초과했습니다."
  ↓
[화면 갱신] 대출 상세 정보 업데이트
  - dueDate 업데이트
  - status: ACTIVE (연장으로 인해 연체 해제 가능)
  - 연장 모드 종료
```

#### 6. 일괄 반납 처리 플로우

```
[페이지] /admin/loans (LoanList)
  ↓
[이벤트] 대출 체크박스 선택 (여러 개)
  ↓
[화면] 선택 항목 액션 바 표시
  - "{N} loan(s) selected"
  - "Mark as Returned" 버튼
  ↓
[이벤트] "Mark as Returned" 버튼 클릭
  ↓
[API 호출] 각 선택된 대출에 대해 순차 호출
  PATCH /api/admin/loans/{id1} { "status": "RETURNED" }
  PATCH /api/admin/loans/{id2} { "status": "RETURNED" }
  PATCH /api/admin/loans/{id3} { "status": "RETURNED" }
  ↓
[응답 처리] 모든 요청 완료 후
  - 성공 메시지: "{N}개의 대출이 반납 처리되었습니다."
  ↓
[화면 갱신] 대출 목록 새로고침
  - 선택 해제
  - 목록 재조회
```

---

### 사용자 플로우

#### 1. 도서 대여 플로우 (관리자를 통한 대출)

```
[메뉴] Header > Books
  ↓
[페이지] /client/books (BookList)
  ↓
[이벤트] 도서 카드 클릭
  ↓
[페이지] /client/books/{id} (BookDetail)
  ↓
[화면] 도서 상세 정보 표시
  - 제목, 저자, ISBN, 가격
  - Available 상태 확인
  ↓
[조건 분기]
  - available = true: "Borrow Book" 버튼 표시
  - available = false: "Currently Unavailable" 표시
  ↓
[이벤트] "Borrow Book" 버튼 클릭
  ↓
[API 호출] POST /api/my/loans (또는 장바구니 추가)
  {
    "bookId": 15
  }
  ↓
[응답 처리] 201 Created
  - 성공 메시지: "도서가 대출되었습니다."
  - 실패 (409): "대여 가능 권수를 초과했습니다." / "연체 중인 도서가 있습니다."
  ↓
[다음 화면] /client/my-loans (내 대출 목록으로 이동)
```

**참고**: 현재 UI에는 사용자가 직접 대출하는 기능이 없고, 관리자가 오프라인 요청을 받아 대출 생성합니다. 향후 온라인 대출 신청 기능 추가 가능.

#### 2. 내 대출 조회 플로우

```
[메뉴] Header > My Loans (또는 User Menu > My Loans)
  ↓
[페이지] /client/my-loans (MyLoans)
  ↓
[이벤트] 페이지 로드 시 자동 호출
  ↓
[API 호출] GET /api/my/loans?statusFilter=ALL
  ↓
[응답 처리] 200 OK
  - 대출 목록 표시
  - 통계 카드 업데이트 (Total, Active, Overdue, Returned)
  ↓
[이벤트] 상태 필터 버튼 클릭 → "ACTIVE" 선택
  ↓
[API 호출] GET /api/my/loans?statusFilter=ACTIVE
  ↓
[응답 처리] 200 OK
  - ACTIVE 상태 대출만 표시
  ↓
[이벤트] 도서 제목 클릭
  ↓
[다음 화면] /client/books/{bookId} (도서 상세 페이지)
```

#### 3. 반납 신청 플로우

```
[페이지] /client/my-loans (MyLoans)
  ↓
[화면] 대출 카드 목록
  - ACTIVE 상태: "Return Book" 버튼 (파란색)
  - OVERDUE 상태: "Return Now" 버튼 (빨간색)
  ↓
[이벤트] "Return Book" 버튼 클릭
  ↓
[확인] "Are you sure you want to return {bookTitle}?"
  ↓
[API 호출] POST /api/my/loans/{id}/return
  ↓
[응답 처리] 200 OK
  - 성공 메시지: "도서가 정상 반납되었습니다."
  - 연체인 경우: "도서가 반납되었습니다. 연체료 3,500원이 부과되었습니다."
  ↓
[화면 갱신] 대출 목록 새로고침
  - localStorage 업데이트
  - status: RETURNED
  - returnDate 설정
  - 통계 카드 업데이트
```

#### 4. 대출 이력 삭제 플로우

```
[페이지] /client/my-loans (MyLoans)
  ↓
[화면] RETURNED 상태 대출 카드
  - "Delete" 버튼 표시 (회색)
  ↓
[이벤트] "Delete" 버튼 클릭
  ↓
[확인] "Are you sure you want to delete the loan history for {bookTitle}?"
  ↓
[API 호출] DELETE /api/my/loans/{id} (또는 localStorage만 삭제)
  ↓
[응답 처리] 204 No Content
  - 성공 메시지: "대출 이력이 삭제되었습니다."
  ↓
[화면 갱신] 대출 목록 새로고침
  - 해당 대출 카드 제거
  - 통계 카드 업데이트
```

---

## 🔄 API 호출 타이밍 정리

### 자동 호출 (페이지 로드 시)

| 페이지 | API | 목적 |
|--------|-----|------|
| `/admin/loans` | `GET /api/admin/loans` | 전체 대출 목록 조회 |
| `/admin/loans/:id` | `GET /api/admin/loans/{id}` | 대출 상세 정보 조회 |
| `/client/my-loans` | `GET /api/my/loans` | 내 대출 목록 조회 |

### 사용자 액션에 의한 호출

| 페이지 | 이벤트 | API | 목적 |
|--------|--------|-----|------|
| `/admin/loans/add` | "Create Loan" 클릭 | `POST /api/admin/loans` | 신규 대출 생성 |
| `/admin/loans/:id` | "Mark as Returned" 클릭 | `PATCH /api/admin/loans/{id}` | 반납 처리 |
| `/admin/loans/:id` | "Save Extension" 클릭 | `PATCH /api/admin/loans/{id}` | 반납일 연장 |
| `/admin/loans/:id` | "Send Reminder" 클릭 | `POST /api/admin/loans/{id}/reminder` | 리마인더 이메일 발송 (TODO) |
| `/admin/loans` | "Mark as Returned" (일괄) | `PATCH /api/admin/loans/{id}` (여러 번) | 일괄 반납 처리 |
| `/client/books/:id` | "Borrow Book" 클릭 | `POST /api/my/loans` | 도서 대출 신청 (TODO) |
| `/client/my-loans` | "Return Book" 클릭 | `POST /api/my/loans/{id}/return` | 반납 신청 |
| `/client/my-loans` | "Delete" 클릭 | `DELETE /api/my/loans/{id}` | 대출 이력 삭제 (TODO) |

### 검색/필터/정렬에 의한 호출

| 페이지 | 이벤트 | API | 쿼리 파라미터 |
|--------|--------|-----|--------------|
| `/admin/loans` | 검색어 입력 | `GET /api/admin/loans` | `searchQuery={query}` |
| `/admin/loans` | 상태 필터 변경 | `GET /api/admin/loans` | `statusFilter={status}` |
| `/admin/loans` | 정렬 기준 변경 | `GET /api/admin/loans` | `sortKey={key}&sortOrder={order}` |
| `/admin/loans` | 페이지 변경 | `GET /api/admin/loans` | `page={number}&size={size}` |
| `/client/my-loans` | 상태 필터 변경 | `GET /api/my/loans` | `statusFilter={status}` |

---

## 🎯 현재 미구현 API 및 향후 추가 필요 사항

### 1. 사용자 직접 대출 신청 API

**현재 상태**: 관리자가 오프라인 요청을 받아 대출 생성

**향후 필요**: 사용자가 온라인으로 직접 대출 신청

```
POST /api/my/loans/request
{
  "bookId": 15
}
```

**UI 연동**:
- `/client/books/{id}` (BookDetail 페이지)
- "Borrow Book" 버튼 → API 호출 → `/client/my-loans`로 이동

### 2. 리마인더 이메일 발송 API

**현재 상태**: 버튼만 있고 실제 API 미연동 (`LoanDetail.tsx:47-50`)

**필요 API**:
```
POST /api/admin/loans/{id}/reminder
```

**UI 연동**:
- `/admin/loans/{id}` (LoanDetail 페이지)
- "Send Reminder Email" 버튼 → API 호출 → 성공 메시지

### 3. 대출 이력 삭제 API

**현재 상태**: localStorage만 삭제 (`MyLoans.tsx:64-83`)

**필요 API**:
```
DELETE /api/my/loans/{id}
```

**UI 연동**:
- `/client/my-loans` (MyLoans 페이지)
- "Delete" 버튼 → API 호출 → 목록 갱신

### 4. 예약 기능 API

**비즈니스 규칙에 정의되어 있으나 UI/API 모두 미구현**

**필요 API**:
```
POST /api/my/reservations
{
  "bookId": 15
}

GET /api/my/reservations
DELETE /api/my/reservations/{id}
```

**UI 연동**:
- `/client/books/{id}`: available = false일 때 "Reserve" 버튼 표시
- `/client/my-reservations`: 예약 목록 페이지 추가

### 5. 연체료 결제 API

**비즈니스 규칙에 정의되어 있으나 UI/API 모두 미구현**

**필요 API**:
```
GET /api/my/fees
POST /api/my/fees/{id}/pay
```

**UI 연동**:
- `/client/my-loans`: 연체료 표시
- `/client/account`: 미납 연체료 표시 및 결제 버튼

---

## 📝 참고 문서

- **API 가이드**: [LOAN_API_GUIDE.md](./LOAN_API_GUIDE.md)
- **타입 정의**: `src/shared/types/index.ts`
- **Mock API**: `src/shared/utils/mockLoanApi.ts`
