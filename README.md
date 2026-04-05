# Document Package Selector

Next.js (App Router) take-home: escrow officers choose which documents go into buyer vs seller packages. Mandatory shared documents cannot be deselected; the API validates every save.

## Scripts

```bash
npm run dev    # http://localhost:3000
npm run build
npm run test   # selection validation (Vitest)
npm run lint
```

## Project layout

- `lib/mock-data.ts` — manifest + in-memory selection store  
- `lib/selection-validation.ts` — PUT validation (tested)  
- `app/api/cases/[id]/document-selection/route.ts` — GET / PUT  
- `components/DocumentPackageModal.tsx` — selector UI (debounced save, focus trap)  
- `app/page.tsx` / `page-shell.tsx` / `home-client.tsx` — Case **TEST-001**, buyer/seller flows (home is client-only via `dynamic` `ssr: false` to avoid dev SSR/cache mismatches)  

See **NOTES.md** for assumptions and follow-ups.
