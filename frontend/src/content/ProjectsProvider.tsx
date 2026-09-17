import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { bundledProjects, isProject, type ProjectData } from './projects';

const ProjectsContext = createContext<{ projects: ProjectData[]; unavailable: boolean }>({
  projects: bundledProjects, unavailable: false,
});

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ projects: bundledProjects, unavailable: false });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    let mounted = true;
    fetch('/api/projects', { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(async response => {
        if (!response.ok) throw new Error('Projects unavailable');
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(isProject)) throw new Error('Invalid project data');
        if (mounted) setState({ projects: data, unavailable: false });
      })
      .catch(() => {
        if (mounted) setState({ projects: bundledProjects, unavailable: true });
      })
      .finally(() => window.clearTimeout(timeout));
    return () => { mounted = false; controller.abort(); window.clearTimeout(timeout); };
  }, []);

  return <ProjectsContext.Provider value={state}>{children}</ProjectsContext.Provider>;
}

export function useProjects() { return useContext(ProjectsContext); }
