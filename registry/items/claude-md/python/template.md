# Python Project Conventions

## Type Hints
- Use type hints everywhere — function signatures, variables where non-obvious
- Use Python 3.10+ syntax: `str | None` instead of `Optional[str]`
- Use `from __future__ import annotations` for forward references
- Use `TypeAlias` for complex type definitions

## Code Style
- Format with ruff (or black + isort as fallback)
- Follow PEP 8: snake_case for functions/variables, PascalCase for classes
- Line length: 88 characters (black default)
- Use f-strings for string formatting
- Prefer pathlib.Path over os.path

## Data Structures
- Use dataclasses for simple data containers
- Use Pydantic for validated data (API inputs, configs)
- Prefer list/dict comprehensions over map/filter
- Use `enum.Enum` for fixed sets of values

## Error Handling
- Use specific exceptions, not bare `except:`
- Create custom exceptions for domain errors
- Use context managers (`with`) for resource management

## Testing
- Use pytest with descriptive test function names
- Fixtures for shared setup
- Parametrize for multiple test cases
- Mock at boundaries (network, filesystem, time)
