"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchJson } from "@/lib/fetch-json";
import type { Document } from "@/lib/types";
import type { DocumentParty, PackageKind } from "@/lib/types";

const PARTY_ORDER: DocumentParty[] = ["buyer", "seller", "shared"];

const PARTY_LABEL: Record<DocumentParty, string> = {
  buyer: "Buyer",
  seller: "Seller",
  shared: "Shared",
};

const DEBOUNCE_MS = 600;

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

type SyncStatus = "idle" | "syncing" | "saved" | "error";

function serializeKeys(keys: string[]): string {
  return [...keys].sort().join("\0");
}

export interface DocumentPackageModalProps {
  caseId: string;
  packageType: PackageKind;
  open: boolean;
  onClose: () => void;
  title: string;
}

export function DocumentPackageModal({
  caseId,
  packageType,
  open,
  onClose,
  title,
}: DocumentPackageModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveGenerationRef = useRef(0);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const baselineSerializedRef = useRef<string | null>(null);
  const latestSelectedKeysRef = useRef<string[]>([]);
  const runAutosaveRef = useRef<(keys: string[]) => void>(() => {});
  const wasOpenedRef = useRef(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  const allKeys = useMemo(() => documents.map((d) => d.key), [documents]);
  const mandatoryKeys = useMemo(
    () => new Set(documents.filter((d) => d.mandatory).map((d) => d.key)),
    [documents],
  );

  const selectedKeysArray = useMemo(
    () => allKeys.filter((k) => selected.has(k)),
    [allKeys, selected],
  );

  latestSelectedKeysRef.current = selectedKeysArray;

  const putSelection = useCallback(
    async (keys: string[], generation: number): Promise<boolean> => {
      await fetchJson(
        `/api/cases/${encodeURIComponent(caseId)}/document-selection`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageType,
            selectedDocuments: keys,
          }),
        },
      );
      if (generation !== saveGenerationRef.current) {
        return false;
      }
      return true;
    },
    [caseId, packageType],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSyncStatus("idle");
    try {
      const data = await fetchJson(
        `/api/cases/${encodeURIComponent(caseId)}/document-selection?packageType=${packageType}`,
      );
      const parsed = data as {
        documents: Document[];
        selectedDocuments: string[] | null;
      };
      setDocuments(parsed.documents);
      const keys = parsed.documents.map((d) => d.key);
      let nextSelected: Set<string>;
      if (parsed.selectedDocuments === null) {
        nextSelected = new Set(keys);
      } else {
        nextSelected = new Set(parsed.selectedDocuments);
      }
      setSelected(nextSelected);
      baselineSerializedRef.current = serializeKeys(
        keys.filter((k) => nextSelected.has(k)),
      );
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [caseId, packageType]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const runAutosave = useCallback(
    (keys: string[]) => {
      saveGenerationRef.current += 1;
      const generation = saveGenerationRef.current;
      setSyncStatus("saved");
      setError(null);
      void (async () => {
        try {
          const ok = await putSelection(keys, generation);
          if (!ok) return;
          baselineSerializedRef.current = serializeKeys(keys);
          setDirty(false);
          setSyncStatus("saved");
          setError(null);
        } catch (e) {
          if (generation !== saveGenerationRef.current) return;
          setSyncStatus("error");
          setError(e instanceof Error ? e.message : "Sync failed");
        }
      })();
    },
    [putSelection],
  );

  runAutosaveRef.current = runAutosave;

  useEffect(() => {
    if (!open || loading || documents.length === 0 || !dirty) {
      return;
    }
    const serialized = serializeKeys(selectedKeysArray);
    if (serialized === baselineSerializedRef.current) {
      setDirty(false);
      clearDebounce();
      return;
    }
    clearDebounce();
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      runAutosaveRef.current(latestSelectedKeysRef.current);
    }, DEBOUNCE_MS);
    return () => {
      clearDebounce();
    };
  }, [
    open,
    loading,
    documents.length,
    dirty,
    selectedKeysArray,
    clearDebounce,
  ]);

  const grouped = useMemo(() => {
    const byParty = new Map<DocumentParty, Document[]>();
    for (const d of documents) {
      const list = byParty.get(d.party) ?? [];
      list.push(d);
      byParty.set(d.party, list);
    }
    return PARTY_ORDER.filter((p) => (byParty.get(p)?.length ?? 0) > 0).map(
      (party) => ({
        party,
        label: PARTY_LABEL[party],
        docs: byParty.get(party)!,
      }),
    );
  }, [documents]);

  const selectedCount = useMemo(() => {
    let n = 0;
    for (const k of allKeys) {
      if (selected.has(k)) n += 1;
    }
    return n;
  }, [allKeys, selected]);

  const markDirty = useCallback(() => {
    setDirty(true);
  }, []);

  const toggle = (key: string, mandatory: boolean) => {
    if (mandatory) return;
    markDirty();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    markDirty();
    setSelected(new Set(allKeys));
  };

  const deselectAll = () => {
    markDirty();
    setSelected(new Set(mandatoryKeys));
  };

  const handleSave = async () => {
    clearDebounce();
    setManualSaving(true);
    setError(null);
    saveGenerationRef.current += 1;
    const generation = saveGenerationRef.current;
    setSyncStatus("syncing");
    try {
      const keys = allKeys.filter((k) => selected.has(k));
      const ok = await putSelection(keys, generation);
      if (!ok) return;
      baselineSerializedRef.current = serializeKeys(keys);
      setDirty(false);
      setSyncStatus("saved");
      onClose();
    } catch (e) {
      setSyncStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setManualSaving(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    wasOpenedRef.current = true;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = getFocusable(panel);
      focusables[0]?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (open) return;
    if (!wasOpenedRef.current) return;
    const el = returnFocusRef.current;
    queueMicrotask(() => {
      el?.focus?.();
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        onClose();
        return;
      }
      if (ev.key !== "Tab" || !panelRef.current) return;
      const panel = panelRef.current;
      const focusables = getFocusable(panel);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (ev.shiftKey) {
        if (active === first || !panel.contains(active)) {
          ev.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        ev.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const syncHint =
    error || syncStatus === "error"
      ? null
      : syncStatus === "syncing"
        ? "Saving…"
        : syncStatus === "saved"
          ? "Saved"
          : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-[2px]"
        onClick={onClose}
        role="presentation"
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0f1419]/95 shadow-2xl shadow-black/40 outline-none backdrop-blur-md"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-lg font-medium tracking-tight text-slate-100"
            >
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {selectedCount} of {allKeys.length} selected
            </p>
            {syncHint ? (
              <p className="mt-1 text-xs text-slate-500" role="status" aria-live="polite">
                {syncHint}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
            aria-label="Close"
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={loading || manualSaving || allKeys.length === 0}
            className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={deselectAll}
            disabled={loading || manualSaving || allKeys.length === 0}
            className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50"
          >
            Deselect all
          </button>
        </div>

        {error ? (
          <div
            className="mx-4 mt-3 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
              <Spinner className="h-6 w-6 text-violet-400/80" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {grouped.map(({ party, label, docs }) => (
                <section key={party} aria-labelledby={`${titleId}-${party}`}>
                  <h3
                    id={`${titleId}-${party}`}
                    className="mb-2 text-sm font-medium text-slate-300"
                  >
                    {label}
                  </h3>
                  <ul className="divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10">
                    {docs.map((doc) => {
                      const id = `${titleId}-${doc.key}`;
                      const isOn = selected.has(doc.key);
                      return (
                        <li
                          key={doc.key}
                          className="flex items-start gap-2 bg-white/[0.03] px-3 py-2"
                        >
                          <input
                            id={id}
                            type="checkbox"
                            checked={isOn}
                            disabled={doc.mandatory || manualSaving}
                            onChange={() => toggle(doc.key, doc.mandatory)}
                            className="mt-0.5 h-4 w-4 rounded border-white/25 bg-white/5 text-violet-500 accent-violet-500 focus:ring-1 focus:ring-violet-400/50 disabled:cursor-not-allowed disabled:opacity-70"
                            aria-describedby={doc.mandatory ? `${id}-req` : undefined}
                          />
                          <div className="min-w-0 flex-1">
                            <label htmlFor={id} className="cursor-pointer text-sm text-slate-200">
                              {doc.name}
                            </label>
                            {doc.mandatory ? (
                              <span id={`${id}-req`} className="ml-1.5 text-xs text-violet-300/70">
                                (required)
                              </span>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 bg-black/20 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={manualSaving}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={loading || manualSaving || allKeys.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-violet-900/30 hover:brightness-110 disabled:opacity-50"
          >
            {manualSaving ? (
              <>
                <Spinner className="h-4 w-4" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
