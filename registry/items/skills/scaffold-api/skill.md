---
name: "scaffold-api"
description: "Scaffold REST endpoints"
command: "/scaffold-api"
args: "[resource]"
---

# /scaffold-api Skill

Scaffold a complete set of REST endpoints for a resource.

## Usage
- `/scaffold-api users` — scaffold CRUD endpoints for users
- `/scaffold-api posts` — scaffold CRUD endpoints for posts

## Steps

1. **Detect framework**: Identify if using Express, Fastify, Hono, Next.js API routes, etc.
2. **Detect patterns**: Read existing routes to match conventions (file structure, naming, middleware usage)
3. **Generate endpoints**:
   - `GET /[resource]` — list with pagination
   - `GET /[resource]/:id` — get by ID
   - `POST /[resource]` — create
   - `PUT /[resource]/:id` — update
   - `DELETE /[resource]/:id` — delete
4. **Add validation**: Input validation using the project's validation library (Zod, Joi, etc.)
5. **Add types**: TypeScript interfaces for request/response
6. **Add tests**: Basic test suite for each endpoint

## Guidelines
- Match existing project patterns exactly
- Include proper error handling (404, 400, 500)
- Add input validation for POST/PUT
- Use proper HTTP status codes
- Include pagination for list endpoints
