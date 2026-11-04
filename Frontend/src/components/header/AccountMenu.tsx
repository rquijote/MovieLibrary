import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/media';
import { clearAccountOfflineData, getOfflineStatus } from '../../lib/api';
import { getAccountId, logoutFromTmdb, useSession } from '../../lib/session';
import { AccountDialog } from './AccountDialog';

export function AccountMenu({ profile = false, initiallyOpen = false }: {
  profile?: boolean;
  initiallyOpen?: boolean;
}) {
  const session = useSession();
  const [open, setOpen] = useState(initiallyOpen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedAvatarPath, setFailedAvatarPath] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const logoutInFlight = useRef(false);
  const dropdownId = useId();
  const avatarPath = session.account?.avatarPath;
  const initial = session.account?.username.trim().charAt(0).toUpperCase();
  const label = session.authenticated ? 'Open profile' : 'Log in';

  useEffect(() => {
    if (!open || !session.authenticated) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, session.authenticated]);

  const logout = async () => {
    if (logoutInFlight.current) return;
    if (getOfflineStatus().pending > 0
      && !window.confirm('There are unsynchronized edits on this device. Logging out will remove them. Log out anyway?')) return;
    logoutInFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const accountId = getAccountId();
      const revoked = await logoutFromTmdb();
      await clearAccountOfflineData(accountId);
      window.location.assign(revoked ? '/' : '/?logout_warning=1');
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Log out failed. Try again.');
    } finally {
      logoutInFlight.current = false;
      setBusy(false);
    }
  };

  return <div className="account-dropdown-container" ref={containerRef}
    onBlur={(event) => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
    <button className={profile ? 'profile-placeholder' : 'account-login-button'}
      ref={triggerRef} type="button" aria-label={label} title={label}
      aria-expanded={session.authenticated ? open : undefined}
      aria-controls={session.authenticated && open ? dropdownId : undefined}
      onClick={() => { setOpen((current) => !current); setError(null); }}>
      {profile ? avatarPath && avatarPath !== failedAvatarPath ? (
        <img className="profile-avatar" src={getImageUrl(avatarPath, 'w185')}
          alt="" onError={() => setFailedAvatarPath(avatarPath)} />
      ) : initial ? <span className="profile-initial" aria-hidden="true">{initial}</span> : (
        <svg className="profile-avatar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 20v-1a7 7 0 0 1 14 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : label}
    </button>
    {open && session.authenticated ? <div className="account-dropdown" id={dropdownId}>
      <span className="account-name" title={session.account?.username}>{session.account?.username}</span>
      <Link to="/settings" onClick={() => setOpen(false)}>Settings</Link>
      <button type="button" disabled={busy} onClick={() => void logout()}>
        {busy ? 'Logging out...' : 'Log out'}
      </button>
      {error ? <p className="account-menu-error" role="alert">{error}</p> : null}
    </div> : null}
    {open && !session.authenticated ? <AccountDialog onClose={() => setOpen(false)} /> : null}
  </div>;
}
