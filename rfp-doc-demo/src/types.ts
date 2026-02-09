// TypeScript interfaces for config-driven RFP authoring system

export type SectionType = 'text' | 'rich-text' | 'date' | 'table' | 'statement';

export interface SectionConfig {
  id: string;
  title: string;
  type: SectionType;
  content: string | string[][] | null; // string for text/rich-text/date, string[][] for table
  editable: boolean;
}

export interface Template {
  templateId: string;
  version: number;
  name: string;
  sections: SectionConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface RfpInstanceSection extends SectionConfig {
  // Instance-specific content (user-edited)
  instanceContent: string | string[][] | null;
  // Indicates if this section was added by user (not from master template)
  userAdded?: boolean;
}

export interface RfpInstance {
  instanceId: string;
  sourceTemplateId: string;
  sourceTemplateVersion: number;
  createdAt: string;
  updatedAt: string;
  locked: boolean;
  sections: RfpInstanceSection[];
  metadata?: Record<string, any>;
}
