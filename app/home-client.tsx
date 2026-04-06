"use client";

import { useCallback, useState } from "react";
import { DocumentPackageModal } from "@/components/DocumentPackageModal";
import { fetchJson } from "@/lib/fetch-json";
import type { DocumentSelectionGetResponse } from "@/lib/types";
import type { PackageKind } from "@/lib/types";

const CASE_ID = "TEST-001";

async function fetchEffectiveKeys(
  caseId: string,
  packageType: PackageKind,
): Promise<string[]> {
  const data = (await fetchJson(
    `/api/cases/${encodeURIComponent(caseId)}/document-selection?packageType=${packageType}`,
  )) as DocumentSelectionGetResponse;
  const allKeys = data.documents.map((d) => d.key);
  if (data.selectedDocuments === null) {
    return allKeys;
  }
  return data.selectedDocuments.filter((k) => allKeys.includes(k));
}

export default function HomeClient() {
  const [buyerOpen, setBuyerOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);

  const generate = useCallback(async (packageType: PackageKind) => {
    try {
      const keys = await fetchEffectiveKeys(CASE_ID, packageType);
      const label =
        packageType === "buyer" ? "Buyer package" : "Seller package";
      console.log(`[Generate] ${label} — document keys:`, keys);
      window.alert(
        `${label} would generate ${keys.length} document(s):\n\n${keys.join("\n")}`,
      );
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Generation failed");
    }
  }, []);

  return (
    <div className="relative min-h-full">
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <header className="mb-10 border-b border-white/10 pb-8 text-center sm:text-left">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-violet-300/75">
            Document packages
          </p>
          <h1 className="font-display text-4xl font-normal tracking-tight text-gradient-display sm:text-5xl">
            Case {CASE_ID}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400 sm:mx-0">
            Pick what goes in each package, save, then generate (stub: console +
            alert).
          </p>
        </header>

        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20 backdrop-blur-sm">
            <h2 className="text-sm font-medium text-slate-200">Buyer</h2>
            <p className="mt-1 text-sm text-slate-400">
              Buyer docs and anything marked shared.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBuyerOpen(true)}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-violet-900/35 transition hover:brightness-110"
              >
                Select documents
              </button>
              <button
                type="button"
                onClick={() => void generate("buyer")}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20 backdrop-blur-sm">
            <h2 className="text-sm font-medium text-slate-200">Seller</h2>
            <p className="mt-1 text-sm text-slate-400">
              Seller docs and shared (same shared list as buyer).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSellerOpen(true)}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-violet-900/35 transition hover:brightness-110"
              >
                Select documents
              </button>
              <button
                type="button"
                onClick={() => void generate("seller")}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      <DocumentPackageModal
        caseId={CASE_ID}
        packageType="buyer"
        open={buyerOpen}
        onClose={() => setBuyerOpen(false)}
        title="Buyer documents"
      />
      <DocumentPackageModal
        caseId={CASE_ID}
        packageType="seller"
        open={sellerOpen}
        onClose={() => setSellerOpen(false)}
        title="Seller documents"
      />
    </div>
  );
}
