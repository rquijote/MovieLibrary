import { Outlet } from 'react-router-dom';
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
    </div>
  );
}
