import { MOCK_MANIFEST } from "@/lib/mock-data";
import type { Document, PackageKind } from "@/lib/types";

export function getDocumentsForPackage(packageType: PackageKind): Document[] {
  return MOCK_MANIFEST.filter(
    (d) => d.party === packageType || d.party === "shared",
  );
}
