---
name: "pr-review"
description: "PR review workflow"
command: "/pr-review"
args: "[number]"
---

# /pr-review Skill

Review a GitHub pull request thoroughly and provide structured feedback.

## Usage
- `/pr-review 123` — review PR #123
- `/pr-review` — review the current branch's PR

## Steps

1. Get PR details: `gh pr view [number] --json title,body,files,additions,deletions`
2. Get the diff: `gh pr diff [number]`
3. Read each changed file to understand context
4. Analyze changes for:
   - Correctness: logic errors, edge cases, off-by-one
   - Security: injection, auth issues, exposed secrets
   - Performance: N+1 queries, unnecessary re-renders, memory leaks
   - Style: naming, consistency with codebase conventions
   - Testing: adequate coverage, meaningful assertions
5. Provide structured review with severity levels

## Output Format
```
## PR Review: #[number] - [title]

### Summary
[1-2 sentence summary of the changes]

### Findings
- [critical/warning/suggestion] file:line — description

### Verdict
[approve/request-changes/comment]
```
