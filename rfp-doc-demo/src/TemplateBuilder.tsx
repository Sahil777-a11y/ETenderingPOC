import React, { useState } from 'react';
import type { Template, SectionConfig, SectionType } from './types';

// Section type options
const SECTION_TYPES: { label: string; value: SectionType }[] = [
  { label: 'Text', value: 'text' },
  { label: 'Rich Text', value: 'rich-text' },
  { label: 'Date', value: 'date' },
  { label: 'Table', value: 'table' },
];

interface TemplateBuilderProps {
  templates: Template[];
  onSave: (template: Template) => void;
}

const emptySection = (): SectionConfig => ({
  id: '',
  title: '',
  type: 'text',
  content: '',
  editable: true,
});

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ templates: _templates, onSave }) => {
  const [templateName, setTemplateName] = useState('');
  const [sections, setSections] = useState<SectionConfig[]>([]);

  const addSection = () => setSections([...sections, { ...emptySection(), id: `section-${Date.now()}` }]);
  const removeSection = (idx: number) => setSections(sections.filter((_, i) => i !== idx));
  const moveSection = (idx: number, dir: -1 | 1) => {
    const newSections = [...sections];
    const [removed] = newSections.splice(idx, 1);
    newSections.splice(idx + dir, 0, removed);
    setSections(newSections);
  };
  const updateSection = (idx: number, field: keyof SectionConfig, value: any) => {
    setSections(sections.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const saveTemplate = () => {
    if (!templateName.trim() || sections.length === 0) return;
    const newTemplate: Template = {
      templateId: templateName.replace(/\s+/g, '-').toUpperCase(),
      version: 1,
      name: templateName,
      sections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newTemplate);
    setTemplateName('');
    setSections([]);
  };

  return (
    <div>
      <h2>Create/Edit RFP Template</h2>
      <input
        placeholder="Template Name"
        value={templateName}
        onChange={e => setTemplateName(e.target.value)}
      />
      <button onClick={addSection}>Add Section</button>
      <ul>
        {sections.map((section, idx) => (
          <li key={section.id} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 8 }}>
            <input
              placeholder="Section Title"
              value={section.title}
              onChange={e => updateSection(idx, 'title', e.target.value)}
            />
            <select
              value={section.type}
              onChange={e => updateSection(idx, 'type', e.target.value as SectionType)}
            >
              {SECTION_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label>
              Editable
              <input
                type="checkbox"
                checked={section.editable}
                onChange={e => updateSection(idx, 'editable', e.target.checked)}
              />
            </label>
            <button disabled={idx === 0} onClick={() => moveSection(idx, -1)}>↑</button>
            <button disabled={idx === sections.length - 1} onClick={() => moveSection(idx, 1)}>↓</button>
            <button onClick={() => removeSection(idx)}>Remove</button>
            <div>
              <textarea
                placeholder="Default Content"
                value={typeof section.content === 'string' ? section.content : ''}
                onChange={e => updateSection(idx, 'content', e.target.value)}
              />
            </div>
          </li>
        ))}
      </ul>
      <button onClick={saveTemplate} disabled={!templateName.trim() || sections.length === 0}>
        Save Template
      </button>
    </div>
  );
};
