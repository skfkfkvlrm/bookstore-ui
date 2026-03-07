# Spring Library UI — 디자인 시스템 레퍼런스

> **사용 방법:** 다른 프로젝트에서 AI에게 UI 작업을 요청할 때, 이 파일 경로를 읽도록 지시하거나 내용 전체를 붙여넣으세요.
> 예: "다음 디자인 시스템을 참고하여 UI를 작성해주세요: [이 파일 내용]"

---

## 디자인 시스템 개요

이 문서는 **스프링 도서관 관리 시스템**의 UI 디자인 시스템입니다.
React 19 + TypeScript + TailwindCSS 3 기반으로 구축되었으며,
관리자(Admin)와 사용자(Client) 두 가지 인터페이스를 포함합니다.

**핵심 원칙:**

- 모든 UI 텍스트는 **한국어**
- 금액은 반드시 **원화 형식** (`toLocaleString()원`)
- **다크 모드** 완전 지원 (`dark:` 클래스 항상 병기)
- 스타일은 **TailwindCSS 인라인 클래스**만 사용 (별도 CSS 파일 금지)
- 아이콘은 **Material Symbols Outlined** 사용

---

## 1. 기술 스택

```
React 19 / TypeScript 5 / TailwindCSS 3 / Vite 7
React Router DOM 7 / Axios 1 / Chart.js 4 + react-chartjs-2 5
폰트: Manrope (Google Fonts, weights: 400·500·700·800)
아이콘: Material Symbols Outlined (Google Fonts CDN)
```

---

## 2. 색상 시스템

### 브랜드 컬러

| 용도 | 값 |
| --- | --- |
| 기본 (버튼·링크·액센트) | `#2f9e5f` |
| 호버 | `#2f9e5f` + `/90` 투명도 |
| 연한 배경 (선택 상태·뱃지) | `#2f9e5f` + `/10` ~ `/20` |

```tsx
// 사용 예시
className="bg-[#2f9e5f] hover:bg-[#2f9e5f]/90 text-white"
className="bg-[#2f9e5f]/10 text-[#2f9e5f]"
```

### 배경 컬러

| 용도 | 라이트 | 다크 |
| --- | --- | --- |
| 전체 페이지 | `bg-[#f6f7f8]` | `dark:bg-[#101922]` |
| 카드·테이블·사이드바 | `bg-white` | `dark:bg-[#1a2632]` |
| 입력 필드 | `bg-white` | `dark:bg-[#101922]` |
| 드롭다운·팝업 | `bg-white` | `dark:bg-[#1a2332]` |

### 텍스트 컬러

| 용도 | 라이트 | 다크 |
| --- | --- | --- |
| 주요 텍스트 | `text-gray-900` | `dark:text-white` |
| 보조 텍스트 | `text-gray-600` | `dark:text-gray-400` |
| 힌트·플레이스홀더 | `text-gray-400` | `dark:text-gray-500` |

### 보더

```
기본:  border-gray-200 dark:border-gray-700
강조:  border-gray-300 dark:border-gray-600
구분선: divide-gray-200 dark:divide-gray-700
```

### 상태(Semantic) 컬러

| 상태 | 배경 클래스 | 텍스트 클래스 |
| --- | --- | --- |
| 성공·재고있음·완료 | `bg-green-500/20` | `text-green-600 dark:text-green-400` |
| 오류·없음·연체 | `bg-red-500/20` | `text-red-600 dark:text-red-400` |
| 경고·접수중 | `bg-yellow-500/20` | `text-yellow-600 dark:text-yellow-400` |
| 정보·확정·활성 | `bg-blue-500/20` | `text-blue-600 dark:text-blue-400` |
| 진행중·배송중 | `bg-purple-500/20` | `text-purple-600 dark:text-purple-400` |
| 주의·정지 | `bg-orange-500/20` | `text-orange-600 dark:text-orange-400` |

---

## 3. 타이포그래피

**폰트 패밀리:** `Manrope` (Google Fonts)

| 클래스 | 크기 | 용도 |
| --- | --- | --- |
| `text-xs` | 12px | 뱃지, 메타데이터 |
| `text-sm` | 14px | 테이블 본문, 폼 레이블 |
| `text-base` | 16px | 일반 본문 |
| `text-lg` | 18px | 카드 제목 |
| `text-xl` | 20px | 섹션 소제목 |
| `text-2xl` | 24px | 통계 수치 |
| `text-3xl` | 30px | 페이지 제목 |
| `text-5xl` | 48px | 히어로 타이틀 |

**굵기:** `font-medium(500)` · `font-semibold(600)` · `font-bold(700)` · `font-extrabold(800)`

---

## 4. 아이콘

**Material Symbols Outlined** — `index.html`에서 Google Fonts CDN으로 로드

```tsx
// 사용법
<span className="material-symbols-outlined text-2xl text-[#2f9e5f]">
  icon_name
</span>
```

크기: `text-sm` · `text-base` · `text-xl` · `text-2xl` · `text-3xl` · `text-4xl` · `text-5xl` · `text-6xl`

### 주요 아이콘

| 아이콘명 | 용도 | 아이콘명 | 용도 |
| --- | --- | --- | --- |
| `local_library` | 로고 | `search` | 검색 |
| `library_books` | 도서 목록 | `add` | 추가 |
| `menu_book` | 도서 상세 | `edit` | 수정 |
| `auto_stories` | 내 대출 | `delete` | 삭제 |
| `group` | 회원 | `check_circle` | 확인 |
| `receipt_long` | 주문 | `cancel` | 취소 |
| `shopping_cart` | 장바구니 | `arrow_back` | 뒤로 |
| `shopping_bag` | 결제 | `arrow_forward` | 앞으로 |
| `local_shipping` | 배송 | `expand_more` | 드롭다운 열기 |
| `payment` | 결제수단 | `expand_less` | 드롭다운 닫기 |
| `notifications` | 알림 | `chevron_left` | 이전 페이지 |
| `logout` | 로그아웃 | `chevron_right` | 다음 페이지 |
| `settings` | 설정 | `trending_up` | 상승 추이 |
| `account_circle` | 계정 | `trending_down` | 하락 추이 |
| `dashboard` | 대시보드 | `progress_activity` | 로딩 스피너 |
| `info` | 안내 | `error` | 에러 |

---

## 5. 공통 컴포넌트

### Button

```tsx
<Button
  variant="primary"   // "primary" | "secondary" | "danger" | "success"
  size="md"           // "sm" | "md" | "lg"
  onClick={handler}
  disabled={false}
>
  <span className="material-symbols-outlined">add</span>
  버튼 텍스트
</Button>
```

**variant별 스타일:**

```
primary:   bg-[#2f9e5f] hover:bg-[#2f9e5f]/90 text-white
secondary: bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white
danger:    bg-red-500 hover:bg-red-600 text-white
success:   bg-green-500 hover:bg-green-600 text-white
```

**공통 기본 스타일:** `font-bold rounded-lg transition-colors flex items-center gap-2`

---

### Badge

```tsx
<Badge variant="active">활성</Badge>
```

**variants:**

| variant | 색상 |
| --- | --- |
| `premium` · `available` · `delivered` · `returned` | 녹색 계열 |
| `unavailable` · `cancelled` · `overdue` · `withdrawn` | 빨간색 계열 |
| `pending` | 노란색 계열 |
| `confirmed` · `active` | 파란색 계열 |
| `shipped` | 보라색 계열 |
| `suspended` | 주황색 계열 |
| `dormant` · `standard` | 회색 계열 |

**기본 스타일:** `px-3 py-1 text-xs font-semibold rounded-full`

---

### Input / Select

```tsx
// Input
<Input
  label="필드명"
  placeholder="입력하세요"
  error="오류 메시지"
  value={value}
  onChange={handler}
/>

// 직접 작성 시
<input
  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
             bg-white dark:bg-[#101922] text-gray-900 dark:text-white
             focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
/>
<select
  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
             bg-white dark:bg-[#101922] text-gray-900 dark:text-white
             focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none text-sm"
/>
```

---

### Pagination

```tsx
<Pagination
  currentPage={currentPage}   // 1-indexed
  totalPages={totalPages}
  onPageChange={handlePageChange}
  itemsPerPage={10}
  totalItems={totalItems}
/>
```

현재 페이지: `bg-[#2f9e5f] text-white` / 버튼 크기: `w-10 h-10`

---

### StatCard (대시보드용)

```tsx
<StatCard
  title="총 회원"
  value={1234}
  icon="group"
  subtitle="전체 등록 회원"
  trend={{ value: 5.2, isPositive: true }}
/>
```

---

## 6. 레이아웃 패턴

### 관리자 레이아웃 구조

```
h-screen flex
├── Sidebar  (w-64, hidden md:flex, bg-white dark:bg-[#1a2632], border-r)
│   ├── 로고 영역 (h-16)
│   └── 네비게이션 링크
└── 우측 영역 (flex-1 flex-col overflow-y-scroll)
    ├── Header  (h-16, flex-shrink-0)
    ├── main    (flex-1 p-6)
    └── Footer
```

**사이드바 네비 링크 상태:**

```
기본:   text-gray-600 dark:text-gray-300 hover:bg-[#2f9e5f]/10 hover:text-[#2f9e5f]
활성:   bg-[#2f9e5f]/10 dark:bg-[#2f9e5f]/20 text-[#2f9e5f] font-bold
```

### 사용자 레이아웃 구조

```
flex-col min-h-screen bg-[#f6f7f8] dark:bg-[#101922]
├── Header  (sticky top-0 z-50, h-16, backdrop-blur-sm, bg-[#f6f7f8]/80)
├── main    (flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8)
└── Footer
```

### 페이지 기본 구조 (관리자)

```tsx
<div className="max-w-7xl mx-auto space-y-6">

  {/* 제목 + 액션 버튼 */}
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">페이지 제목</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-1">설명</p>
    </div>
    <Button><span className="material-symbols-outlined">add</span>새로 등록</Button>
  </div>

  {/* 필터·검색 */}
  <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    ...
  </div>

  {/* 테이블 */}
  <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        ...
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        ...
      </tbody>
    </table>
  </div>

  <Pagination ... />
</div>
```

### 카드 스타일

```tsx
// 기본 카드
<div className="bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">

// 통계 카드 그리드
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// 콘텐츠 + 사이드패널 (3:1)
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">...</div>
  <div className="lg:col-span-1 sticky top-4">...</div>
</div>

// 도서 그리드
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
```

---

## 7. UI 상태 패턴

### 로딩

```tsx
<div className="flex items-center justify-center py-16">
  <span className="material-symbols-outlined text-4xl text-[#2f9e5f] animate-spin">
    progress_activity
  </span>
</div>
```

### 에러

```tsx
<div className="text-center py-16">
  <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
  <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
  <button
    onClick={retry}
    className="mt-4 px-6 py-2 rounded-lg bg-[#2f9e5f] text-white font-medium hover:bg-[#2f9e5f]/90"
  >
    다시 시도
  </button>
</div>
```

### 빈 상태

```tsx
<div className="text-center py-16">
  <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
    search_off
  </span>
  <p className="text-lg text-gray-600 dark:text-gray-400">데이터가 없습니다.</p>
</div>
```

### 스켈레톤 로딩

```tsx
<div className="animate-pulse">
  <div className="aspect-[3/4] w-full rounded-lg bg-gray-200 dark:bg-gray-700 mb-2" />
  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
</div>
```

---

## 8. 모달 패턴

```tsx
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#2f9e5f]">info</span>
        모달 제목
      </h3>

      {/* 내용 */}

      <div className="flex gap-3 mt-6 justify-end">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 rounded-lg bg-[#2f9e5f] text-white font-medium hover:bg-[#2f9e5f]/90 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 9. 폼 레이아웃 패턴

```tsx
<div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
    <span className="material-symbols-outlined text-[#2f9e5f]">edit</span>
    섹션 제목
  </h2>

  <div className="space-y-4">
    {/* 2열 그리드 */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          필드명 <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-[#101922] text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-[#2f9e5f] focus:outline-none"
          placeholder="입력하세요"
        />
      </div>
    </div>
  </div>
</div>
```

---

## 10. API 연동 패턴

```tsx
const [items, setItems] = useState<T[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchItems = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await someService.getList();
    // PageResponse 대응: content 필드가 있으면 추출, 배열이면 그대로
    setItems(Array.isArray(res) ? res : (res.content ?? []));
  } catch {
    setError("데이터를 불러오는 데 실패했습니다.");
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => { fetchItems(); }, [fetchItems]);
```

**주의사항:**

- 페이지네이션 API는 `{ content: T[], totalElements, totalPages }` 형식 반환
- 일부 검색 API는 plain 배열 반환 → 분기 처리 (`Array.isArray()`) 필요
- 배열 접근 시 항상 `?? []` fallback 사용

---

## 11. 코딩 규칙 요약

| 규칙 | 내용 |
| --- | --- |
| **UI 언어** | 모든 label·placeholder·버튼·안내문 한국어 |
| **금액 표시** | `{price.toLocaleString()}원` (`$` 기호 금지) |
| **다크 모드** | 모든 색상 클래스에 `dark:` 대응 필수 |
| **아이콘** | Material Symbols Outlined 사용 (`lucide-react` 금지) |
| **스타일** | TailwindCSS 인라인 클래스만 사용 (CSS 파일 금지) |
| **테이블 컬럼** | 상태·금액 컬럼에 `whitespace-nowrap` 적용 |
| **배열 안전** | API 결과 배열 접근 시 `?? []` fallback 필수 |
| **컴포넌트 재사용** | Button·Badge·Input·Pagination 등 공통 컴포넌트 우선 사용 |
| **반응형** | 모바일 퍼스트, `sm:` `md:` `lg:` 브레이크포인트 활용 |
| **테두리 반경** | 버튼·입력·카드: `rounded-lg` / 뱃지·아바타: `rounded-full` |

---

## 12. 핵심 타입 정의

```typescript
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  price: number;
  available: boolean;
  createdDate: string;
  coverImageUrl?: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  membershipType: 'REGULAR' | 'PREMIUM' | 'SUSPENDED';
  role?: 'USER' | 'ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED' | 'DORMANT' | 'WITHDRAWN';
  joinDate: string;
}

interface Order {
  id: number;
  memberId: number;
  memberName: string;
  memberEmail: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderItems: OrderItem[];
  totalAmount: number;
  finalAmount: number;
  orderDate: string;
  payment?: { method: string; status: string; amount: number };
  delivery?: { recipientName: string; phoneNumber: string; address: string };
}

interface Loan {
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
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELLED';
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

---

## 사용 예시

```
아래 디자인 시스템을 참고하여 UI 컴포넌트를 작성해주세요.

[이 파일 전체 내용 붙여넣기]

---

작업 요청:
[원하는 컴포넌트/페이지 설명]
```
