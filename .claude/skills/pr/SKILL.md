---
name: pr
description: Create a well-formatted GitHub pull request. Use when you need to create a PR with proper description and test plan.
---

# Pull Request Skill

When invoked with `/pr`, create a well-formatted GitHub pull request.

## Process

1. Run `git status` to check current branch state
2. Run `git log main..HEAD` to see all commits in this branch
3. Run `git diff main...HEAD` to see all changes
4. Push to remote if needed with `git push -u origin <branch>`
5. Create PR using `gh pr create`

## PR Format

```markdown
## Summary
- Brief bullet points describing what this PR does

## Test plan
- [ ] How to test the changes
- [ ] What to verify

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Guidelines

- Title should be concise and descriptive
- Summary focuses on WHAT and WHY
- Include test plan for reviewers
- Link related issues if applicable
