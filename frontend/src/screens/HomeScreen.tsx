import { Link } from 'react-router-dom';
import Projects from '../components/Projects';
import { profile } from '../content/profile';

export default function HomeScreen() {
  return (
    <div className="container">
      <section className="hero" aria-labelledby="intro-heading">
        <div className="hero-copy">
          <p className="eyebrow mono"><span className="small-square" aria-hidden="true" /> DevOps / Platform Engineer</p>
          <h1 id="intro-heading">Daniel Badura<span className="accent">.</span></h1>
          <p className="hero-intro">{profile.introduction}</p>
          <div className="hero-actions">
            <Link className="button" to="/projects">Explore my work <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" to="/contact">Get in touch <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <aside className="profile-note" aria-label="Professional profile">
          <p className="mono note-label">PROFILE / DANIEL BADURA</p>
          <dl>
            <div><dt>Focus</dt><dd>DevOps &<br />Platform Engineering</dd></div>
            <div><dt>Background</dt><dd>IT administration<br />Web development</dd></div>
            <div><dt>Code & projects</dt><dd><a href={profile.github}>github.com/Daniel-Badura <span aria-hidden="true">↗</span></a></dd></div>
          </dl>
          <div className="note-bottom mono"><span aria-hidden="true">↳</span> Project archive & source repositories</div>
        </aside>
      </section>
      <section className="background-section" aria-labelledby="background-heading">
        <div><p className="eyebrow mono">01 / Background</p><h2 id="background-heading">Across systems<br />and software.</h2></div>
        <div className="background-copy">
          <p>My background combines IT administration with building web applications. That gives me a view of both the systems an application depends on and the code running on them.</p>
          <p>This portfolio brings together the Ogrodnictwo Badura online store, earlier development work and my current focus on DevOps and Platform Engineering.</p>
          <Link className="text-link" to="/contact">Talk about experience & opportunities <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <Projects featured />
      <section className="contact-band" aria-labelledby="contact-heading">
        <div><p className="eyebrow mono">03 / Contact</p><h2 id="contact-heading">Let’s talk engineering.</h2><p>For DevOps and Platform Engineering opportunities, get in touch.</p></div>
        <Link className="button" to="/contact">Contact me <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}
