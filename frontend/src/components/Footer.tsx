import { Link } from 'react-router-dom';
import { profile } from '../content/profile';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>Daniel Badura <span className="footer-divider">/</span> <span>DevOps & Platform Engineering</span></p>
        <nav aria-label="Footer navigation">
          <a href={profile.github}>GitHub <span aria-hidden="true">↗</span></a>
          <a href={profile.linkedin}>LinkedIn <span aria-hidden="true">↗</span></a>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
