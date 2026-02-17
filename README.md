# rigup

> The package manager for Claude Code. Like shadcn/ui, but for AI configs.

[![npm version](https://img.shields.io/npm/v/rigup)](https://www.npmjs.com/package/rigup)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/XeldarAlz/rigup/actions/workflows/ci.yml/badge.svg)](https://github.com/XeldarAlz/rigup/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/node/v/rigup)](https://nodejs.org)

**rigup** is a curated registry of agents, skills, hooks, CLAUDE.md templates, MCP server configs, and settings for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Files are **copied** into your project (not installed as dependencies), so you own and can edit everything.

## Why rigup?

Setting up Claude Code for a new project means writing agents, configuring hooks, setting permissions, and crafting CLAUDE.md files from scratch every time. **rigup** gives you battle-tested configurations in one command.

- **One command setup** — `rig init` creates your `.claude/` directory and installs starter configs
- **Copy, don't depend** — files are copied into your project. No runtime dependencies, no lock-in
- **Community-driven** — browse and install from a growing registry of community-contributed items
- **Non-destructive** — automatic backups before any changes. `rig doctor` to verify integrity
- **Transparent** — every file is readable, editable, and version-controllable

## Quick Start

```bash
# Install globally
npm install -g rigup

# Initialize in your project
rig init

# Add items from the registry
rig add react-expert     # React/Next.js specialist agent
rig add auto-lint        # Auto-run linter on edits
rig add block-secrets    # Block edits to .env files
rig add typescript       # TypeScript CLAUDE.md template
```

## What You Get

| Type | Description | Location |
|------|-------------|----------|
| **Agents** | Specialized AI agent configurations | `.claude/agents/*.md` |
| **Skills** | Slash command workflows (`/commit`, `/pr-review`) | `.claude/skills/*.md` |
| **Hooks** | Pre/post tool-use automation (lint, test, block) | `.claude/hooks/*.sh` |
| **CLAUDE.md** | Project convention templates | `CLAUDE.md` sections |
| **MCP** | MCP server configurations | `.mcp.json` entries |
| **Settings** | Permission and settings fragments | `.claude/settings.json` |

## Commands

| Command | Description |
|---------|-------------|
| `rig init` | Interactive project setup — create `.claude/`, pick starter items |
| `rig add <name>` | Install an item from the registry |
| `rig remove <name>` | Remove an installed item and its files |
| `rig list` | List installed items (`--remote` for all available) |
| `rig search <query>` | Search the registry by name, tags, or description |
| `rig update [name]` | Update installed items to latest versions |
| `rig doctor` | Diagnose issues with your setup |
| `rig info <name>` | Show detailed info about a registry item |

### Options

```bash
rig add <name> --type <type>   # Filter by type (agent, skill, hook, etc.)
rig add <name> --dry-run       # Preview what would be installed
rig add <name> --force         # Force install, ignore conflicts
rig list --remote              # Show all registry items
rig list --json                # Output as JSON
rig update --all               # Update all installed items
```

## Popular Items

| Name | Type | Description |
|------|------|-------------|
| `react-expert` | Agent | React/Next.js specialist — components, hooks, RSC, performance |
| `code-reviewer` | Agent | Code review — quality, security, best practices (read-only) |
| `tdd-driver` | Agent | Test-driven development — write test first, implement, refactor |
| `commit` | Skill | Smart conventional commit — `/commit [message]` |
| `pr-review` | Skill | PR review workflow — `/pr-review [number]` |
| `auto-lint` | Hook | Auto-run linter after edits |
| `block-secrets` | Hook | Block edits to .env and credential files |
| `block-force-push` | Hook | Block `git push --force` |
| `typescript` | CLAUDE.md | TypeScript project conventions |
| `permissive` | Settings | Permissive dev — auto-allow safe operations |

## How It Works

1. **Browse** — Search the registry for agents, skills, hooks, and configs
2. **Install** — `rig add <name>` downloads and copies files into your project
3. **Own** — Edit anything. Files are yours. No hidden dependencies

```
your-project/
├── .claude/
│   ├── agents/
│   │   └── react-expert.md    ← copied from registry
│   ├── hooks/
│   │   └── auto-lint.sh       ← copied from registry
│   ├── skills/
│   │   └── commit.md          ← copied from registry
│   ├── settings.json          ← merged with registry settings
│   └── rig.json               ← tracks what's installed
├── .mcp.json                  ← merged with registry MCP configs
└── CLAUDE.md                  ← appended with registry sections
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Contributing Items to the Registry

Want to share your agents, skills, or hooks with the community? Add them to the `registry/items/` directory and open a PR.

## Philosophy

- **Copy, don't depend** — You should own your AI configurations. No runtime dependencies, no breaking updates.
- **Non-destructive** — Every operation creates backups. Nothing is lost.
- **Transparent** — Every file rigup creates is human-readable and editable.
- **Community-driven** — The registry grows through contributions. Share what works.
- **Minimal** — rigup itself has minimal dependencies. It's a tool, not a framework.

## License

MIT — see [LICENSE](LICENSE)
