---
name: library-management-ui
description: Work with React 19 + TypeScript library management system. Use when developing features for book management, member management, order processing, loan tracking, or working with React Router, TailwindCSS, Chart.js, or Axios in this project.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Library Management UI Development

## Project Overview

This is a modern web application for library management built with React 19.1.1 and TypeScript 5.9.3. The system provides separate interfaces for administrators and clients.

**Core Technologies:**
- React 19.1.1 + TypeScript 5.9.3
- Vite 7.1.7 (Build tool)
- TailwindCSS 3.4.18 (Styling)
- React Router DOM 7.9.3 (Routing)
- Axios 1.12.2 (HTTP client)
- Chart.js 4.5.0 (Data visualization)
- date-fns 4.1.0 (Date utilities)

## Quick Start

**Development:**
```bash
npm run dev
# Server runs at http://localhost:5173
```

**Build:**
```bash
npm run build
```

**Lint:**
```bash
npm run lint
```

## Project Structure

```
src/
├── admin/                          # Admin area
│   ├── layout/                     # Layout components
│   ├── pages/                      # Admin pages
│   │   ├── Dashboard.tsx
│   │   ├── books/                  # Book management
│   │   ├── members/                # Member management
│   │   ├── orders/                 # Order management
│   │   └── loans/                  # Loan management
│   └── AdminApp.tsx
│
├── client/                         # Client area
│   ├── layout/
│   ├── pages/                      # Client pages
│   │   ├── Home.tsx
│   │   ├── BookList.tsx, BookDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── MyOrders.tsx, MyLoans.tsx
│   │   └── Login.tsx, Register.tsx
│   ├── components/ProtectedRoute.tsx
│   ├── utils/                      # Storage utilities
│   └── ClientApp.tsx
│
├── shared/                         # Shared resources
│   ├── components/common/          # Reusable components
│   ├── types/index.ts              # TypeScript types
│   ├── data/                       # Mock data (JSON)
│   └── utils/
│
└── App.tsx                         # Main router
```

## Key Features

**Admin:**
- Dashboard with statistics and charts
- Book/Member/Order/Loan CRUD operations
- Search, filtering, and pagination
- Status management and reporting

**Client:**
- Book browsing and search
- Shopping cart and orders
- Loan requests and tracking
- Authentication and account management

## Core Data Types

All types are defined in `src/shared/types/index.ts`:

```typescript
// Main entities
Member, Book, Order, Loan

// Key status types
MemberStatus: 'ACTIVE' | 'SUSPENDED' | 'DORMANT' | 'WITHDRAWN'
MemberGrade: 'BASIC' | 'SILVER' | 'GOLD' | 'VIP'
OrderStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
LoanStatus: 'ACTIVE' | 'RETURNED' | 'OVERDUE'

// UI component types
BadgeVariant, ButtonVariant, PageResponse<T>, PageRequest
```

## API Integration

**Backend:** Spring Boot REST API at `http://localhost:8080`

**Endpoints:**
- `/api/members` - Member management
- `/api/books` - Book catalog
- `/api/orders` - Order processing
- `/api/loans` - Loan tracking

For complete API documentation, see [API_GUIDE.md](./API_GUIDE.md)

## Routing Structure

```typescript
// Main routes
/admin/*    - Admin interface (AdminApp.tsx)
/client/*   - Client interface (ClientApp.tsx)

// Protected routes use ProtectedRoute component
// Authentication state managed in client/utils/authStorage.ts
```

## Common Patterns

**Creating a new page:**
1. Add component in appropriate `pages/` directory
2. Import in `AdminApp.tsx` or `ClientApp.tsx`
3. Add route with `<Route path="..." element={<Component />} />`

**Using shared components:**
```tsx
import { Button, Input, Table, Badge } from '@/shared/components/common'
import type { Book, Member } from '@/shared/types'
```

**Making API calls:**
```tsx
import axios from 'axios'

const response = await axios.get('http://localhost:8080/api/books')
const books: Book[] = response.data.content
```

**Styling with TailwindCSS:**
```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
```

## Configuration Files

- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling customization (Manrope font)
- `tsconfig.json` - TypeScript settings
- `eslint.config.js` - Linting rules

## Development Workflow

1. Start dev server: `npm run dev`
2. Make changes (auto-reload via HMR)
3. Lint code: `npm run lint`
4. Build: `npm run build`
5. Preview build: `npm run preview`

## Additional Resources

- [API_GUIDE.md](./API_GUIDE.md) - Complete API reference
- [API_INTEGRATION_ANALYSIS.md](./API_INTEGRATION_ANALYSIS.md) - Integration details
- [LOAN_GUIDE.md](./LOAN_GUIDE.md) - Loan system documentation
- [README.md](./README.md) - Project overview
