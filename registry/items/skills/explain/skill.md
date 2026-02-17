---
name: "explain"
description: "Explain code with diagrams"
command: "/explain"
args: "[file or function]"
---

# /explain Skill

Explain code clearly with structured breakdowns.

## Usage
- `/explain src/auth/middleware.ts` — explain a file
- `/explain handleAuth` — explain a function
- `/explain` — explain the current context / recent changes

## Steps

1. Read the target file or find the target function
2. Identify the purpose and context (what system it's part of)
3. Break down the logic step by step
4. Identify key patterns and design decisions
5. Note any dependencies or side effects

## Output Format

### Overview
One paragraph explaining what this code does and why it exists.

### How It Works
Step-by-step walkthrough of the logic, referencing line numbers.

### Key Concepts
- Important patterns or abstractions used
- Non-obvious design decisions

### Data Flow
Describe how data enters, transforms, and exits.

### Dependencies
- What this code depends on
- What depends on this code

### Gotchas
- Edge cases to be aware of
- Common mistakes when modifying this code
