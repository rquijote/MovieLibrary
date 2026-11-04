import { Link, Outlet } from 'react-router-dom';
import { AppHeader } from '../header/AppHeader';
import { OfflineStatus } from './OfflineStatus';

export function Layout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="container page-content">
        <OfflineStatus />
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <Link to="/about">About &amp; Credits</Link>
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </footer>
    </div>
  );
}
