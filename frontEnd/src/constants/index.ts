

export const PAGE_SIZE = 10;

export const COMMENTS_CHAR_LIMIT = 100;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const SectionTypeId = {
  Statement: 10,
  Response: 20,
  Acknowledgement: 30,
  ESignature: 40,
} as const;

export const ResponseTypeId = {
  Text: 10,
  Numeric: 20,
  List: 30,
} as const;

export const SectionTypeOptions = [
  { label: "Statement", value: SectionTypeId.Statement },
  { label: "Response", value: SectionTypeId.Response },
  { label: "Acknowledgement", value: SectionTypeId.Acknowledgement },
  { label: "E-Signature", value: SectionTypeId.ESignature },
];

export const ResponseTypeOptions = [
  { label: "Text", value: ResponseTypeId.Text },
  { label: "Numeric", value: ResponseTypeId.Numeric },
  { label: "List", value: ResponseTypeId.List },
];

export const STATUS_MAP: Record<string, { color: string; bgcolor: string }> = {
  "Not Submitted": { color: "#FFFFFF", bgcolor: "#FBC02D" },
  "In Progress": { color: "#FFFFFF", bgcolor: "#00ACC1" },
  Submitted: { color: "#FFFFFF", bgcolor: "#43A047" },
};

export const UserRoles = {
  ADMIN: "eTendering.Admin",
  VENDOR: "eTendering.Vendor",
} as const;