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
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <header className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <h1 className="text-xl font-semibold">Case {CASE_ID}</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Open a package, tick what you need, save. Generate is a stub (console
            + alert).
          </p>
        </header>

        <div className="space-y-6">
          <div className="rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-medium">Buyer</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Buyer docs and anything marked shared.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBuyerOpen(true)}
                className="rounded border border-zinc-800 bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
              >
                Select documents
              </button>
              <button
                type="button"
                onClick={() => void generate("buyer")}
                className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-medium">Seller</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Seller docs and shared (same shared list as buyer).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSellerOpen(true)}
                className="rounded border border-zinc-800 bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
              >
                Select documents
              </button>
              <button
                type="button"
                onClick={() => void generate("seller")}
                className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
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
