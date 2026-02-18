export interface PlaceholderTokenOption {
  label: string;
  value: string;
}

export interface ApiPlaceholderToken {
  key?: string | null;
  token?: string | null;
  label?: string | null;
  name?: string | null;
  value?: string | number | null;
}

export const PLACEHOLDER_TOKEN_OPTIONS: PlaceholderTokenOption[] = [
  { label: "ORG_NAME", value: "ORG_NAME" },
  { label: "PROJECT_NAME", value: "PROJECT_NAME" },
];

export type TemplateTokenContext = Record<
  string,
  string | number | null | undefined
>;

export const DEFAULT_TEMPLATE_TOKEN_CONTEXT: TemplateTokenContext = {
  ORG_NAME: "Mohawk",
  PROJECT_NAME: "E-Tendering",
};

export const toTokenMarkup = (token: string) => `{{${token}}}`;

export const mapApiTokensToOptions = (
  tokens: ApiPlaceholderToken[] | null | undefined
): PlaceholderTokenOption[] => {
  if (!tokens?.length) return PLACEHOLDER_TOKEN_OPTIONS;

  const mapped = tokens
    .map((token) => {
      const value = (token.key || token.token || token.name || "").trim();
      const label = (token.label || value).trim();

      if (!value) return null;

      return { value, label } satisfies PlaceholderTokenOption;
    })
    .filter((item): item is PlaceholderTokenOption => Boolean(item));

  return mapped.length ? mapped : PLACEHOLDER_TOKEN_OPTIONS;
};

export const mapApiTokensToContext = (
  tokens: ApiPlaceholderToken[] | null | undefined
): TemplateTokenContext => {
  if (!tokens?.length) return { ...DEFAULT_TEMPLATE_TOKEN_CONTEXT };

  return tokens.reduce<TemplateTokenContext>((acc, token) => {
    const key = (token.key || token.token || token.name || "").trim();

    if (!key) return acc;

    acc[key] = token.value;
    return acc;
  }, { ...DEFAULT_TEMPLATE_TOKEN_CONTEXT });
};

export const resolveTemplateTokens = (
  input: string,
  context?: TemplateTokenContext
) => {
  if (!input) return "";

  const resolvedContext: TemplateTokenContext = {
    ...DEFAULT_TEMPLATE_TOKEN_CONTEXT,
    ...(context ?? {}),
  };

  return input.replace(/{{\s*([A-Z0-9_]+)\s*}}/g, (fullMatch, rawToken) => {
    const token = rawToken;

    if (!(token in resolvedContext)) return fullMatch;

    const value = resolvedContext[token];

    if (value === undefined || value === null) return "";

    return String(value);
  });
};
