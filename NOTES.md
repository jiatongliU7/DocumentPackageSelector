# Notes

## Assumptions

- `selectedDocuments: null` means “all documents in the filtered list are selected.” The UI initializes every checkbox as checked in that case.
- Saving persists an explicit `string[]` of checked document keys.
- Duplicate keys in a PUT body are rejected.
- The in-memory store resets when the Node process restarts.

## What I would improve with more time

- E2E tests (Playwright) for the modal and API.
- Stronger focus management (e.g. focus the primary action when opening).

## Time spent

_(Fill in before submitting.)_

## Troubleshooting

The home UI is loaded with `next/dynamic` and **`ssr: false`** (`app/page-shell.tsx` → `home-client.tsx`) so the main interactive tree is not server-rendered. That avoids hydration mismatches when the dev server briefly serves an older SSR snapshot than the client bundle (a common issue with Turbopack hot reload).

If you still see odd caching: stop `next dev`, run `rm -rf .next`, restart, hard-refresh. Try disabling browser extensions that inject markup.

If the modal shows **HTML / Internal Server Error** when parsing JSON: the browser is probably talking to the **wrong port** (e.g. page on `localhost:3000` while `next dev` bound to `3001`). Use **only** the URL printed in the terminal after `next dev`, or stop every `next dev` and start one server.

## PDF requirements (self-check)

| Area | Status |
|------|--------|
| `Document` / `PackageSelection` model | `lib/types.ts` |
| `GET /api/cases/[id]/document-selection?packageType=` — filtered docs + selection | Implemented |
| `PUT` — validate keys, mandatory, package type; in-memory store | Implemented |
| Modal: grouped by party, checkboxes, required disabled + label, bulk actions, counter, save, loading, errors | Implemented |
| Page: Case TEST-001, buyer/seller, Select + Generate (console/alert) | Implemented |
| Stack: Next App Router, TS, Tailwind, no DB | Yes |
| Submission (GitHub, video, email) | Manual |

