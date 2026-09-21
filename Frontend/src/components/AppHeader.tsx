import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SearchDropdown } from './SearchDropdown';

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link nav-link-active' : 'nav-link';

export function AppHeader() {
  const [openDropdown, setOpenDropdown] = useState<'movies' | 'tvshows' | 'library' | null>(null);

  return (
    <header className="top-row">
      <div className="container">
        <NavLink className="brand" to="/">
          Movie Library
        </NavLink>
        <nav className="nav-menu" onMouseLeave={() => setOpenDropdown(null)}>
          <div
            className={openDropdown === 'movies' ? 'library-nav-dropdown library-nav-dropdown-open' : 'library-nav-dropdown'}
            onMouseEnter={() => setOpenDropdown('movies')}
          >
            <NavLink className={linkClassName} to="/movies?tab=popular">
              <span className="library-nav-trigger">Movies</span>
            </NavLink>
            <div className="library-nav-menu">
              <NavLink className={linkClassName} to="/movies?tab=popular" onClick={() => setOpenDropdown(null)}>
                Popular
              </NavLink>
              <NavLink className={linkClassName} to="/movies?tab=top-rated" onClick={() => setOpenDropdown(null)}>
                Top Rated
              </NavLink>
              <NavLink className={linkClassName} to="/movies?tab=upcoming" onClick={() => setOpenDropdown(null)}>
                Upcoming
              </NavLink>
            </div>
          </div>
          <div
            className={openDropdown === 'tvshows' ? 'library-nav-dropdown library-nav-dropdown-open' : 'library-nav-dropdown'}
            onMouseEnter={() => setOpenDropdown('tvshows')}
          >
            <NavLink className={linkClassName} to="/tvshows?tab=upcoming">
              <span className="library-nav-trigger">TV Shows</span>
            </NavLink>
            <div className="library-nav-menu">
              <NavLink className={linkClassName} to="/tvshows?tab=upcoming" onClick={() => setOpenDropdown(null)}>
                Upcoming
              </NavLink>
              <NavLink className={linkClassName} to="/tvshows?tab=on-the-air" onClick={() => setOpenDropdown(null)}>
                On The Air
              </NavLink>
              <NavLink className={linkClassName} to="/tvshows?tab=popular" onClick={() => setOpenDropdown(null)}>
                Popular
              </NavLink>
              <NavLink className={linkClassName} to="/tvshows?tab=top-rated" onClick={() => setOpenDropdown(null)}>
                Top Rated
              </NavLink>
            </div>
          </div>
          <div
            className={openDropdown === 'library' ? 'library-nav-dropdown library-nav-dropdown-open' : 'library-nav-dropdown'}
            onMouseEnter={() => setOpenDropdown('library')}
          >
            <NavLink className={linkClassName} to="/library?tab=lists">
              <span className="library-nav-trigger">Library</span>
            </NavLink>
            <div className="library-nav-menu">
              <NavLink className={linkClassName} to="/library?tab=lists" onClick={() => setOpenDropdown(null)}>
                Lists
              </NavLink>
              <NavLink className={linkClassName} to="/library?tab=watchlist" onClick={() => setOpenDropdown(null)}>
                Watchlist
              </NavLink>
              <NavLink className={linkClassName} to="/library?tab=favourites" onClick={() => setOpenDropdown(null)}>
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
  );
}
