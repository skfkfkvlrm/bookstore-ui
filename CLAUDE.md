# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Library Management System UI built with React 19 + TypeScript. Dual interface architecture with separate admin and client applications sharing common components.

**Backend:** Spring Boot REST API at `http://localhost:8080`

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # TypeScript compile + Vite bundle (tsc -b && vite build)
npm run lint     # Run ESLint
npm run preview  # Preview production build
npx eslint --fix .  # Auto-fix lint issues
```

**No test framework is currently configured.**

## Architecture

### Dual App Structure
```
src/
├── admin/           # Admin interface (/admin/*)
│   ├── AdminApp.tsx # Admin router
│   ├── layout/      # Admin layout components
│   └── pages/       # CRUD pages for books, members, orders, loans
├── client/          # Client interface (/client/*)
│   ├── ClientApp.tsx
│   ├── layout/
│   ├── pages/       # User-facing pages (browse, cart, account)
│   ├── components/ProtectedRoute.tsx  # Auth guard
│   └── utils/       # authStorage.ts, cartStorage.ts
├── shared/          # Shared across both apps
│   ├── components/common/  # Reusable UI (Button, Input, Table, Badge, etc.)
│   ├── types/index.ts      # All TypeScript types
│   ├── data/               # Mock JSON data
│   └── utils/
└── App.tsx          # Main router (routes to /admin or /client)
```

### Routing
- Root (`/`) redirects to `/client`
- `/admin/*` - Admin interface (AdminApp.tsx)
- `/client/*` - Client interface (ClientApp.tsx)
- Protected routes use `ProtectedRoute` component with auth state from `client/utils/authStorage.ts`

### Core Types (`src/shared/types/index.ts`)
```typescript
// Entities
Member, Book, Order, Loan

// Status enums
MemberStatus: 'ACTIVE' | 'SUSPENDED' | 'DORMANT' | 'WITHDRAWN'
MemberGrade: 'BASIC' | 'SILVER' | 'GOLD' | 'VIP'
OrderStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
LoanStatus: 'ACTIVE' | 'RETURNED' | 'OVERDUE'

// Pagination
PageResponse<T>, PageRequest
```

### API Integration
Uses Axios for HTTP calls to Spring Boot backend:
- `/api/members` - Member management
- `/api/books` - Book catalog
- `/api/orders` - Order processing
- `/api/loans` - Loan tracking

See [API_GUIDE.md](./API_GUIDE.md) for complete API documentation.

## Development Patterns

### Adding a New Page
1. Create component in `admin/pages/` or `client/pages/`
2. Add route in `AdminApp.tsx` or `ClientApp.tsx`
3. Use shared components from `@/shared/components/common`

### Import Conventions
```tsx
import { Button, Input, Table, Badge } from '@/shared/components/common'
import type { Book, Member } from '@/shared/types'
```

### Styling
TailwindCSS with custom Manrope font. Use utility classes directly in JSX.

## Commit Convention

```
<type>: <short description>

<optional body>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Additional Documentation
- [API_GUIDE.md](./API_GUIDE.md) - REST API reference
- [LOAN_GUIDE.md](./LOAN_GUIDE.md) - Loan system documentation
- [.claude/skills/react-project-best-practices.md](./.claude/skills/react-project-best-practices.md) - React patterns guide
