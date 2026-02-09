import * as React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { Button } from './ui/button';
import { SidebarSection } from './ui/sidebar-section';
import { HamburgerMenuIcon, HomeIcon, PersonIcon, ArchiveIcon, GlobeIcon, PaperPlaneIcon, ChevronRightIcon } from '@radix-ui/react-icons';

const sidebarItems = [
  { label: 'Dashboard', icon: <HomeIcon />, disabled: true },
  { label: 'Community', icon: <PersonIcon />, disabled: true },
  { label: 'Projects', icon: <ArchiveIcon />, disabled: false, expandable: true },
  { label: 'Library', icon: <ArchiveIcon />, disabled: true },
  { label: 'Portal', icon: <GlobeIcon />, disabled: true },
  { label: 'Submissions', icon: <PaperPlaneIcon />, disabled: true },
];

const myProjects = [
  {
    name: 'Config-Driven RFP Authoring Demo',
    href: '#',
    active: true,
  },
];

export default function Sidebar() {
  const [projectsOpen, setProjectsOpen] = React.useState(true);

  return (
    <aside className="h-screen w-64 bg-blue-800 text-white flex flex-col shadow-xl border-r border-blue-900">
      <div className="flex items-center justify-center h-20 font-extrabold text-2xl tracking-wide border-b border-blue-700 bg-blue-900">
        <span className="">ETendering</span>
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
                      <ul className="space-y-1 mt-1">
                        {myProjects.map((proj) => (
                          <li key={proj.name}>
                            <a
                              href={proj.href}
                              className={`block px-3 py-2 rounded-lg ${proj.active ? 'bg-white text-blue-800 font-bold shadow hover:bg-blue-100' : 'text-blue-200'}`}
                            >
                              {proj.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </SidebarSection>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Button variant="sidebar" disabled={item.disabled}>
                  <span className="flex items-center gap-3">{item.icon}{item.label}</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-blue-700 bg-blue-900">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-700/80">
          <span className="text-sm font-medium text-white">Qwantify Count</span>
        </div>
      </div>
    </aside>
  );
}
