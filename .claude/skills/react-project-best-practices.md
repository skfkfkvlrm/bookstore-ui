---
name: react-project-best-practices
description: Comprehensive guide for React project development covering domain modeling, TypeScript, testing, common components, and mock data management. Use when working with React, TypeScript, testing, component design, or architecture questions.
---

# React Project Best Practices

A comprehensive guide for writing high-quality, maintainable code in React projects.

## Core Principles

### 1. Domain-Driven Design
Work backwards from the final goal. Define domain models first, then write code.

**Analogy**: Just as you draw blueprints before building a house, domain models are the blueprints of your software.

```typescript
// Step 1: Define domain models
// domain/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// Step 2: Define use cases
// usecases/user/getUserProfile.ts
export class GetUserProfile {
  constructor(private userRepository: UserRepository) {}
  
  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

// Step 3: Implement components
// components/UserProfile/UserProfile.tsx
export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading } = useUser(userId);
  // ...
};
```

### 2. Type Safety First
Use TypeScript to prevent runtime errors at compile time.

```typescript
// ❌ Bad: Using any
const handleData = (data: any) => {
  console.log(data.name); // Runtime error possible
};

// ✅ Good: Explicit type definition
interface UserData {
  id: string;
  name: string;
  email: string;
}

const handleData = (data: UserData) => {
  console.log(data.name); // Type-safe
};
```

## Project Structure

Use a domain-based modular structure.

```
src/
├── domain/              # Domain models and interfaces
│   ├── user/
│   │   ├── User.ts
│   │   ├── UserRepository.ts
│   │   └── types.ts
│   └── product/
│       ├── Product.ts
│       └── ProductRepository.ts
├── usecases/           # Business logic
│   ├── user/
│   │   ├── getUserProfile.ts
│   │   └── updateUserProfile.ts
│   └── product/
│       └── searchProducts.ts
├── infrastructure/     # External system integration
│   ├── api/
│   │   └── userApi.ts
│   └── repositories/
│       └── UserRepositoryImpl.ts
├── components/         # UI components
│   ├── common/        # Common components
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   ├── user/          # Domain-specific components
│   │   └── UserProfile/
│   └── product/
│       └── ProductCard/
├── hooks/             # Custom hooks
│   ├── useUser.ts
│   └── useProducts.ts
├── utils/             # Utility functions
└── __tests__/         # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

## Common Component Design

### Component Design Principles

1. **Single Responsibility**: One component, one responsibility
2. **Composition over Inheritance**: Prefer composition
3. **Reusability**: Flexible configuration through props

```typescript
// components/common/Button/Button.tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded font-medium transition';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
```

### Essential Common Components

Components you should create:

1. **Form Components**
   - Input
   - Select
   - Checkbox
   - Radio
   - TextArea
   - FormField (label + input + error message)

2. **Navigation**
   - Header
   - Sidebar
   - Breadcrumb
   - Tabs

3. **Feedback**
   - Modal
   - Toast
   - Alert
   - Spinner/Loading

4. **Data Display**
   - Table
   - Card
   - Badge
   - Avatar
   - Tooltip

5. **Layout**
   - Container
   - Grid
   - Flex
   - Spacing

```typescript
// Common Form component example
// components/common/FormField/FormField.tsx
export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  children,
}) => (
  <div className="mb-4">
    <label className="block mb-2 font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);
```

## Layout Guide

Effective ways to structure screen layouts.

### Flexbox-based Layout

```typescript
// components/common/Layout/FlexLayout.tsx
export interface FlexLayoutProps {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: number;
  children: React.ReactNode;
  className?: string;
}

export const FlexLayout: React.FC<FlexLayoutProps> = ({
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  gap = 4,
  children,
  className = '',
}) => {
  const directionClass = direction === 'column' ? 'flex-col' : 'flex-row';
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align];
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  }[justify];

  return (
    <div
      className={`flex ${directionClass} ${alignClass} ${justifyClass} gap-${gap} ${className}`}
    >
      {children}
    </div>
  );
};

// Usage example
export const UserDashboard = () => (
  <FlexLayout direction="column" gap={6}>
    <Header />
    <FlexLayout direction="row" gap={4}>
      <Sidebar />
      <main className="flex-1">
        <UserProfile />
      </main>
    </FlexLayout>
  </FlexLayout>
);
```

### Grid-based Layout

```typescript
// components/common/Layout/GridLayout.tsx
export interface GridLayoutProps {
  columns?: number | { sm?: number; md?: number; lg?: number };
  gap?: number;
  children: React.ReactNode;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  columns = 1,
  gap = 4,
  children,
}) => {
  const getColumnsClass = () => {
    if (typeof columns === 'number') {
      return `grid-cols-${columns}`;
    }
    return `
      grid-cols-${columns.sm || 1}
      md:grid-cols-${columns.md || columns.sm || 1}
      lg:grid-cols-${columns.lg || columns.md || columns.sm || 1}
    `;
  };

  return (
    <div className={`grid ${getColumnsClass()} gap-${gap}`}>
      {children}
    </div>
  );
};

// Usage example
export const ProductGrid = () => (
  <GridLayout columns={{ sm: 1, md: 2, lg: 3 }} gap={6}>
    {products.map(product => (
      <ProductCard key={product.id} product={product} />
    ))}
  </GridLayout>
);
```

## Testing Strategy

### Test Pyramid

**Analogy**: Like a pyramid, the base (unit tests) is wide, and the top (E2E) is narrow.

```
     /\
    /E2E\      ← Few (slow, expensive)
   /------\
  /Integration\ ← Medium
 /------------\
/  Unit Tests  \ ← Many (fast, cheap)
```

### 1. Unit Tests

Test individual functions or components.

```typescript
// utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

// __tests__/unit/utils/formatters.test.ts
import { formatCurrency } from '@/utils/formatters';

describe('formatCurrency', () => {
  it('should format number to Korean currency', () => {
    expect(formatCurrency(10000)).toBe('₩10,000');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('₩0');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-5000)).toBe('-₩5,000');
  });
});
```

### 2. Component Tests

Use React Testing Library.

```typescript
// components/user/UserProfile/UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('should display user information', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    };

    render(<UserProfile user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should handle edit button click', async () => {
    const mockOnEdit = jest.fn();
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' };

    render(<UserProfile user={mockUser} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });

  it('should show loading state', () => {
    render(<UserProfile isLoading />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 3. Integration Tests

Test how multiple components and hooks work together.

```typescript
// __tests__/integration/userFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserManagementPage } from '@/pages/UserManagement';
import { server } from '@/mocks/server';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('User Management Flow', () => {
  it('should create, edit, and delete user', async () => {
    render(<UserManagementPage />, { wrapper: createWrapper() });

    // 1. Create user
    const createButton = screen.getByRole('button', { name: /create user/i });
    await userEvent.click(createButton);

    await userEvent.type(screen.getByLabelText(/name/i), 'New User');
    await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    // 2. Verify user appears in list
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });

    // 3. Edit user
    const editButton = screen.getByRole('button', { name: /edit new user/i });
    await userEvent.click(editButton);
    
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated User');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Updated User')).toBeInTheDocument();
    });

    // 4. Delete user
    const deleteButton = screen.getByRole('button', { name: /delete updated user/i });
    await userEvent.click(deleteButton);
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText('Updated User')).not.toBeInTheDocument();
    });
  });
});
```

### 4. E2E Tests

Use Playwright or Cypress.

```typescript
// e2e/userManagement.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test('should complete full user lifecycle', async ({ page }) => {
    await page.goto('/users');

    // Create user
    await page.click('button:has-text("Create User")');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:has-text("Save")');

    // Verify creation
    await expect(page.locator('text=Test User')).toBeVisible();

    // Edit user
    await page.click('button:has-text("Edit Test User")');
    await page.fill('input[name="name"]', 'Updated User');
    await page.click('button:has-text("Save")');

    // Verify edit
    await expect(page.locator('text=Updated User')).toBeVisible();

    // Delete user
    await page.click('button:has-text("Delete Updated User")');
    await page.click('button:has-text("Confirm")');

    // Verify deletion
    await expect(page.locator('text=Updated User')).not.toBeVisible();
  });
});
```

## Mocking Strategy

### 1. MSW (Mock Service Worker) Setup

Mock API calls.

```typescript
// mocks/handlers.ts
import { rest } from 'msw';
import { mockUsers } from './data/users';

export const handlers = [
  // GET /api/users
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUsers));
  }),

  // GET /api/users/:id
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return res(ctx.status(404), ctx.json({ error: 'User not found' }));
    }
    
    return res(ctx.status(200), ctx.json(user));
  }),

  // POST /api/users
  rest.post('/api/users', async (req, res, ctx) => {
    const newUser = await req.json();
    return res(ctx.status(201), ctx.json({ ...newUser, id: Date.now().toString() }));
  }),

  // PUT /api/users/:id
  rest.put('/api/users/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const updates = await req.json();
    return res(ctx.status(200), ctx.json({ id, ...updates }));
  }),

  // DELETE /api/users/:id
  rest.delete('/api/users/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 2. Mock Data Management

Create type-safe mock data.

```typescript
// mocks/data/users.ts
import { User } from '@/domain/user/User';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
  },
];

// Mock data factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: Math.random().toString(36).substring(7),
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides,
});

// Usage examples
const adminUser = createMockUser({ role: 'admin' });
const customUser = createMockUser({ 
  name: 'Custom Name',
  email: 'custom@example.com' 
});
```

### 3. Fixture Management

Manage reusable test data.

```typescript
// __tests__/fixtures/users.ts
export const userFixtures = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
  },
  regular: {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user' as const,
  },
  guest: {
    id: '3',
    name: 'Guest User',
    email: 'guest@example.com',
    role: 'guest' as const,
  },
};

// Usage
import { userFixtures } from '@/tests/fixtures/users';

test('admin can access admin panel', () => {
  const { admin } = userFixtures;
  // ...
});
```

### 4. Hook Mocking

Mock custom hooks.

```typescript
// __tests__/unit/components/UserProfile.test.tsx
import { useUser } from '@/hooks/useUser';

jest.mock('@/hooks/useUser');

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

describe('UserProfile', () => {
  it('should display user data from hook', () => {
    mockUseUser.mockReturnValue({
      data: { id: '1', name: 'Test User', email: 'test@example.com' },
      isLoading: false,
      error: null,
    });

    render(<UserProfile userId="1" />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseUser.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<UserProfile userId="1" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

## Code Quality Management

### 1. ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 2. Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

### 3. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### 4. Husky + lint-staged

Set up automatic checks before commits.

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "bash -c 'tsc --noEmit'"
    ],
    "*.test.{ts,tsx}": [
      "jest --bail --findRelatedTests"
    ]
  }
}

// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

## Object-Oriented Principles

### SOLID Principles

#### 1. Single Responsibility Principle

```typescript
// ❌ Bad: Multiple responsibilities
class UserManager {
  saveUser(user: User) { /* DB save */ }
  sendEmail(user: User) { /* Email send */ }
  validateUser(user: User) { /* Validation */ }
}

// ✅ Good: Separated responsibilities
class UserRepository {
  save(user: User) { /* DB save only */ }
}

class EmailService {
  send(to: string, subject: string, body: string) { /* Email only */ }
}

class UserValidator {
  validate(user: User): ValidationResult { /* Validation only */ }
}
```

#### 2. Open/Closed Principle

```typescript
// Open for extension, closed for modification
interface PaymentStrategy {
  pay(amount: number): Promise<void>;
}

class CreditCardPayment implements PaymentStrategy {
  async pay(amount: number): Promise<void> {
    // Credit card payment
  }
}

class KakaoPayPayment implements PaymentStrategy {
  async pay(amount: number): Promise<void> {
    // KakaoPay payment
  }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}
  
  async processPayment(amount: number): Promise<void> {
    await this.strategy.pay(amount);
  }
}

// Add new payment method without modifying existing code
class NaverPayPayment implements PaymentStrategy {
  async pay(amount: number): Promise<void> {
    // NaverPay payment
  }
}
```

#### 3. Liskov Substitution Principle

```typescript
interface Bird {
  eat(): void;
}

interface FlyingBird extends Bird {
  fly(): void;
}

class Sparrow implements FlyingBird {
  eat(): void { /* ... */ }
  fly(): void { /* ... */ }
}

class Penguin implements Bird {
  eat(): void { /* ... */ }
  // No fly() - penguins don't implement FlyingBird
}
```

#### 4. Interface Segregation Principle

```typescript
// ❌ Bad: Interface too large
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

// ✅ Good: Segregated into smaller interfaces
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

class Human implements Workable, Eatable, Sleepable {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
}

class Robot implements Workable {
  work(): void { /* ... */ }
  // No need to implement eat, sleep
}
```

#### 5. Dependency Inversion Principle

```typescript
// ❌ Bad: Depends on concrete implementation
class UserService {
  private db = new MySQLDatabase(); // Depends on specific DB
  
  getUser(id: string) {
    return this.db.find(id);
  }
}

// ✅ Good: Depends on abstraction
interface Database {
  find(id: string): Promise<User | null>;
}

class UserService {
  constructor(private db: Database) {} // Depends on interface
  
  async getUser(id: string) {
    return await this.db.find(id);
  }
}

// Multiple DB implementations possible
class MySQLDatabase implements Database {
  async find(id: string): Promise<User | null> { /* ... */ }
}

class MongoDatabase implements Database {
  async find(id: string): Promise<User | null> { /* ... */ }
}
```

## Practical Checklist

### When Creating New Components
- [ ] Have you defined the domain model first?
- [ ] Are prop types clearly defined?
- [ ] Does it follow the Single Responsibility Principle?
- [ ] Have you utilized reusable common components?
- [ ] Have you written test cases?

### When Integrating APIs
- [ ] Are you using the Repository pattern?
- [ ] Is error handling appropriate?
- [ ] Have you set up MSW mocking?
- [ ] Are loading/error states handled?

### When Writing Tests
- [ ] Have you written unit tests?
- [ ] Have you tested important integration scenarios?
- [ ] Is mock data type-safe?
- [ ] Have you considered edge cases?

### Before Code Review
- [ ] Are there no ESLint errors?
- [ ] Are there no TypeScript errors?
- [ ] Do all tests pass?
- [ ] Are there no unnecessary console.logs?
- [ ] Are comments appropriate?

## Common Patterns

### Custom Hook Pattern

```typescript
// hooks/useUser.ts
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUser(userId),
  });
};

// hooks/useUsers.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers(),
  });
};

// hooks/useCreateUser.ts
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (user: CreateUserInput) => userApi.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

### Compound Component Pattern

```typescript
// components/common/Modal/Modal.tsx
interface ModalContextValue {
  isOpen: boolean;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const Modal = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <ModalContext.Provider value={{ isOpen, close: () => setIsOpen(false) }}>
      {children}
    </ModalContext.Provider>
  );
};

Modal.Trigger = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(ModalContext);
  return <div onClick={() => setIsOpen(true)}>{children}</div>;
};

Modal.Content = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, close } = useContext(ModalContext)!;
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
};

Modal.Close = ({ children }: { children: React.ReactNode }) => {
  const { close } = useContext(ModalContext)!;
  return <button onClick={close}>{children}</button>;
};

// Usage
<Modal>
  <Modal.Trigger>
    <button>Open Modal</button>
  </Modal.Trigger>
  <Modal.Content>
    <h2>Modal Title</h2>
    <p>Modal content</p>
    <Modal.Close>Close</Modal.Close>
  </Modal.Content>
</Modal>
```

### Render Props Pattern

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher<User> url="/api/users/1">
  {(user, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <Error message={error.message} />;
    return <UserProfile user={user!} />;
  }}
</DataFetcher>
```

## References

- [React Official Docs](https://react.dev/)
- [TypeScript Official Docs](https://www.typescriptlang.org/)
- [Testing Library](https://testing-library.com/)
- [MSW Official Docs](https://mswjs.io/)
- [React Query](https://tanstack.com/query/latest)

## Version History

- v1.0.0 (2025-01-16): Initial version
  - Domain modeling guide
  - Testing strategy
  - Common component patterns
  - Mocking strategy
  - Code quality management
  - Object-oriented principles