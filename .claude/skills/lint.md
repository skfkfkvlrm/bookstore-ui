# Lint Skill

When invoked with `/lint`, run ESLint and fix issues.

## Process

1. Run `npm run lint` to check for issues
2. Analyze the output
3. Auto-fix what can be fixed
4. Report remaining issues that need manual review

## Common Fixes

- Unused imports - Remove them
- Missing dependencies in hooks - Add to dependency array
- Prefer const - Change let to const
- No explicit any - Add proper types
- React hooks rules - Fix hook ordering

## Commands

```bash
npm run lint           # Check for issues
npx eslint --fix .     # Auto-fix issues
```
