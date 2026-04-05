import { NextResponse } from "next/server";
import { getDocumentsForPackage } from "@/lib/document-manifest";
import { getSelection, saveSelection } from "@/lib/mock-data";
import { validateSelection } from "@/lib/selection-validation";
import type { PackageKind } from "@/lib/types";

function isPackageKind(value: string): value is PackageKind {
  return value === "buyer" || value === "seller";
}

async function resolveCaseId(
  request: Request,
  context: {
    params?: Promise<Record<string, string | string[] | undefined>>;
  },
): Promise<string | null> {
  try {
    if (context.params) {
      const p = await context.params;
      const raw = p.id;
      if (typeof raw === "string" && raw.length > 0) {
        return raw;
      }
      if (Array.isArray(raw) && typeof raw[0] === "string") {
        return raw[0];
      }
    }
  } catch {
    // fall through to pathname parse
  }
  const m = new URL(request.url).pathname.match(
    /\/api\/cases\/([^/]+)\/document-selection/,
  );
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

export async function GET(
  request: Request,
  context: {
    params?: Promise<Record<string, string | string[] | undefined>>;
  },
) {
  const id = await resolveCaseId(request, context);
  if (!id) {
    return NextResponse.json(
      { error: "Missing case id", code: "MISSING_CASE_ID" },
      { status: 400 },
    );
  }
  const { searchParams } = new URL(request.url);
  const packageType = searchParams.get("packageType");

  if (!packageType || !isPackageKind(packageType)) {
    return NextResponse.json(
      {
        error: "packageType must be buyer or seller",
        code: "INVALID_PACKAGE_TYPE",
      },
      { status: 400 },
    );
  }

  const documents = getDocumentsForPackage(packageType);
  const selectedDocuments = getSelection(id, packageType);

  return NextResponse.json({
    documents,
    selectedDocuments,
  });
}

export async function PUT(
  request: Request,
  context: {
    params?: Promise<Record<string, string | string[] | undefined>>;
  },
) {
  const id = await resolveCaseId(request, context);
  if (!id) {
    return NextResponse.json(
      { error: "Missing case id", code: "MISSING_CASE_ID" },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_JSON" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be an object", code: "INVALID_BODY" },
      { status: 400 },
    );
  }

  const record = body as Record<string, unknown>;
  const packageType = record.packageType;
  const selectedDocuments = record.selectedDocuments;

  if (typeof packageType !== "string" || !isPackageKind(packageType)) {
    return NextResponse.json(
      {
        error: "packageType must be buyer or seller",
        code: "INVALID_PACKAGE_TYPE",
      },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(selectedDocuments) ||
    !selectedDocuments.every((item): item is string => typeof item === "string")
  ) {
    return NextResponse.json(
      {
        error: "selectedDocuments must be an array of strings",
        code: "INVALID_SELECTION",
      },
      { status: 400 },
    );
  }

  const validation = validateSelection(selectedDocuments, packageType);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.message, code: validation.code },
      { status: 400 },
    );
  }

  saveSelection(id, packageType, selectedDocuments);

  return NextResponse.json({ success: true });
}
