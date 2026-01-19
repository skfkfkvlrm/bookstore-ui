---
name: web-design-guidelines
description: Audit UI code against 100+ rules covering accessibility, performance, and UX. Use when reviewing interfaces, checking accessibility, auditing design systems, or evaluating user experience.
---

# Web Interface Guidelines

Comprehensive UI code review checklist for React components, focused on accessibility, performance, and user experience.

## Accessibility

### Icon Buttons
- Icon buttons require `aria-label`
```tsx
// Avoid
<button onClick={onClose}><XIcon /></button>

// Use
<button onClick={onClose} aria-label="Close dialog"><XIcon /></button>
```

### Form Controls
- Form controls need labels or ARIA equivalents
- Never remove labels, use `sr-only` class for visual hiding
```tsx
// Avoid
<input type="email" placeholder="Email" />

// Use
<label>
  <span className="sr-only">Email address</span>
  <input type="email" placeholder="Email" />
</label>
```

### Interactive Elements
- Interactive elements need keyboard handlers (`onKeyDown`/`onKeyUp`)
```tsx
// Avoid
<div onClick={handleClick}>Clickable</div>

// Use
<button onClick={handleClick}>Clickable</button>
// or
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Clickable
</div>
```

### Semantic HTML
- Prefer semantic HTML over ARIA
- Use `<button>` not `<div role="button">`
- Use `<nav>` not `<div role="navigation">`

### Headings
- Hierarchical headings (h1 > h2 > h3)
- Include skip links for main content

## Focus States

### Visible Focus Indicators
- Visible focus indicators are mandatory
- `:focus-visible` preferred over `:focus`
```css
/* Avoid */
button:focus { outline: none; }

/* Use */
button:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

### Never Remove Outlines
- Never remove outlines without replacements

## Forms

### Input Attributes
- Inputs need `autocomplete`, proper `type` attributes, and `name` properties
```tsx
// Use
<input
  type="email"
  name="email"
  autoComplete="email"
/>
```

### Never Block Paste
- Never block paste (`onPaste` + `preventDefault`)
```tsx
// Never do this
<input onPaste={(e) => e.preventDefault()} />
```

### Labels Must Be Clickable
```tsx
// Use
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Error Handling
- Inline error messaging
- Focus first error field on form submission
```tsx
// Use
<input aria-invalid={!!error} aria-describedby="email-error" />
{error && <span id="email-error" role="alert">{error}</span>}
```

## Animation

### Reduced Motion
- Honor `prefers-reduced-motion`
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Properties
- Animate only `transform`/`opacity` for performance
- Avoid `transition: all`
```css
/* Avoid */
.button { transition: all 0.3s; }

/* Use */
.button { transition: transform 0.3s, opacity 0.3s; }
```

### Interruptible Animations
- Animations must be interruptible

## Typography

### Proper Characters
- Use ellipsis character (`…`) not three periods
- Use curly quotes (`"` `"`) not straight quotes
- Use non-breaking spaces where appropriate (`&nbsp;`)
```tsx
// Avoid
<span>Loading...</span>

// Use
<span>Loading…</span>
```

### Loading States
- Loading states end with `…`

### Tabular Numbers
- Use tabular numbers for columns
```css
.table-column {
  font-variant-numeric: tabular-nums;
}
```

## Content

### Text Handling
- Long text needs truncation/line-clamping
```css
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Empty States
- Handle empty state
- Anticipate variable user input lengths

## Images

### Required Attributes
- Explicit `width`/`height` required to prevent layout shift
```tsx
// Use
<img src={src} alt={alt} width={400} height={300} />
```

### Loading Strategy
- Lazy-load below-fold content
- Critical images use `priority` or `loading="eager"`
```tsx
// Below fold
<img src={src} loading="lazy" />

// Above fold / critical
<img src={src} loading="eager" fetchPriority="high" />
```

## Performance

### Large Lists
- Virtualize lists with >50 items (use `react-window` or `@tanstack/virtual`)

### DOM Operations
- Batch DOM operations

### Form Inputs
- Prefer uncontrolled inputs for forms where possible
```tsx
// Use ref for simple forms
const inputRef = useRef<HTMLInputElement>(null)
const handleSubmit = () => console.log(inputRef.current?.value)
```

### CDN Preconnect
- Preconnect to CDN domains
```html
<link rel="preconnect" href="https://cdn.example.com" />
```

## Navigation

### URL State
- URL reflects state (filters, tabs, pagination)
- Deep-link stateful UI
```tsx
// Use searchParams for filter state
const [searchParams, setSearchParams] = useSearchParams()
const filter = searchParams.get('filter') || 'all'
```

### Destructive Actions
- Destructive actions require confirmation
```tsx
const handleDelete = () => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    deleteItem()
  }
}
```

## Touch

### Touch Behavior
- `touch-action: manipulation` to remove 300ms delay
```css
button, a {
  touch-action: manipulation;
}
```

### Modal Scroll
- `overscroll-behavior: contain` in modals
```css
.modal {
  overscroll-behavior: contain;
}
```

### Drag Operations
- Disable text selection during drag
```css
.dragging {
  user-select: none;
}
```

## Theming / Dark Mode

### Color Scheme
- Set `color-scheme: dark` for dark mode
```css
:root {
  color-scheme: light dark;
}

[data-theme="dark"] {
  color-scheme: dark;
}
```

### Native Elements
- Explicit colors for native selects in dark mode

### Theme Meta Tag
- `theme-color` meta tag
```html
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
```

## Internationalization (i18n)

### Formatting
- Use `Intl.DateTimeFormat` for dates
- Use `Intl.NumberFormat` for numbers/currency
```typescript
// Use
const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date)

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
```

### Language Detection
- Detect language via headers, not IP

## Hydration

### Form Values
- Use `defaultValue` or pair `value` with `onChange`
```tsx
// Avoid (hydration mismatch)
<input value={value} />

// Use
<input defaultValue={value} />
// or
<input value={value} onChange={handleChange} />
```

### Date/Time Rendering
- Guard date/time rendering mismatches between server and client
```tsx
// Use
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

if (!mounted) return <Skeleton />
return <span>{formatDate(date)}</span>
```

## Output Format

When reviewing code, group findings by file using `file:line` format:
```
src/components/Button.tsx:15 - Missing aria-label on icon button
src/components/Modal.tsx:42 - Missing overscroll-behavior: contain
src/pages/Home.tsx:23 - Image missing width/height attributes
```

State issue concisely. Omit explanation unless non-obvious.

## References

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [MDN Web Docs](https://developer.mozilla.org/)
- Source: [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)
