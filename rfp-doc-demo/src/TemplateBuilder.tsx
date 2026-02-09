import React, { useState } from 'react';
import type { Template, SectionConfig, SectionType } from './types';

// Section type options
const SECTION_TYPES: { label: string; value: SectionType }[] = [
  { label: 'Question', value: 'text' },
  { label: 'Title', value: 'statement' },
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

  const addSection = (type: SectionType) => setSections([...sections, { ...emptySection(), id: `section-${Date.now()}`, type }]);
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
    <div style={{ position: 'absolute', left: '16rem', top: 0, width: 'calc(100vw - 16rem)', minHeight: '100vh', background: '#f8fafc', borderRadius: 0, boxShadow: 'none', padding: '2.5rem 2rem', zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#334155', margin: 0 }}>Create a New Template</h2>
        <select
          style={{ padding: '8px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
          defaultValue="RFP"
          id="template-type-select"
        >
          <option value="RFP">RFP</option>
          <option value="RFQ">RFQ</option>
          <option value="RFI">RFI</option>
        </select>
      </div>
      <input
        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 20, fontSize: 16 }}
        placeholder="Template Name"
        value={templateName}
        onChange={e => setTemplateName(e.target.value)}
      />
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button style={{ flex: 1, padding: 10, borderRadius: 8, background: '#6366f1', color: 'white', fontWeight: 600, border: 'none' }} onClick={() => addSection('text')}>+ Add Question</button>
        <button style={{ flex: 1, padding: 10, borderRadius: 8, background: '#0ea5e9', color: 'white', fontWeight: 600, border: 'none' }} onClick={() => addSection('statement')}>+ Add Title</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sections.map((section, idx) => (
          <li key={section.id} style={{ marginBottom: 20, border: '1px solid #cbd5e1', borderRadius: 10, background: 'white', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: section.type === 'text' ? '#6366f1' : '#0ea5e9', marginRight: 12 }}>
                {section.type === 'text' ? 'Question' : 'Title'}
              </span>
              <input
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', marginRight: 8 }}
                placeholder={section.type === 'text' ? 'Question Title' : 'Title'}
                value={section.title}
                onChange={e => updateSection(idx, 'title', e.target.value)}
                // Title is now editable
              />
              <button style={{ marginRight: 4 }} disabled={idx === 0} onClick={() => moveSection(idx, -1)} title="Move Up">↑</button>
              <button style={{ marginRight: 4 }} disabled={idx === sections.length - 1} onClick={() => moveSection(idx, 1)} title="Move Down">↓</button>
              <button style={{ color: '#ef4444' }} onClick={() => removeSection(idx)} title="Remove">✕</button>
            </div>
            {section.type === 'text' && (
              <div style={{ marginBottom: 8 }}>
                <textarea
                  style={{ width: '100%', minHeight: 40, borderRadius: 6, border: '1px solid #e5e7eb', padding: 8, fontSize: 15 }}
                  placeholder="Default Content (optional)"
                  value={typeof section.content === 'string' ? section.content : ''}
                  onChange={e => updateSection(idx, 'content', e.target.value)}
                />
              </div>
            )}
            {section.type === 'statement' && (
              <div style={{ marginBottom: 8 }}>
                <textarea
                  style={{ width: '100%', minHeight: 40, borderRadius: 6, border: '1px solid #e5e7eb', padding: 8, fontSize: 15, background: '#f1f5f9' }}
                  placeholder="Title Content"
                  value={typeof section.content === 'string' ? section.content : ''}
                  onChange={e => updateSection(idx, 'content', e.target.value)}
                />
              </div>
            )}
            {section.type === 'text' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#64748b' }}>
                <input
                  type="checkbox"
                  checked={section.editable}
                  onChange={e => updateSection(idx, 'editable', e.target.checked)}
                />
                Editable by user
              </label>
            )}
            {/* {section.type === 'statement' && (
              <label style={{ fontSize: 14, color: '#64748b' }}>Static Content</label>
            )} */}
          </li>
        ))}
      </ul>
      <button
        style={{ width: '100%', padding: 12, borderRadius: 8, background: '#22c55e', color: 'white', fontWeight: 700, fontSize: 17, border: 'none', marginTop: 12 }}
        onClick={saveTemplate}
        disabled={!templateName.trim() || sections.length === 0}
      >
        Save Template
      </button>
    </div>
  );
};
