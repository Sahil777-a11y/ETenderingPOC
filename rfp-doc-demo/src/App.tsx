
import React from 'react';
import type { Template, RfpInstance } from './types';
import { TemplateBuilder } from './TemplateBuilder';
import { RfpInstanceEditor } from './RfpInstanceEditor';
import { PreviewView } from './PreviewView';
import { generateWord } from './generateWord';
import Sidebar from './components/Sidebar';

type View = 'admin' | 'user' | 'preview' | 'dashboard';

function App() { 
  const [view, setView] = React.useState<View>('admin');
  const [showTemplateBuilder, setShowTemplateBuilder] = React.useState(false);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [selectedInstance, setSelectedInstance] = React.useState<RfpInstance | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = React.useState(false);
  // For sidebar projects
  const [sidebarProjects, setSidebarProjects] = React.useState<{ name: string; href: string; active?: boolean }[]>([]);

  // Admin: Save new template
  const handleSaveTemplate = (template: Template) => {
    setTemplates(prev => {
      const updated = [
        ...prev.filter(t => t.templateId !== template.templateId),
        template,
      ];
      localStorage.setItem('rfp_templates', JSON.stringify(updated));
      return updated;
    });
    setView('admin');
  };

  // User: Create new RFP instance
  const handleCreateInstance = (instance: RfpInstance) => {
    setSelectedInstance(instance);
    setView('preview');
  };

  // Preview: Generate Word doc
  const handleGenerateWord = async () => {
    if (!selectedInstance) return;
    setLoading(true);
    setError(null);
    try {
      await generateWord(selectedInstance);
    } catch (e: any) {
      setError(e.message || 'Error generating Word document');
    } finally {
      setLoading(false);
    }
  };


  // Expose handler for sidebar button
  React.useEffect(() => {
    (window as any).openProjectCreation = () => setShowProjectModal(true);
    return () => { (window as any).openProjectCreation = undefined; };
  }, []);

  // Load templates from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('rfp_templates');
    if (stored) {
      try {
        setTemplates(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Update sidebar projects when templates change
  React.useEffect(() => {
    setSidebarProjects(
      templates.map(t => ({
        name: t.name,
        href: '#',
        active: false,
      }))
    );
    // Optionally, set active project logic here
  }, [templates]);

  // Expose sidebar navigation handler
  React.useEffect(() => {
    (window as any).setAppView = (view: string) => setView(view as View);
    (window as any).setAppPreviewTemplate = (name: string) => {
      const t = templates.find(t => t.name === name);
      if (t) {
        setSelectedInstance({
          instanceId: `preview-${t.templateId}`,
          sourceTemplateId: t.templateId,
          sourceTemplateVersion: t.version,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          locked: true,
          sections: t.sections.map(s => ({
            ...s,
            instanceContent: s.content,
          })),
        });
        setView('preview');
      }
    };
    return () => {
      (window as any).setAppView = undefined;
      (window as any).setAppPreviewTemplate = undefined;
    };
  }, [templates]);

  // Navigation bar
  const Nav = () => (
    <nav style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      {/* <button onClick={() => setView('dashboard')}>Dashboard</button>
      <button onClick={() => setView('admin')}>Projects</button> */}
    </nav>
  );

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-blue-100 to-cyan-50 font-sans">
      <Sidebar myProjects={sidebarProjects} />
      <main className="flex-1 min-h-screen flex flex-col items-center justify-center ml-64" style={{ padding: '0', width: 'calc(100vw - 16rem)' }}>
        {showProjectModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', padding: 32, minWidth: 400, maxWidth: '90vw' }}>
              {/* <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Create Project Draft</h2> */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <button
                  style={{ flex: 1, padding: 12, borderRadius: 8, border: '2px solid #6366f1', background: '#f1f5f9', fontWeight: 600 }}
                  onClick={() => {
                    setShowProjectModal(false);
                    setView('admin');
                    setShowTemplateBuilder(true);
                  }}
                >
                  Start from a Template
                </button>
                {/* <button style={{ flex: 1, padding: 12, borderRadius: 8, border: '2px solid #e0e7ff', background: '#f8fafc', color: '#64748b' }} disabled>Blank Strategic Sourcing</button>
                <button style={{ flex: 1, padding: 12, borderRadius: 8, border: '2px solid #e0e7ff', background: '#f8fafc', color: '#64748b' }} disabled>Blank Price Only</button> */}
              </div>
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => setShowProjectModal(false)} style={{ marginRight: 8 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {!(view === 'admin' && !showTemplateBuilder) && (
          <div style={{ maxWidth: 900, margin: '3rem auto', background: 'rgba(255,255,255,0.97)', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,120,0.12)', padding: '2.5rem 2rem 2rem 2rem', border: '1px solid #e0e7ff' }}>
            {/* {view === 'dashboard' && (
              <>
                <h1 style={{ textAlign: 'center', fontWeight: 800, fontSize: 36, letterSpacing: '-1px', marginBottom: 8, background: 'linear-gradient(90deg, #6366f1 30%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></h1>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 32, fontSize: 18 }}>Notifications: Vendor Forms</p>
                <div style={{ marginBottom: 32, background: '#f1f5f9', borderRadius: 12, padding: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Vendor Forms to Fill</h3>
                  <VendorForms />
                </div>
              </>
            )} */}
            {view === 'admin' && showTemplateBuilder && (
              <>
                <h1 style={{ textAlign: 'center', fontWeight: 800, fontSize: 36, letterSpacing: '-1px', marginBottom: 8, background: 'linear-gradient(90deg, #6366f1 30%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Templates</h1>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 32, fontSize: 18 }}>Create and manage templates.</p>
                <Nav />
                {error && <div style={{ color: '#ef4444', marginBottom: 16, fontWeight: 600, textAlign: 'center' }}>Error: {error}</div>}
                <TemplateBuilder templates={templates} onSave={handleSaveTemplate} />
                {/* Master template listing */}
                <div style={{ marginTop: 32 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Templates</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {templates.map((t, idx) => (
                      <li key={t.templateId} style={{ marginBottom: 12 }}>
                        <button
                          style={{ width: '100%', padding: 12, borderRadius: 8, background: '#e0e7ff', color: '#334155', fontWeight: 600, border: 'none', textAlign: 'left' }}
                          onClick={() => setSelectedInstance({
                            instanceId: `preview-${t.templateId}`,
                            sourceTemplateId: t.templateId,
                            sourceTemplateVersion: t.version,
                            createdAt: t.createdAt,
                            updatedAt: t.updatedAt,
                            locked: true,
                            sections: t.sections.map(s => ({
                              ...s,
                              instanceContent: s.content,
                            })),
                          }) || setView('preview')}
                        >
                          {t.name} (v{t.version})
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {view === 'user' && (
              <RfpInstanceEditor templates={templates} onCreate={handleCreateInstance} />
            )}
            {view === 'preview' && selectedInstance && (
              <>
                <PreviewView instance={selectedInstance} />
                <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                  <button
                    style={{ padding: '12px 24px', borderRadius: 8, border: '2px solid #22c55e', background: '#22c55e', color: 'white', fontWeight: 700, fontSize: 17, boxShadow: '0 2px 8px rgba(34,197,94,0.08)', transition: 'background 0.2s', marginRight: 8 }}
                    onClick={() => {
                      // Save vendor form instance to localStorage
                      const vendorForms = JSON.parse(localStorage.getItem('vendor_forms') || '[]');
                      vendorForms.push(selectedInstance);
                      localStorage.setItem('vendor_forms', JSON.stringify(vendorForms));
                      alert('Form saved for vendor!');
                      setView('dashboard');
                    }}
                  >
                    Save for Vendor
                  </button>
                  <button
                    style={{ padding: '12px 24px', borderRadius: 8, border: '2px solid #6366f1', background: '#f1f5f9', color: '#6366f1', fontWeight: 700, fontSize: 17, boxShadow: '0 2px 8px rgba(99,102,241,0.08)', transition: 'background 0.2s' }}
                    onClick={() => setView('admin')}
                  >
                    Back to Projects
                  </button>
                </div>
              </>
            )}
            {view === 'preview' && !selectedInstance && (
              <div style={{ color: '#64748b', textAlign: 'center', marginTop: 32 }}>No RFP instance selected.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );

}

// VendorForms component: shows vendor forms and allows filling answers
function VendorForms() {
  const [forms, setForms] = React.useState<any[]>([]);
  const [activeFormIdx, setActiveFormIdx] = React.useState<number | null>(null);
  const [answers, setAnswers] = React.useState<any>({});
  const [viewResponseIdx, setViewResponseIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('vendor_forms');
    if (stored) {
      try {
        setForms(JSON.parse(stored));
      } catch {}
    }
  }, []);

  if (forms.length === 0) return <div style={{ color: '#64748b' }}>No vendor forms available.</div>;

  if (activeFormIdx !== null) {
    const form = forms[activeFormIdx];
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h4 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{form.instanceId}</h4>
        <ol style={{ paddingLeft: 20 }}>
          {form.sections.map((section: any, idx: number) => (
            <li key={section.id} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{section.title}</div>
              {section.editable ? (
                <textarea
                  style={{ width: '100%', minHeight: 40, borderRadius: 6, border: '1px solid #e5e7eb', padding: 8, fontSize: 15 }}
                  placeholder="Your answer"
                  value={answers[section.id] ?? ''}
                  onChange={e => setAnswers({ ...answers, [section.id]: e.target.value })}
                />
              ) : (
                <div style={{ background: '#f1f5f9', padding: 8 }}>{section.instanceContent}</div>
              )}
            </li>
          ))}
        </ol>
        <button
          style={{ marginTop: 12, padding: 10, borderRadius: 8, background: '#22c55e', color: 'white', fontWeight: 700, fontSize: 16, border: 'none' }}
          onClick={() => {
            // Save answers locally
            const updatedForms = [...forms];
            updatedForms[activeFormIdx].answers = answers;
            localStorage.setItem('vendor_forms', JSON.stringify(updatedForms));
            setForms(updatedForms);
            setActiveFormIdx(null);
            setAnswers({});
            alert('Answers saved!');
          }}
        >Save Answers</button>
        {/* <button style={{ marginLeft: 8 }} onClick={() => setActiveFormIdx(null)}>Back</button> */}
              <button
                style={{ marginLeft: 8, padding: '10px 20px', borderRadius: 8, border: '2px solid #6366f1', background: '#f1f5f9', color: '#6366f1', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(99,102,241,0.08)', transition: 'background 0.2s' }}
                onClick={() => setActiveFormIdx(null)}
              >Back</button>
      </div>
    );
  }

  if (viewResponseIdx !== null) {
    const form = forms[viewResponseIdx];
    // Prepare a preview instance with answers
    const previewInstance = {
      ...form,
      sections: form.sections.map((section: any) => ({
        ...section,
        instanceContent: section.editable ? (form.answers ? form.answers[section.id] : '') : section.instanceContent,
      })),
      locked: true,
    };
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h4 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Submitted Response Preview</h4>
        <PreviewView instance={previewInstance} />
        {/* <button style={{ marginTop: 12 }} onClick={() => setViewResponseIdx(null)}>Back</button> */}
              <button
                style={{ marginTop: 12, padding: '10px 20px', borderRadius: 8, border: '2px solid #6366f1', background: '#f1f5f9', color: '#6366f1', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(99,102,241,0.08)', transition: 'background 0.2s' }}
                onClick={() => setViewResponseIdx(null)}
              >Back</button>
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {forms.map((form, idx) => (
        <li key={form.instanceId} style={{ marginBottom: 12 }}>
          <button
            style={{ width: '100%', padding: 12, borderRadius: 8, background: '#6366f1', color: 'white', fontWeight: 600, border: 'none', marginBottom: 6 }}
            onClick={() => setActiveFormIdx(idx)}
          >
            Fill Form: {form.instanceId}
          </button>
          <button
            style={{ width: '100%', padding: 12, borderRadius: 8, background: '#0ea5e9', color: 'white', fontWeight: 600, border: 'none' }}
            onClick={() => setViewResponseIdx(idx)}
          >
            View Submitted Responses
          </button>
        </li>
      ))}
    </ul>
  );
}

export default App;
