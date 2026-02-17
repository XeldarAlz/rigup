# Rust Project Conventions

## Error Handling
- Use `Result<T, E>` for all fallible operations
- Use `thiserror` for library error types with structured variants
- Use `anyhow` for application-level error propagation
- Use `?` operator for error propagation, avoid `.unwrap()` in production code

## Code Style
- Run `cargo fmt` before committing
- Enable `clippy` with pedantic lints: `#![warn(clippy::pedantic)]`
- Prefer iterators and combinators over manual loops
- Use `derive` macros: `Debug`, `Clone`, `PartialEq`, `Eq`, `Hash` as appropriate
- Keep `unsafe` blocks minimal, document invariants

## Patterns
- Use builder pattern for complex struct construction
- Use newtype pattern for type safety: `struct UserId(u64)`
- Prefer `impl Trait` over `dyn Trait` when possible
- Use `Cow<str>` when ownership is conditional

## Testing
- Unit tests in the same file: `#[cfg(test)] mod tests`
- Integration tests in `tests/` directory
- Use `#[should_panic]` for expected failures
- Property-based testing with `proptest` for complex invariants
