import { getDocumentsForPackage } from "@/lib/document-manifest";
import type { PackageKind } from "@/lib/types";

export type SelectionValidationErrorCode =
  | "UNKNOWN_KEY"
  | "DUPLICATE_KEY"
  | "MISSING_MANDATORY";

export type SelectionValidationResult =
  | { ok: true }
  | { ok: false; message: string; code: SelectionValidationErrorCode };

export function validateSelection(
  selectedKeys: string[],
  packageType: PackageKind,
): SelectionValidationResult {
  const docs = getDocumentsForPackage(packageType);
  const validKeys = new Set(docs.map((d) => d.key));
  const seen = new Set<string>();

  for (const key of selectedKeys) {
    if (seen.has(key)) {
      return {
        ok: false,
        message: `Duplicate document key: ${key}`,
        code: "DUPLICATE_KEY",
      };
    }
    seen.add(key);
    if (!validKeys.has(key)) {
      return {
        ok: false,
        message: `Unknown document key: ${key}`,
        code: "UNKNOWN_KEY",
      };
    }
  }

  for (const doc of docs) {
    if (doc.mandatory && !seen.has(doc.key)) {
      return {
        ok: false,
        message: `Missing mandatory document: ${doc.key}`,
        code: "MISSING_MANDATORY",
      };
    }
  }

  return { ok: true };
}
