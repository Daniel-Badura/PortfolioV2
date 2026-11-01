import { Link } from 'react-router-dom';
import { useProjects } from '../content/ProjectsProvider';
import Project from './Project';

export default function Projects({ featured = false }: { featured?: boolean }) {
  const { projects, unavailable } = useProjects();
  const selected = featured ? projects.slice(0, 3) : projects;
  return (
    <section className="projects-section" aria-labelledby="projects-heading">
      <div className="section-heading">
        <div><p className="eyebrow mono">02 / Projects</p><h2 id="projects-heading">{featured ? 'Selected work' : 'Projects'}</h2></div>
        {featured && <Link className="text-link" to="/projects">All projects <span aria-hidden="true">→</span></Link>}
      </div>
      <p className="section-intro">Company websites, online stores and game development — including Badura Tech and the projects featured on its website.</p>
      {unavailable && <p className="notice" role="status">Showing the project archive included with this website. Live updates are temporarily unavailable.</p>}
      {selected.length === 0 ? <p className="notice">No projects are published yet.</p> : selected.map((project, index) => <Project key={project.id} project={project} index={index} />)}
      <p className="archive-note">Explore the live websites, the skle.pl store demo and SHOT on Steam.</p>
    </section>
  );
}
