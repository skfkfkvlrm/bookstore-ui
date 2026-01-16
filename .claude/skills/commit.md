# Commit Skill

When invoked with `/commit`, create a well-formatted git commit.

## Process

1. Run `git status` to see changed files
2. Run `git diff --staged` and `git diff` to analyze changes
3. Run `git log -5 --oneline` to see recent commit style
4. Draft a commit message following the conventions below
5. Stage relevant files with `git add`
6. Create the commit

## Commit Message Format

```
<type>: <short description>

<optional body with details>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, whitespace)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependencies

## Guidelines

- Subject line: 50 characters or less
- Use imperative mood ("add feature" not "added feature")
- Focus on WHY, not just WHAT changed
- Do NOT commit `.env`, credentials, or secrets
- Do NOT use `--amend` unless explicitly requested
- Do NOT push unless explicitly requested

## Examples

```
feat: add dark mode toggle to settings page

fix: resolve null pointer in user authentication

chore: update dependencies to latest versions

refactor: extract validation logic into separate utility
```
