import { Link } from 'react-router-dom';
import { useProjects } from '../content/ProjectsProvider';
import Project from './Project';

export default function Projects({ featured = false }: { featured?: boolean }) {
  const { projects, unavailable } = useProjects();
  const selected = featured ? projects.slice(0, 3) : projects;
  return (
    <section className="projects-section" aria-labelledby="projects-heading">
      <div className="section-heading">
        <div><p className="eyebrow mono">02 / Projects</p><h2 id="projects-heading">{featured ? 'Selected work' : 'Web development projects'}</h2></div>
        {featured && <Link className="text-link" to="/projects">All projects <span aria-hidden="true">→</span></Link>}
      </div>
      <p className="section-intro">Selected web projects, from the Ogrodnictwo Badura online store to earlier full-stack applications.</p>
      {unavailable && <p className="notice" role="status">Showing the project archive included with this website. Live updates are temporarily unavailable.</p>}
      {selected.length === 0 ? <p className="notice">No projects are published yet.</p> : selected.map((project, index) => <Project key={project.id} project={project} index={index} />)}
      <p className="archive-note">Links marked “Historical demo” refer to earlier projects and may no longer be available. Source repositories are linked where public.</p>
    </section>
  );
}
