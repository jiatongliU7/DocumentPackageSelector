# Demo script (~2 min)

Use the URL your `next dev` prints (same port for page + API). Full screen browser, zoom ~100%.

---

## 0:00–0:15 — Open the app

**Do:** Open the home page. Point at **Case TEST-001** and the Buyer / Seller blocks.

**Say (example):**
> “This is a small escrow tool: pick which PDFs go into the buyer or seller package. Data is stored in memory on the server for the demo.”

---

## 0:15–0:50 — Buyer package + modal

**Do:** Click **Select documents** under Buyer. Wait for the list to load (should show counts, not 0 of 0).

**Say:**
> “Opening the buyer package. Documents are grouped by buyer, seller, and shared. Shared items appear in both packages.”

**Do:** Uncheck one **optional** row (e.g. a buyer-only doc). Watch the “x of y selected” line update.

**Say:**
> “I can turn optional docs off. Required items stay enforced.”

---

## 0:50–1:05 — Mandatory row

**Do:** Try to click a **required** checkbox (or show it’s disabled). Point at the “(required)” text.

**Say:**
> “Mandatory shared forms can’t be turned off in the UI, and the API rejects saves that skip them.”

---

## 1:05–1:25 — Bulk actions + save

**Do:** Click **Deselect all** (optionals off, required stay on), then **Select all** again. Click **Save** and close the modal.

**Say:**
> “Bulk actions clear optionals but keep required checked. Save persists the selection for this case and package type.”

---

## 1:25–1:45 — Persistence

**Do:** **Reload the page** (Cmd+R / F5). Open **Select documents** for Buyer again.

**Say:**
> “After refresh, reopening the modal shows the same selection — it’s coming back from the in-memory store.”

---

## 1:45–2:00 — Generate

**Do:** Click **Generate** on Buyer (or Seller). Show the **alert**, then open **DevTools → Console** and point at the logged keys.

**Say:**
> “Generate is a stub: it uses the current selection — everything if we never saved a partial — and logs the keys to the console plus this alert.”

**Stop.** (~2 minutes if you move quickly; trim pauses if you run long.)

---

## Checklist (matches the take-home)

- [ ] Open document selector  
- [ ] Select / deselect optional docs  
- [ ] Show mandatory can’t be deselected  
- [ ] Save  
- [ ] Reload + reopen → persistence  
- [ ] Generate → console + alert  

---

## If something breaks during recording

- Wrong port → use the port from the terminal; one `next dev` only.  
- “Not JSON” / empty list → refresh after the dev server is stable, or say you’ll cut and retry.
