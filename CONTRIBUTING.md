# Contributing to rigup

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/xeldar/rigup.git
cd rigup

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Run in dev mode (watch)
pnpm dev
```

## Project Structure

```
src/
├── index.ts          # Entry point, Commander setup
├── commands/         # CLI commands (init, add, remove, list, search, update, doctor, info)
├── core/             # Business logic (installer, uninstaller, merger, tracker, backup, conflict)
├── registry/         # Registry client, cache, resolver
├── types/            # TypeScript type definitions
└── utils/            # Shared utilities (fs, paths, display, errors, constants)
```

## Making Changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Add or update tests
4. Run `pnpm test` and `pnpm typecheck` to verify
5. Commit using conventional commits (e.g., `feat:`, `fix:`, `docs:`)
6. Open a PR

## Code Style

- TypeScript with strict mode
- ESM modules (`.js` extensions in imports)
- Use existing patterns — look at similar code before writing new code
- Keep it simple — avoid over-engineering

## Reporting Issues

- Use the [bug report template](https://github.com/xeldar/rigup/issues/new?template=bug_report.yml)
- Include your rigup version, Node.js version, and OS
- Include steps to reproduce

## Feature Requests

- Use the [feature request template](https://github.com/xeldar/rigup/issues/new?template=feature_request.yml)
- Describe the problem you're trying to solve
- Propose a solution if you have one
