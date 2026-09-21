import { Outlet } from 'react-router-dom';
import { AppHeader } from '../header/AppHeader';

export function Layout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="container page-content">
        <Outlet />
      </main>
    </div>
  );
}
