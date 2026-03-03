/**
 * hydrateTemplate.ts
 *
 * Transforms a backend GET /Template response into the frontend state shapes
 * used by CreateTemplate (BasicStep + BuilderStep).
 *
 * Handles:
 *  - Recursive subsection tree of unlimited depth
 *  - Safe JSON.parse for properties strings
 *  - Null / empty / malformed edge-cases
 *  - CustomToken mapping
 */

import type { TemplateSection, ApiCustomToken } from "../api/Templates";
import type {
  TenderTemplatePreviewSection,
  VendorResponsePayload,
} from "../api/Tenders";
import type { PreviewResponseValues } from "../components/tenders/ReadOnlyPreviewSection";
import type {
  CustomToken,
  ResponseProperties,
  TemplateBuilderSection,
} from "../components/shared/types";
import { ResponseTypeId, SectionTypeId } from "../constants";

// ── Helpers ────────────────────────────────────────────────────────────

/** Safely parse a JSON string into an object; returns undefined on failure. */
function safeParseProperties(
  raw: unknown
): ResponseProperties | undefined {
  if (!raw) return undefined;

  // Already parsed by RTK Query / JSON middleware
  if (typeof raw === "object") return raw as ResponseProperties;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    try {
      return JSON.parse(trimmed) as ResponseProperties;
    } catch {
      console.warn("[hydrateTemplate] Malformed properties JSON:", trimmed);
      return undefined;
    }
  }

  return undefined;
}

/** Check whether a numeric value is a valid ResponseTypeId. */
function isValidResponseType(
  value: number
): value is typeof ResponseTypeId[keyof typeof ResponseTypeId] {
  return ([
    ResponseTypeId.Text,
    ResponseTypeId.Numeric,
    ResponseTypeId.List,
  ] as number[]).includes(value);
}

/** Check whether a numeric value is a valid SectionTypeId. */
function isValidSectionType(
  value: number
): value is typeof SectionTypeId[keyof typeof SectionTypeId] {
  return (Object.values(SectionTypeId) as number[]).includes(value);
}

// ── Section hydration (recursive) ──────────────────────────────────────

/**
 * Recursively converts API sections → TemplateBuilderSection[].
 *
 * @param apiSections  Raw sections array from the backend (may be null/undefined)
 * @param fallbackStartOrder  Starting order if sectionOrder is missing
 */
export function hydrateApiSections(
  apiSections: TemplateSection[] | null | undefined,
  fallbackStartOrder = 1
): TemplateBuilderSection[] {
  if (!Array.isArray(apiSections) || apiSections.length === 0) return [];

  return apiSections.map((section, index) => {
    const order = section.sectionOrder || fallbackStartOrder + index;

    // ── Section type inference ────────────────────────────────────────
    const rawSectionType = Number(section.sectionId);
    const rawResponseType = Number(section.responseType);

    // Determine the section type: trust backend sectionId if valid,
    // otherwise infer from responseType presence.
    let sectionTypeId: typeof SectionTypeId[keyof typeof SectionTypeId];

    if (isValidSectionType(rawSectionType)) {
      sectionTypeId = rawSectionType;
    } else if (isValidResponseType(rawResponseType)) {
      sectionTypeId = SectionTypeId.Response;
    } else {
      sectionTypeId = SectionTypeId.Statement;
    }

    // ── Response type ────────────────────────────────────────────────
    const responseTypeId: typeof ResponseTypeId[keyof typeof ResponseTypeId] | undefined =
      sectionTypeId === SectionTypeId.Response && isValidResponseType(rawResponseType)
        ? rawResponseType
        : undefined;

    // ── Properties ───────────────────────────────────────────────────
    const properties = safeParseProperties(section.properties);

    // ── Acknowledgement statement ────────────────────────────────────
    const acknowledgementStatement =
      sectionTypeId === SectionTypeId.Acknowledgement
        ? typeof section.acknowledgementStatement === "string"
          ? section.acknowledgementStatement
          : section.acknowledgementStatement
            ? "I acknowledge"
            : ""
        : "";

    // ── Recursive subsections ────────────────────────────────────────
    const subsections = hydrateApiSections(section.subsections);

    return {
      id: section.sectionUniqueId || crypto.randomUUID(),
      sectionUniqueId: section.sectionUniqueId || undefined,
      sectionTypeId,
      order,
      title: section.title || "",
      content: section.content || "",
      responseTypeId,
      properties,
      acknowledgementStatement,
      signature: "",
      subsections: subsections.length > 0 ? subsections : undefined,
    } satisfies TemplateBuilderSection;
  });
}

// ── Custom token hydration ──────────────────────────────────────────────

/**
 * Converts API custom tokens → frontend CustomToken[] with generated IDs.
 */
export function hydrateCustomTokens(
  apiTokens: ApiCustomToken[] | { name: string; value: string }[] | null | undefined
): CustomToken[] {
  if (!Array.isArray(apiTokens) || apiTokens.length === 0) return [];

  return apiTokens.map((t) => ({
    id: crypto.randomUUID(),
    name: (t.name ?? "").trim(),
    value: (t.value ?? "").trim(),
  }));
}

// ── Tender section hydration (recursive) ────────────────────────────────

/**
 * Recursively converts Tender API sections → TemplateBuilderSection[].
 *
 * The tender response uses `tenderTempSectionId` instead of `sectionUniqueId`.
 * This function handles that mapping while reusing the same internal helpers
 * (safeParseProperties, isValidSectionType, isValidResponseType).
 */
export function hydrateTenderSections(
  apiSections: TenderTemplatePreviewSection[] | null | undefined,
  fallbackStartOrder = 1
): TemplateBuilderSection[] {
  if (!Array.isArray(apiSections) || apiSections.length === 0) return [];

  return apiSections.map((section, index) => {
    const order =
      typeof section.sectionOrder === "number" && section.sectionOrder > 0
        ? section.sectionOrder
        : fallbackStartOrder + index;

    // ── Section type inference ────────────────────────────────────────
    const rawSectionType = Number(section.sectionId);
    const rawResponseType = Number(section.responseType);

    let sectionTypeId: typeof SectionTypeId[keyof typeof SectionTypeId];

    if (isValidSectionType(rawSectionType)) {
      sectionTypeId = rawSectionType;
    } else if (isValidResponseType(rawResponseType)) {
      sectionTypeId = SectionTypeId.Response;
    } else {
      sectionTypeId = SectionTypeId.Statement;
    }

    // ── Response type ────────────────────────────────────────────────
    const responseTypeId =
      sectionTypeId === SectionTypeId.Response && isValidResponseType(rawResponseType)
        ? rawResponseType
        : undefined;

    // ── Properties ───────────────────────────────────────────────────
    const properties = safeParseProperties(section.properties);

    // ── Acknowledgement statement ────────────────────────────────────
    const acknowledgementStatement =
      sectionTypeId === SectionTypeId.Acknowledgement
        ? typeof section.acknowledgementStatement === "string"
          ? section.acknowledgementStatement
          : section.acknowledgementStatement
            ? "I acknowledge"
            : ""
        : "";

    // ── Recursive subsections ────────────────────────────────────────
    const subsections = hydrateTenderSections(section.subsections);

    const uniqueId = section.tenderTempSectionId || crypto.randomUUID();

    return {
      id: uniqueId,
      // Store as sectionUniqueId so the serializer can round-trip the ID
      sectionUniqueId: section.tenderTempSectionId || undefined,
      sectionTypeId,
      order,
      title: section.title || "",
      content: section.content || "",
      responseTypeId,
      properties,
      acknowledgementStatement,
      signature: typeof section.signature === "string" ? section.signature : "",
      subsections: subsections.length > 0 ? subsections : undefined,
    } satisfies TemplateBuilderSection;
  });
}

// ── Vendor section hydration (recursive) ────────────────────────────────

/**
 * Recursively converts Vendor response sections → TemplateBuilderSection[]
 * AND collects all existing `response` values into a flat
 * PreviewResponseValues map (keyed by the hydrated section `id`).
 *
 * This lets us reuse ReadOnlyPreviewSection with isEditable=true for the
 * vendor form without duplicating any recursion or rendering logic.
 */
export function hydrateVendorSections(
  apiSections: VendorResponsePayload[] | null | undefined,
  responseValues: PreviewResponseValues,
  fallbackStartOrder = 1
): TemplateBuilderSection[] {
  if (!Array.isArray(apiSections) || apiSections.length === 0) return [];

  return apiSections.map((section, index) => {
    const order =
      typeof section.sectionOrder === "number" && section.sectionOrder > 0
        ? section.sectionOrder
        : fallbackStartOrder + index;

    const rawSectionType = Number(section.sectionId);
    const rawResponseType = Number(section.responseType);

    let sectionTypeId: typeof SectionTypeId[keyof typeof SectionTypeId];
    if (isValidSectionType(rawSectionType)) {
      sectionTypeId = rawSectionType;
    } else if (isValidResponseType(rawResponseType)) {
      sectionTypeId = SectionTypeId.Response;
    } else {
      sectionTypeId = SectionTypeId.Statement;
    }

    const responseTypeId =
      sectionTypeId === SectionTypeId.Response && isValidResponseType(rawResponseType)
        ? rawResponseType
        : undefined;

    const properties = safeParseProperties(section.properties);

    const acknowledgementStatement =
      sectionTypeId === SectionTypeId.Acknowledgement
        ? typeof section.acknowledgementStatement === "string"
          ? section.acknowledgementStatement
          : section.acknowledgementStatement
            ? "I acknowledge"
            : ""
        : "";

    // Recurse into children
    const subsections = hydrateVendorSections(
      section.subsections,
      responseValues
    );

    const uniqueId = section.tenderTempSectionId || crypto.randomUUID();

    // ── Seed responseValues with existing vendor answers ─────────────
    if (section.response !== undefined && section.response !== null && section.response !== "") {
      // Acknowledgement: normalize string "true"/"false" to boolean
      if (sectionTypeId === SectionTypeId.Acknowledgement) {
        responseValues[uniqueId] =
          section.response === true || section.response === "true";
      } else {
        responseValues[uniqueId] = section.response;
      }
    }
    // For e-signature, also seed from signature field if response is empty
    if (
      sectionTypeId === SectionTypeId.ESignature &&
      !responseValues[uniqueId] &&
      typeof section.signature === "string" &&
      section.signature
    ) {
      responseValues[uniqueId] = section.signature;
    }

    return {
      id: uniqueId,
      sectionUniqueId: section.tenderTempSectionId || undefined,
      sectionTypeId,
      order,
      title: section.title || "",
      content: section.content || "",
      responseTypeId,
      properties,
      acknowledgementStatement,
      signature: typeof section.signature === "string" ? section.signature : "",
      subsections: subsections.length > 0 ? subsections : undefined,
    } satisfies TemplateBuilderSection;
  });
}
