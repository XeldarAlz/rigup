# Next.js App Router Conventions

## Architecture
- Server Components by default — only use `"use client"` when you need interactivity, browser APIs, or hooks
- Colocate `loading.tsx`, `error.tsx`, `not-found.tsx` alongside `page.tsx`
- Keep client components small and at leaf level
- Use layouts for shared UI, templates for per-page layouts that remount

## Data Fetching
- Fetch data in Server Components using `async/await`
- Use Server Actions for mutations (forms, updates, deletes)
- Cache and revalidate with `fetch` options or `unstable_cache`
- Use `generateStaticParams` for static generation of dynamic routes

## Routing
- File-based routing in `app/` directory
- Use Route Groups `(group)` for organization without affecting URL
- Use parallel routes `@slot` and intercepting routes `(.)` for modals
- API routes go in `app/api/*/route.ts`

## Performance
- Use `next/image` for all images (automatic optimization)
- Use `next/link` for all internal navigation (prefetching)
- Use `next/font` for font optimization
- Implement streaming with Suspense boundaries
- Use `dynamic = 'force-static'` for pages that can be prerendered

## Styling
- Use Tailwind CSS or CSS Modules
- Global styles in `app/globals.css`
- Component styles colocated as `*.module.css`
