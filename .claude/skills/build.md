# Build Skill

When invoked with `/build`, run the build process and fix any errors.

## Process

1. Run `npm run build` (which runs `tsc -b && vite build`)
2. If errors occur:
   - Parse the error messages
   - Fix TypeScript type errors
   - Fix import/export issues
   - Re-run build to verify
3. Report build success or remaining issues

## Common Fixes

### TypeScript Errors
- Missing type annotations
- Incorrect prop types
- Unused variables (prefix with `_`)
- Missing imports

### Vite Build Errors
- Asset import issues
- Environment variable problems
- Module resolution errors

## Commands

```bash
npm run build    # Full build
npm run dev      # Development server
npm run lint     # ESLint check
```
