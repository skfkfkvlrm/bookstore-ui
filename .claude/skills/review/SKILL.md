---
name: review
description: Review code changes for quality and issues. Use when you need to review a PR, check code quality, or audit changes before merging.
---

# Code Review Skill

When invoked with `/review`, review code changes for quality and issues.

## Process

1. Get the diff of changes (`git diff` or PR diff)
2. Analyze for common issues
3. Provide constructive feedback

## Review Checklist

### Code Quality
- [ ] Clear naming conventions
- [ ] No magic numbers/strings
- [ ] Proper error handling
- [ ] No console.log left in production code

### React Best Practices
- [ ] Proper use of hooks
- [ ] Memoization where needed
- [ ] No prop drilling (use context if deep)
- [ ] Keys in lists

### TypeScript
- [ ] Proper type definitions
- [ ] No `any` types
- [ ] Interfaces for props

### Security
- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] XSS prevention

### Performance
- [ ] No unnecessary re-renders
- [ ] Lazy loading where appropriate
- [ ] Optimized images

## Output Format

```markdown
## Review Summary

### Issues Found
- 🔴 Critical: [description]
- 🟡 Warning: [description]
- 🔵 Suggestion: [description]

### Good Practices Observed
- [positive feedback]
```
