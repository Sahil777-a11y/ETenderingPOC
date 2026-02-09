import React, { useState } from 'react';
import type { Template, RfpInstance, RfpInstanceSection, SectionType } from './types';

interface RfpInstanceEditorProps {
  templates: Template[];
  onCreate: (instance: RfpInstance) => void;
}

const emptyInstanceSection = (section: any): RfpInstanceSection => ({
  ...section,
  instanceContent: section.content,
  userAdded: false,
});

const emptyUserSection = (): RfpInstanceSection => ({
  id: `user-section-${Date.now()}`,
  title: '',
  type: 'text',
  content: '',
  editable: true,
  instanceContent: '',
  userAdded: true,
});

export const RfpInstanceEditor: React.FC<RfpInstanceEditorProps> = ({ templates, onCreate }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [instance, setInstance] = useState<RfpInstance | null>(null);

  // Select template and create instance snapshot
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.templateId === templateId);
    if (!template) return;
    const newInstance: RfpInstance = {
      instanceId: `rfp-${Date.now()}`,
      sourceTemplateId: template.templateId,
      sourceTemplateVersion: template.version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      locked: false,
      sections: template.sections.map(emptyInstanceSection),
    };
    setInstance(newInstance);
    setSelectedTemplateId(templateId);
  };

  // Edit section content
  const updateSectionContent = (idx: number, value: any) => {
    if (!instance) return;
    setInstance({
      ...instance,
      sections: instance.sections.map((s, i) =>
        i === idx ? { ...s, instanceContent: value } : s
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  // Add new user section
  const addUserSection = () => {
    if (!instance) return;
    setInstance({
      ...instance,
      sections: [
        ...instance.sections,
        emptyUserSection(),
      ],
      updatedAt: new Date().toISOString(),
    });
  };

  // Update user section fields
  const updateUserSection = (idx: number, field: keyof RfpInstanceSection, value: any) => {
    if (!instance) return;
    setInstance({
      ...instance,
      sections: instance.sections.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  // Remove user section
  const removeUserSection = (idx: number) => {
    if (!instance) return;
    setInstance({
      ...instance,
      sections: instance.sections.filter((_, i) => i !== idx),
      updatedAt: new Date().toISOString(),
    });
  };

  // Save instance
  const saveInstance = () => {
    if (!instance) return;
    onCreate(instance);
    setInstance(null);
    setSelectedTemplateId('');
  };

  return (
    <div>
      <h2>Create/Edit RFP Instance</h2>
      {!instance ? (
        <div>
          <select value={selectedTemplateId} onChange={e => handleTemplateSelect(e.target.value)}>
            <option value="">Select Master Template</option>
            {templates.map(t => (
              <option key={t.templateId} value={t.templateId}>{t.name} (v{t.version})</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <ul>
            {instance.sections.map((section, idx) => (
              <li key={section.id} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 8 }}>
                <div>
                  <strong>{section.title}</strong> ({section.type})
                  {section.userAdded && (
                    <>
                      <input
                        placeholder="Section Title"
                        value={section.title}
                        onChange={e => updateUserSection(idx, 'title', e.target.value)}
                      />
                      <select
                        value={section.type}
                        onChange={e => updateUserSection(idx, 'type', e.target.value as SectionType)}
                      >
                        <option value="text">Text</option>
                        <option value="rich-text">Rich Text</option>
                        <option value="date">Date</option>
                        <option value="table">Table</option>
                      </select>
                      <label>
                        Editable
                        <input
                          type="checkbox"
                          checked={section.editable}
                          onChange={e => updateUserSection(idx, 'editable', e.target.checked)}
                        />
                      </label>
                      <button onClick={() => removeUserSection(idx)}>Remove</button>
                    </>
                  )}
                </div>
                {section.editable ? (
                  <textarea
                    value={typeof section.instanceContent === 'string' ? section.instanceContent : ''}
                    onChange={e => updateSectionContent(idx, e.target.value)}
                  />
                ) : (
                  <div style={{ background: '#f5f5f5', padding: 8 }}>{section.instanceContent}</div>
                )}
              </li>
            ))}
          </ul>
          <button onClick={addUserSection}>Add Section</button>
          <button onClick={saveInstance}>Save RFP Instance</button>
        </div>
      )}
    </div>
  );
};
