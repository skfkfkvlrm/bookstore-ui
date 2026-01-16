# Code Generation Skill

When invoked with `/generate`, help generate React + TypeScript + Tailwind CSS code following this project's patterns.

## Project Structure

- `src/admin/` - Admin pages and layout
- `src/client/` - Client pages and layout
- `src/shared/components/common/` - Shared reusable components
- `src/shared/types/` - TypeScript type definitions
- `src/shared/data/` - Mock JSON data
- `src/shared/utils/` - Utility functions

## Code Style Guidelines

### Components

1. Use functional components with TypeScript
2. Use default exports
3. Props interface should extend HTML attributes when appropriate
4. Use Tailwind CSS for styling with project's color scheme (`#1173d4` for primary blue)
5. Support dark mode with `dark:` variants

```tsx
import { type HTMLAttributes, type ReactNode } from "react";

interface ComponentNameProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
}

const ComponentName = ({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentNameProps) => {
  return (
    <div className={`base-styles ${className}`} {...props}>
      {children}
    </div>
  );
};

export default ComponentName;
```

### Pages

1. Use `useState` for local state
2. Use `useNavigate` from react-router-dom for navigation
3. Import shared components from `../../../shared/components/common/`
4. Import types from `../../../shared/types`

### Types

Define interfaces in `src/shared/types/index.ts`:

```typescript
export interface EntityName {
  id: number;
  name: string;
  createdAt: string;
}
```

## Generation Options

When user asks to generate code, ask what they want:

1. **Component** - A reusable UI component in `src/shared/components/common/`
2. **Admin Page** - A new page in `src/admin/pages/`
3. **Client Page** - A new page in `src/client/pages/`
4. **Type Definition** - Add types to `src/shared/types/index.ts`
5. **Utility Function** - Helper in `src/shared/utils/`

## Process

1. Ask what type of code to generate
2. Ask for the name and purpose
3. Generate the code following the project patterns
4. Place the file in the correct directory
5. Update imports/routes if needed
