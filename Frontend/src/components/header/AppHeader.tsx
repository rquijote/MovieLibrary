import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { GenrePreferencesDialog } from './GenrePreferencesDialog';
import { HeaderSearch } from './HeaderSearch';

type DropdownName = 'movies' | 'tvshows' | 'library';

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link nav-link-active' : 'nav-link';

export function AppHeader() {
  const [openDropdown, setOpenDropdown] = useState<DropdownName | null>(null);
  const [isGenrePreferencesOpen, setIsGenrePreferencesOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = (dropdown: DropdownName) => {
    clearCloseTimer();
    setOpenDropdown(dropdown);
  };

  const closeMenu = () => {
    clearCloseTimer();
    setOpenDropdown(null);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpenDropdown(null);
      closeTimer.current = null;
    }, 140);
  };

  useEffect(() => () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
    }
  }, []);

  return (
    <header className="top-row">
      <div className="container">
        <NavLink className="brand" to="/">
          Movie Library
        </NavLink>
        <nav
          className="nav-menu"
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement)) {
              scheduleClose();
            }
          }}
          onMouseMove={(event) => {
            if (!(event.target instanceof Element) || !event.target.closest('.library-nav-dropdown')) {
              scheduleClose();
            }
          }}
          onBlur={(event) => {
            if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
              closeMenu();
            }
          }}
        >
          <div
            className={openDropdown === 'movies' ? 'library-nav-dropdown library-nav-dropdown-open' : 'library-nav-dropdown'}
            onMouseEnter={() => openMenu('movies')}
            onFocus={() => openMenu('movies')}
          >
            <NavLink className={linkClassName} to="/movies?tab=popular" onClick={closeMenu}>
              <span className="library-nav-trigger">Movies</span>
            </NavLink>
            <div className="library-nav-menu">
              <NavLink className={linkClassName} to="/movies?tab=popular" onClick={closeMenu}>
                Popular
              </NavLink>
              <NavLink className={linkClassName} to="/movies?tab=top-rated" onClick={closeMenu}>
                Top Rated
              </NavLink>
              <NavLink className={linkClassName} to="/movies?tab=upcoming" onClick={closeMenu}>
                Upcoming
              </NavLink>
            </div>
          </div>
          <div
            className={openDropdown === 'tvshows' ? 'library-nav-dropdown library-nav-dropdown-open' : 'library-nav-dropdown'}
            onMouseEnter={() => openMenu('tvshows')}
            onFocus={() => openMenu('tvshows')}
          >
            <NavLink className={linkClassName} to="/tvshows?tab=upcoming" onClick={closeMenu}>
              <span className="library-nav-trigger">TV Shows</span>
            </NavLink>
            <div className="library-nav-menu">
              <NavLink className={linkClassName} to="/tvshows?tab=upcoming" onClick={closeMenu}>
                Upcoming
              </NavLink>
              <NavLink className={linkClassName} to="/tvshows?tab=on-the-air" onClick={closeMenu}>
                On The Air
              </NavLink>
              <NavLink className={linkClassName} to="/tvshows?tab=popular" onClick={closeMenu}>
                Popular
              </NavLink>
              <NavLink className={linkClassName} to="/tvshows?tab=top-rated" onClick={closeMenu}>
                Top Rated
              </NavLink>
            </div>
          </div>
          <div
            className={openDropdown === 'library' ? 'library-nav-dropdown library-nav-dropdown-open' : 'library-nav-dropdown'}
            onMouseEnter={() => openMenu('library')}
            onFocus={() => openMenu('library')}
          >
            <NavLink className={linkClassName} to="/library?tab=lists" onClick={closeMenu}>
              <span className="library-nav-trigger">Library</span>
            </NavLink>
            <div className="library-nav-menu">
              <NavLink className={linkClassName} to="/library?tab=lists" onClick={closeMenu}>
                Lists
              </NavLink>
              <NavLink className={linkClassName} to="/library?tab=watchlist" onClick={closeMenu}>
                Watchlist
              </NavLink>
              <NavLink className={linkClassName} to="/library?tab=favourites" onClick={closeMenu}>
                Favourites
              </NavLink>
            </div>
          </div>
          <HeaderSearch />
        </nav>
        <button
          className="profile-placeholder"
          type="button"
          aria-label="Edit genre preferences"
          title="Edit genre preferences"
          onClick={() => {
            closeMenu();
            setIsGenrePreferencesOpen(true);
          }}
        >
          <span className="profile-placeholder-head" />
          <span className="profile-placeholder-body" />
        </button>
      </div>
      {isGenrePreferencesOpen ? <GenrePreferencesDialog onClose={() => setIsGenrePreferencesOpen(false)} /> : null}
    </header>
  );
}
