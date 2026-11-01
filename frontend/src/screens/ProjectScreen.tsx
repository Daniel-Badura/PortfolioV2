import { useState } from 'react';
import Project from '../components/Project';
import { useProjects } from '../content/ProjectsProvider';

export default function ProjectScreen() {
  const { projects, unavailable } = useProjects();
  const [query, setQuery] = useState('');
  const filtered = projects.filter(project => [project.name, project.description, ...project.stack].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="container page-content">
      <div className="page-heading"><p className="eyebrow mono">Projects</p><h1>Projects &<br /><span className="muted-heading">selected work.</span></h1><p>Badura Tech, company websites, online stores and SHOT. Explore the projects featured on my business website and the technologies behind them.</p></div>
      <section aria-labelledby="project-list-heading">
        <div className="project-toolbar"><h2 id="project-list-heading">All projects <span className="count mono">{projects.length.toString().padStart(2, '0')}</span></h2>
          <div className="search-field"><label htmlFor="project-search">Find a project or technology</label><input id="project-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="e.g. Laravel, WooCommerce…" /></div>
        </div>
        {unavailable && <p className="notice" role="status">Showing the bundled archive. Live project updates are temporarily unavailable.</p>}
        <p className="sr-only" role="status">{filtered.length} projects found</p>
        {filtered.length ? filtered.map((project, index) => <Project key={project.id} project={project} index={index} />) : <div className="empty-state"><h3>No matching projects</h3><p>Try another name or technology.</p><button className="button" onClick={() => setQuery('')}>Clear search</button></div>}
        <p className="archive-note">skle.pl is a demo store. SHOT is in development; its project page is available on Steam.</p>
      </section>
    </div>
  );
}
