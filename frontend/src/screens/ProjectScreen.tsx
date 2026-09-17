import { useState } from 'react';
import Project from '../components/Project';
import { useProjects } from '../content/ProjectsProvider';

export default function ProjectScreen() {
  const { projects, unavailable } = useProjects();
  const [query, setQuery] = useState('');
  const filtered = projects.filter(project => [project.name, project.description, ...project.stack].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="container page-content">
      <div className="page-heading"><p className="eyebrow mono">Projects</p><h1>Projects &<br /><span className="muted-heading">source code.</span></h1><p>Web development projects, including the Ogrodnictwo Badura online store and earlier full-stack applications. Explore each project and its technologies.</p></div>
      <section aria-labelledby="project-list-heading">
        <div className="project-toolbar"><h2 id="project-list-heading">All projects <span className="count mono">{projects.length.toString().padStart(2, '0')}</span></h2>
          <div className="search-field"><label htmlFor="project-search">Find a project or technology</label><input id="project-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="e.g. React, MongoDB…" /></div>
        </div>
        {unavailable && <p className="notice" role="status">Showing the bundled archive. Live project updates are temporarily unavailable.</p>}
        <p className="sr-only" role="status">{filtered.length} projects found</p>
        {filtered.length ? filtered.map((project, index) => <Project key={project.id} project={project} index={index} />) : <div className="empty-state"><h3>No matching projects</h3><p>Try another name or technology.</p><button className="button" onClick={() => setQuery('')}>Clear search</button></div>}
        <p className="archive-note">Historical demos may no longer be available. Source repositories remain linked for reference.</p>
      </section>
    </div>
  );
}
