import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="wordmark" to="/">
          <span className="monogram" aria-hidden="true">db<span>.</span></span>
          <span>Daniel Badura</span>
        </Link>
        <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="site-navigation"
          onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'} <span aria-hidden="true">{open ? '−' : '+'}</span></button>
        <nav id="site-navigation" aria-label="Main navigation" className={open ? 'navigation is-open' : 'navigation'}>
          <NavLink to="/" end onClick={() => setOpen(false)}>Overview</NavLink>
          <NavLink to="/projects" onClick={() => setOpen(false)}>Projects</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)}>Contact <span aria-hidden="true">↗</span></NavLink>
        </nav>
      </div>
    </header>
  );
}
