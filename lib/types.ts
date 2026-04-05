export type DocumentParty = "buyer" | "seller" | "shared";

export interface Document {
  key: string;
  name: string;
  party: DocumentParty;
  mandatory: boolean;
}

export type PackageKind = "buyer" | "seller";

export interface PackageSelection {
  caseId: string;
  packageType: PackageKind;
  selectedDocuments: string[] | null;
}

export interface DocumentSelectionGetResponse {
  documents: Document[];
  selectedDocuments: string[] | null;
}

export interface DocumentSelectionPutBody {
  packageType: string;
  selectedDocuments: string[];
}

export interface DocumentSelectionPutSuccess {
  success: true;
}

export interface DocumentSelectionErrorBody {
  error: string;
  code?: string;
}
