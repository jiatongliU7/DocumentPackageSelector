import type { Document } from "@/lib/types";

export const MOCK_MANIFEST: Document[] = [
  { key: "buyer-info-sheet", name: "Buyer Information Sheet", party: "buyer", mandatory: false },
  { key: "buyers-vesting", name: "Buyer's Vesting Form", party: "buyer", mandatory: false },
  { key: "firpta-buyer", name: "Buyer FIRPTA Declaration", party: "buyer", mandatory: false },
  { key: "prelim-approval", name: "Preliminary Report Approval", party: "buyer", mandatory: false },
  { key: "pcor", name: "Preliminary Change of Ownership Report", party: "buyer", mandatory: false },
  { key: "grant-deed", name: "Grant Deed", party: "seller", mandatory: false },
  {
    key: "commission-listing",
    name: "Commission Instructions - Listing Agent",
    party: "seller",
    mandatory: false,
  },
  { key: "firpta-affidavit", name: "FIRPTA Affidavit", party: "seller", mandatory: false },
  {
    key: "seller-property-info",
    name: "Seller's Property Information",
    party: "seller",
    mandatory: false,
  },
  { key: "certification-1099", name: "1099 Certification", party: "seller", mandatory: false },
  {
    key: "instructions-proceeds",
    name: "Instructions for Proceeds",
    party: "seller",
    mandatory: false,
  },
  {
    key: "supplemental-instructions",
    name: "Supplemental Escrow Instructions",
    party: "shared",
    mandatory: true,
  },
  { key: "general-provisions", name: "General Provisions", party: "shared", mandatory: true },
  {
    key: "e-sign-agreement",
    name: "Electronic Signature Agreement",
    party: "shared",
    mandatory: true,
  },
  {
    key: "confidential-info",
    name: "Confidential Information Statement",
    party: "shared",
    mandatory: false,
  },
  {
    key: "statement-of-information",
    name: "Statement of Information",
    party: "shared",
    mandatory: false,
  },
  { key: "privacy-notice", name: "Privacy Act Notice", party: "shared", mandatory: false },
  { key: "firpta-notice", name: "FIRPTA Notice", party: "shared", mandatory: false },
];

const selections = new Map<string, string[]>();

export function getSelectionKey(caseId: string, packageType: string): string {
  return `${caseId}:${packageType}`;
}

export function getSelection(caseId: string, packageType: string): string[] | null {
  return selections.get(getSelectionKey(caseId, packageType)) ?? null;
}

export function saveSelection(caseId: string, packageType: string, docs: string[]): void {
  selections.set(getSelectionKey(caseId, packageType), docs);
}
