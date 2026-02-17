# TypeScript Project Conventions

## Type Safety
- Strict mode enabled — no implicit any, strict null checks
- Prefer `interface` for object shapes, `type` for unions and intersections
- Use discriminated unions for state: `type State = { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: Error }`
- No `any` — use `unknown` and narrow with type guards
- Use `satisfies` operator for type-safe object literals

## Patterns
- Barrel exports (`index.ts`) for public module APIs
- Keep types close to usage — colocate, don't centralize everything
- Generic constraints for reusable utilities: `function merge<T extends object>(a: T, b: Partial<T>): T`
- Use `as const` for literal types and readonly tuples
- Prefer `Record<K, V>` over `{ [key: string]: V }`

## Error Handling
- Use typed errors: extend Error with additional context
- Prefer Result types for expected failures: `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }`
- Reserve try/catch for unexpected errors

## Naming
- PascalCase: types, interfaces, enums, classes, components
- camelCase: variables, functions, methods, properties
- UPPER_SNAKE_CASE: constants, environment variables
- Prefix interfaces with context, not `I`: `UserService` not `IUserService`
