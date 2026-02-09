import React from 'react';
import type { RfpInstance } from './types';

interface PreviewViewProps {
  instance: RfpInstance;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ instance }) => {
  return (
    <div style={{ position: 'absolute', left: '16rem', top: 0, width: 'calc(100vw - 16rem)', minHeight: '100vh', background: '#fff', borderRadius: 0, boxShadow: 'none', padding: '2.5rem 2rem', zIndex: 10 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#334155' }}>Preview</h2>
      <div>
        <strong>Source Template:</strong> {instance.sourceTemplateId} (v{instance.sourceTemplateVersion})<br />
        {/* <strong>Instance ID:</strong> {instance.instanceId}<br />
        <strong>Created:</strong> {new Date(instance.createdAt).toLocaleString()}<br />
        <strong>Last Updated:</strong> {new Date(instance.updatedAt).toLocaleString()}<br />
        <strong>Status:</strong> {instance.locked ? 'Locked' : 'Editable'} */}
      </div>
      <hr />
      <ol>
        {instance.sections.map(section => (
          <li key={section.id} style={{ marginBottom: 16 }}>
            <h4>{section.title}</h4>
            <div>
              {section.type === 'table' && Array.isArray(section.instanceContent) ? (
                <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    {section.instanceContent.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: 8 }}>
                  {section.instanceContent}
                </div>
              )}
            </div>
            {!section.editable && <em style={{ color: '#888' }}>(Locked section)</em>}
            {section.userAdded && <em style={{ color: '#007bff' }}>(User-added section)</em>}
          </li>
        ))}
      </ol>
    </div>
  );
};
