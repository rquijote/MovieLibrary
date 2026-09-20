import { NavLink, Outlet } from 'react-router-dom';
import { SearchDropdown } from './SearchDropdown';

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link nav-link-active' : 'nav-link';

export function Layout() {
  return (
    <div className="app-shell">
      <header className="top-row">
        <div className="container">
          <NavLink className="brand" to="/">
            Movie Library
          </NavLink>
          <nav className="nav-menu">
            <NavLink className={linkClassName} to="/movies">
              Movies
            </NavLink>
            <NavLink className={linkClassName} to="/tvshows">
              TV Shows
            </NavLink>
            <div className="library-nav-dropdown">
              <span className="nav-link library-nav-trigger">Library</span>
              <div className="library-nav-menu">
                <NavLink className={linkClassName} to="/library?tab=lists">
                  Lists
                </NavLink>
                <NavLink className={linkClassName} to="/library?tab=watchlist">
                  Watchlist
                </NavLink>
                <NavLink className={linkClassName} to="/library?tab=favourites">
                  Favourites
                </NavLink>
              </div>
            </div>
            <SearchDropdown />
          </nav>
          <div className="profile-placeholder" aria-label="Anonymous profile placeholder" title="Anonymous profile">
            <span className="profile-placeholder-head" />
            <span className="profile-placeholder-body" />
          </div>
        </div>
      </header>

      <main className="container page-content">
        <Outlet />
      </main>
    </div>
  );
}
