---
name: vercel-react-best-practices
description: React performance optimization guidelines from Vercel Engineering. Use when writing components, implementing data fetching, reviewing code for performance, refactoring, or optimizing bundle sizes.
---

# Vercel React Best Practices

45 performance optimization rules for React applications, organized by priority.

## Priority 1: Eliminating Waterfalls (CRITICAL)

### Defer Await Until Needed
```typescript
// Avoid: Blocking code paths that don't need async
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)
  if (skipProcessing) return { skipped: true }
  return processUserData(userData)
}

// Use: Move await into branches where needed
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) return { skipped: true }
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

### Promise.all() for Independent Operations
```typescript
// Avoid: Sequential execution
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// Use: Parallel execution
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

### Prevent Waterfall in API Routes
```typescript
// Avoid: Sequential awaits blocking dependent operations
export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}

// Use: Start independent operations immediately
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([
    configPromise,
    fetchData(session.user.id)
  ])
  return Response.json({ data, config })
}
```

### Strategic Suspense Boundaries
```tsx
// Avoid: Entire layout blocked by data fetching
async function Page() {
  const data = await fetchData()
  return (
    <div>
      <Sidebar />
      <Header />
      <DataDisplay data={data} />
      <Footer />
    </div>
  )
}

// Use: Suspend only data-dependent components
function Page() {
  return (
    <div>
      <Sidebar />
      <Header />
      <Suspense fallback={<Skeleton />}>
        <DataDisplay />
      </Suspense>
      <Footer />
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData()
  return <div>{data.content}</div>
}
```

## Priority 2: Bundle Size Optimization (CRITICAL)

### Avoid Barrel File Imports
```tsx
// Avoid: Importing entire libraries through barrel exports
import { Check, X, Menu } from 'lucide-react'

// Use: Direct source imports
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
```

### Dynamic Imports for Heavy Components
```tsx
import dynamic from 'next/dynamic'

// Avoid: Bundling heavy component with main chunk
import { MonacoEditor } from './monaco-editor'

// Use: Lazy load on demand
const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)
```

### Conditional Module Loading
```tsx
// Use: Dynamic conditional imports
function AnimationPlayer({ enabled, setEnabled }: Props) {
  const [frames, setFrames] = useState<Frame[] | null>(null)

  useEffect(() => {
    if (enabled && !frames && typeof window !== 'undefined') {
      import('./animation-frames.js')
        .then(mod => setFrames(mod.frames))
        .catch(() => setEnabled(false))
    }
  }, [enabled, frames, setEnabled])

  if (!frames) return <Skeleton />
  return <Canvas frames={frames} />
}
```

### Preload Based on User Intent
```tsx
// Use: Preload on hover/focus
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}
```

## Priority 3: Server-Side Performance (HIGH)

### Per-Request Deduplication with React.cache()
```typescript
import { cache } from 'react'

// Avoid: Duplicate database queries in single request
export async function getCurrentUser() {
  return await db.user.findUnique({ where: { id: session.user.id } })
}

// Use: React.cache() for request deduplication
export const getCurrentUser = cache(async () => {
  return await db.user.findUnique({ where: { id: session.user.id } })
})
```

### Cross-Request LRU Caching
```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}
```

### Minimize Serialization at RSC Boundaries
```tsx
// Avoid: Passing entire objects with unused fields
async function Page() {
  const user = await fetchUser()  // 50 fields
  return <Profile user={user} />
}

// Use: Pass only needed fields
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}
```

## Priority 4: Client-Side Data Fetching (MEDIUM-HIGH)

### Use SWR for Automatic Deduplication
```tsx
import useSWR from 'swr'

// Avoid: Manual fetch without deduplication
function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers)
  }, [])
}

// Use: SWR for built-in deduplication
function UserList() {
  const { data: users } = useSWR('/api/users', fetcher)
  return <div>{users?.map(renderUser)}</div>
}
```

### Use Passive Event Listeners
```typescript
// Avoid: Blocking scroll with event listeners
document.addEventListener('touchstart', handleTouch)

// Use: Passive listeners
document.addEventListener('touchstart', handleTouch, { passive: true })
```

## Priority 5: Re-render Optimization (MEDIUM)

### Narrow Effect Dependencies
```typescript
// Avoid: Depending on entire objects
useEffect(() => {
  console.log(user.id)
}, [user])

// Use: Depend on primitives
useEffect(() => {
  console.log(user.id)
}, [user.id])
```

### Use Functional setState Updates
```tsx
// Avoid: State dependencies causing callback recreation
const addItems = useCallback((newItems: Item[]) => {
  setItems([...items, ...newItems])
}, [items])

// Use: Functional updates
const addItems = useCallback((newItems: Item[]) => {
  setItems(curr => [...curr, ...newItems])
}, [])
```

### Use Lazy State Initialization
```tsx
// Avoid: Running initializer on every render
const [settings, setSettings] = useState(
  JSON.parse(localStorage.getItem('settings') || '{}')
)

// Use: Function form for initializer
const [settings, setSettings] = useState(() => {
  const stored = localStorage.getItem('settings')
  return stored ? JSON.parse(stored) : {}
})
```

### Subscribe to Derived State
```tsx
// Avoid: Subscribing to continuous values
function Sidebar() {
  const width = useWindowWidth()
  const isMobile = width < 768
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}

// Use: Subscribe to derived boolean
function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

### Use Transitions for Non-Urgent Updates
```tsx
import { startTransition } from 'react'

// Use: Transitions for non-blocking updates
useEffect(() => {
  const handler = () => {
    startTransition(() => setScrollY(window.scrollY))
  }
  window.addEventListener('scroll', handler, { passive: true })
  return () => window.removeEventListener('scroll', handler)
}, [])
```

## Priority 6: Rendering Performance (MEDIUM)

### CSS content-visibility for Long Lists
```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

### Hoist Static JSX Elements
```tsx
// Avoid: Recreating static elements
function Container() {
  return <div>{loading && <div className="animate-pulse h-20 bg-gray-200" />}</div>
}

// Use: Extract static JSX
const loadingSkeleton = <div className="animate-pulse h-20 bg-gray-200" />

function Container() {
  return <div>{loading && loadingSkeleton}</div>
}
```

### Animate SVG Wrapper Instead of SVG Element
```tsx
// Avoid: Animating SVG directly
<svg className="animate-spin" width="24" height="24">...</svg>

// Use: Wrap and animate container
<div className="animate-spin">
  <svg width="24" height="24">...</svg>
</div>
```

### Use Explicit Conditional Rendering
```tsx
// Avoid: Rendering falsy values (renders "0" when count is 0)
{count && <span className="badge">{count}</span>}

// Use: Explicit ternary
{count > 0 ? <span className="badge">{count}</span> : null}
```

## Priority 7: JavaScript Performance (LOW-MEDIUM)

### Build Index Maps for Repeated Lookups
```typescript
// Avoid: Multiple .find() calls O(n) per lookup
return orders.map(order => ({
  ...order,
  user: users.find(u => u.id === order.userId)
}))

// Use: Build Map for O(1) lookups
const userById = new Map(users.map(u => [u.id, u]))
return orders.map(order => ({
  ...order,
  user: userById.get(order.userId)
}))
```

### Use Set for O(1) Lookups
```typescript
// Avoid: Array includes for repeated checks
const allowedIds = ['a', 'b', 'c']
items.filter(item => allowedIds.includes(item.id))

// Use: Set for O(1) lookup
const allowedIds = new Set(['a', 'b', 'c'])
items.filter(item => allowedIds.has(item.id))
```

### Combine Multiple Array Iterations
```typescript
// Avoid: Multiple filter/map calls
const admins = users.filter(u => u.isAdmin)
const testers = users.filter(u => u.isTester)

// Use: Single loop
const admins: User[] = []
const testers: User[] = []
for (const user of users) {
  if (user.isAdmin) admins.push(user)
  if (user.isTester) testers.push(user)
}
```

### Use toSorted() for Immutability
```typescript
// Avoid: Mutating array with .sort()
const sorted = users.sort((a, b) => a.name.localeCompare(b.name))

// Use: .toSorted() for immutability
const sorted = users.toSorted((a, b) => a.name.localeCompare(b.name))
```

### Early Return from Functions
```typescript
// Avoid: Processing all items after finding answer
function validateUsers(users: User[]) {
  let hasError = false
  for (const user of users) {
    if (!user.email) hasError = true
  }
  return hasError ? { valid: false } : { valid: true }
}

// Use: Early return
function validateUsers(users: User[]) {
  for (const user of users) {
    if (!user.email) return { valid: false, error: 'Email required' }
  }
  return { valid: true }
}
```

## Priority 8: Advanced Patterns (LOW)

### useLatest for Stable Callback Refs
```typescript
function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}

function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const onSearchRef = useLatest(onSearch)

  useEffect(() => {
    const timeout = setTimeout(() => onSearchRef.current(query), 300)
    return () => clearTimeout(timeout)
  }, [query])
}
```

## References

- [Vercel Engineering Blog](https://vercel.com/blog)
- [React Documentation](https://react.dev/)
- Source: [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
