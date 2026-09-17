import { useEffect, useRef } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import ContactScreen from './screens/ContactScreen';
import ProjectScreen from './screens/ProjectScreen';
import { ProjectsProvider } from './content/ProjectsProvider';
import { pages } from './content/profile';

export default function App() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const metadata = pages[pathname as keyof typeof pages];
    document.title = metadata?.title ?? 'Page not found — Daniel Badura';
    const description = metadata?.description ?? 'This page could not be found.';
    for (const [selector, content] of [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', document.title],
      ['meta[property="og:description"]', description],
    ]) document.querySelector(selector)?.setAttribute('content', content);
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      const url = new URL(pathname, canonical.href).href;
      canonical.href = url;
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    }
    document.querySelector('meta[name="robots"]')?.setAttribute('content', metadata ? 'index,follow' : 'noindex,follow');
    if (previousPath.current !== pathname) {
      window.scrollTo(0, 0);
      main.current?.focus();
      previousPath.current = pathname;
    }
  }, [pathname]);

  return (
    <ProjectsProvider>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header key={pathname} />
      <main id="main-content" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/projects" element={<ProjectScreen />} />
          <Route path="/contact" element={<ContactScreen />} />
          <Route path="/facebook" element={<Navigate to="/contact" replace />} />
          <Route path="/instagram" element={<Navigate to="/contact" replace />} />
          <Route path="*" element={<div className="container page-content not-found"><p className="eyebrow mono">404 / Page not found</p><h1>Nothing at this address.</h1><p>The page may have moved. Start with the overview or explore the project archive.</p><Link className="button" to="/">Back to overview <span aria-hidden="true">→</span></Link></div>} />
        </Routes>
      </main>
      <Footer />
    </ProjectsProvider>
  );
}
