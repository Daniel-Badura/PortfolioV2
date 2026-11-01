import { bundledProjects, type ProjectData } from '../content/projects';

export default function Project({ project, index }: { project: ProjectData; index: number }) {
  const hasResponsiveImage = bundledProjects.some(item => item.image === project.image);
  return (
    <article className="project-row">
      <span className="project-number mono" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div className="project-content">
        <p className="eyebrow">{project.category}</p>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <ul className="tech-list" aria-label={project.name + ' technologies'}>
          {project.stack.map(technology => <li key={technology}>{technology}</li>)}
        </ul>
        <div className="project-links">
          {project.repo && <a href={project.repo} aria-label={'View ' + project.name + ' source code'}>Source code <span aria-hidden="true">↗</span></a>}
          <a className={project.repo ? 'secondary-link' : undefined} href={project.href} aria-label={(project.linkLabel || 'Visit website') + ' — ' + project.name}>{project.linkLabel || 'Visit website'} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="project-image">
        <img src={project.image}
          srcSet={hasResponsiveImage ? project.image.replace('.webp', '-360.webp') + ' 360w, ' + project.image.replace('.webp', '-540.webp') + ' 540w, ' + project.image + ' 720w' : undefined}
          sizes="(max-width: 720px) min(calc(100vw - 104px), 394px), (max-width: 1000px) 214px, 274px"
          alt={project.name + ' project preview'} width="720" height="450" loading="lazy" decoding="async" />
      </div>
    </article>
  );
}
