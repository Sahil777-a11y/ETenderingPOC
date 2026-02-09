import * as React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { Button } from './ui/button';
import { SidebarSection } from './ui/sidebar-section';
import { HamburgerMenuIcon, HomeIcon, PersonIcon, ArchiveIcon, GlobeIcon, PaperPlaneIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Cross2Icon } from '@radix-ui/react-icons';

const sidebarItems = [
  { label: 'Dashboard', icon: <HomeIcon />, disabled: false },
  { label: 'Community', icon: <PersonIcon />, disabled: true },
  { label: 'Projects', icon: <ArchiveIcon />, disabled: false, expandable: true },
  { label: 'Library', icon: <ArchiveIcon />, disabled: true },
  { label: 'Portal', icon: <GlobeIcon />, disabled: true },
  { label: 'Submissions', icon: <PaperPlaneIcon />, disabled: true },
];


// Accept myProjects as prop
interface SidebarProps {
  myProjects?: { name: string; href: string; active?: boolean }[];
}

export default function Sidebar({ myProjects = [] }: SidebarProps) {
  const [projectsOpen, setProjectsOpen] = React.useState(true);

  // Handler for sidebar navigation
  const handleSidebarNav = (label: string) => {
    if (label === 'Dashboard') {
      if (window.setAppView) window.setAppView('dashboard');
    }
    // Add more navigation as needed
  };

  // Delete project handler
  const handleDeleteProject = (name: string) => {
    // Remove from localStorage
    const stored = localStorage.getItem('rfp_templates');
    let templates = [];
    if (stored) {
      try {
        templates = JSON.parse(stored);
      } catch {}
    }
    templates = templates.filter((t: any) => t.name !== name);
    localStorage.setItem('rfp_templates', JSON.stringify(templates));

    // Also remove corresponding vendor forms
    const vendorFormsStored = localStorage.getItem('vendor_forms');
    let vendorForms = [];
    if (vendorFormsStored) {
      try {
        vendorForms = JSON.parse(vendorFormsStored);
      } catch {}
    }
    vendorForms = vendorForms.filter((f: any) => f.sourceTemplateId !== name && f.name !== name);
    localStorage.setItem('vendor_forms', JSON.stringify(vendorForms));

    // Refresh page or trigger update (for now, reload)
    window.location.reload();
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 flex flex-col shadow-xl border-r z-20" style={{ background: '#0080BC', color: '#fff', borderColor: '#0080BC' }}>
      <div className="flex items-center justify-center h-20 font-extrabold text-2xl tracking-wide border-b" style={{ background: '#0080BC', borderColor: '#0080BC' }}>
        <span className="">eTendering</span>
      </div>
      <nav className="flex-1 py-6 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              {item.label === 'Projects' ? (
                <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="sidebar" className="justify-between" disabled={item.disabled}>
                      <span className="flex items-center gap-3">
                        {item.icon}
                        {item.label}
                      </span>
                      <ChevronRightIcon className={`transition-transform ${projectsOpen ? 'rotate-90' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarSection title="My Projects">
                      <button
                        className="w-full mb-2 px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        onClick={() => {
                          if (window.openProjectCreation) {
                            window.openProjectCreation();
                          }
                        }}
                      >
                        + Add New Project
                      </button>
                      <ul className="space-y-1 mt-1">
                        {myProjects.map((proj) => (
                          <li key={proj.name} className="flex items-center">
                            <button
                              className={`flex-1 block px-3 py-2 rounded-lg text-left ${proj.active ? 'bg-white text-blue-800 font-bold shadow hover:bg-blue-100' : 'text-blue-200'}`}
                              onClick={() => {
                                if (window.setAppPreviewTemplate) window.setAppPreviewTemplate(proj.name);
                              }}
                            >
                              {proj.name}
                            </button>
                            <button
                              title="Delete Project"
                              className="ml-2 p-1 rounded hover:bg-red-100"
                              onClick={() => handleDeleteProject(proj.name)}
                            >
                              <Cross2Icon color="red" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </SidebarSection>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Button variant="sidebar" disabled={item.disabled} onClick={() => !item.disabled && handleSidebarNav(item.label)}>
                  <span className="flex items-center gap-3">{item.icon}{item.label}</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t" style={{ borderColor: '#0080BC', background: '#0080BC' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#0080BC', color: '#fff' }}>
          <span className="text-sm font-medium">eTendering</span>
        </div>
      </div>
    </aside>
  );
}
