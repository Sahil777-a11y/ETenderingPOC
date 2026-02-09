import React from 'react';
import type { Template, RfpInstance } from './types';
import { TemplateBuilder } from './TemplateBuilder';
import { RfpInstanceEditor } from './RfpInstanceEditor';
import { PreviewView } from './PreviewView';
import { generateWord } from './generateWord';
import Sidebar from './components/Sidebar';

type View = 'admin' | 'user' | 'preview';

function App() {
  const [view, setView] = React.useState<View>('admin');
  const [templates, setTemplates] = React.useState<Template[]>([]);
  // Removed unused instances state
  const [selectedInstance, setSelectedInstance] = React.useState<RfpInstance | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Admin: Save new template
  const handleSaveTemplate = (template: Template) => {
    setTemplates(prev => [
      ...prev.filter(t => t.templateId !== template.templateId),
      template,
    ]);
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

  // Navigation bar
  const Nav = () => (
    <nav style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      <button onClick={() => setView('admin')}>Admin: Template Builder</button>
      <button onClick={() => setView('user')}>User: Create RFP</button>
      <button onClick={() => selectedInstance && setView('preview')} disabled={!selectedInstance}>Preview Last RFP</button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-cyan-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div style={{ maxWidth: 900, margin: '3rem auto', background: 'rgba(255,255,255,0.97)', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,120,0.12)', padding: '2.5rem 2rem 2rem 2rem', border: '1px solid #e0e7ff' }}>
          <h1 style={{ textAlign: 'center', fontWeight: 800, fontSize: 36, letterSpacing: '-1px', marginBottom: 8, background: 'linear-gradient(90deg, #6366f1 30%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Config-Driven RFP Authoring Demo</h1>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 32, fontSize: 18 }}>No hardcoded templates. All configuration is UI-driven and versioned.</p>
          <Nav />
          {error && <div style={{ color: '#ef4444', marginBottom: 16, fontWeight: 600, textAlign: 'center' }}>Error: {error}</div>}
          {view === 'admin' && (
            <TemplateBuilder templates={templates} onSave={handleSaveTemplate} />
          )}
          {view === 'user' && (
            <RfpInstanceEditor templates={templates} onCreate={handleCreateInstance} />
          )}
          {view === 'preview' && selectedInstance && (
            <>
              <PreviewView instance={selectedInstance} />
              <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                <button onClick={handleGenerateWord} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Word Document'}
                </button>
              </div>
            </>
          )}
          {view === 'preview' && !selectedInstance && (
            <div style={{ color: '#64748b', textAlign: 'center', marginTop: 32 }}>No RFP instance selected.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
