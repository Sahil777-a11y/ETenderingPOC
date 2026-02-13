
import type { ResponseTypeId, SectionTypeId } from "../../../constants";

export interface TemplateBuilderSection {
  id: string;
  sectionTypeId: typeof SectionTypeId[keyof typeof SectionTypeId];
  order: number;

  title?: string;

  // Common content (rich text)
  content?: string;

  // Response
  responseTypeId?: typeof ResponseTypeId[keyof typeof ResponseTypeId];
  properties?: ResponseProperties;

  // Acknowledgement extra field
  acknowledgementStatement?: string;

  // Signature
  signature?: string; // base64 later
}

export type ResponseProperties =
  | TextProperties
  | NumericProperties
  | ListProperties;

export interface TextProperties {
  isRequired: boolean;
  maxLength?: number;
}

export interface NumericProperties {
  isRequired: boolean;
  min?: number;
  max?: number;
}

export interface ListProperties {
  isRequired: boolean;
  options: { id: string; name: string }[];
}
export interface TemplatePayload {
  name: string;
  description: string;
  typeId: number;

  sections: TemplateBuilderSection[];
}

export * from './actionKey';
export * from './column';
export * from './actionHandlers';


