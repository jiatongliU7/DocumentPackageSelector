import { describe, expect, it } from "vitest";
import { validateSelection } from "@/lib/selection-validation";

describe("validateSelection", () => {
  it("accepts a valid full buyer selection", () => {
    const keys = [
      "buyer-info-sheet",
      "buyers-vesting",
      "firpta-buyer",
      "prelim-approval",
      "pcor",
      "supplemental-instructions",
      "general-provisions",
      "e-sign-agreement",
      "confidential-info",
      "statement-of-information",
      "privacy-notice",
      "firpta-notice",
    ];
    expect(validateSelection(keys, "buyer")).toEqual({ ok: true });
  });

  it("rejects unknown keys for the package", () => {
    const result = validateSelection(["grant-deed"], "buyer");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("UNKNOWN_KEY");
    }
  });

  it("rejects duplicate keys", () => {
    const result = validateSelection(
      ["buyer-info-sheet", "buyer-info-sheet"],
      "buyer",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("DUPLICATE_KEY");
    }
  });

  it("rejects missing mandatory shared documents", () => {
    const keys = ["buyer-info-sheet", "pcor"];
    const result = validateSelection(keys, "buyer");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("MISSING_MANDATORY");
    }
  });

  it("accepts seller package with mandatory shared plus one seller doc", () => {
    const keys = [
      "grant-deed",
      "supplemental-instructions",
      "general-provisions",
      "e-sign-agreement",
    ];
    expect(validateSelection(keys, "seller")).toEqual({ ok: true });
  });
});
