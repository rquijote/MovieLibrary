import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { clearAccountOfflineData, getOfflineStatus } from '../../lib/api';
import {
  completeTmdbLogin, getAccountId, logoutFromTmdb, startTmdbLogin, useSession,
} from '../../lib/session';

export function AccountDialog({ onClose, onPreferences, reason }: {
  onClose: () => void;
  onPreferences?: () => void;
  reason?: string;
}) {
  const session = useSession();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const inFlight = useRef(false);
  const isOpen = useRef(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    isOpen.current = true;
    dialog?.showModal();
    return () => {
      isOpen.current = false;
      dialog?.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  const finishLogin = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const approved = await completeTmdbLogin();
      if (!isOpen.current) return;
      if (approved) {
        setApprovalUrl(null);
        const url = new URL(window.location.href);
        url.searchParams.set('auth', 'success');
        window.location.assign(url.href);
        return;
      }
    } catch (error) {
      if (!isOpen.current) return;
      setApprovalUrl(null);
      setError(error instanceof Error ? error.message : 'TMDB login failed. Try again.');
    } finally {
      inFlight.current = false;
      if (isOpen.current) setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!approvalUrl) return;
    const onReturn = () => {
      if (document.visibilityState === 'visible') void finishLogin();
    };
    const poll = window.setInterval(() => void finishLogin(), 5000);
    window.addEventListener('focus', onReturn);
    document.addEventListener('visibilitychange', onReturn);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener('focus', onReturn);
      document.removeEventListener('visibilitychange', onReturn);
    };
  }, [approvalUrl, finishLogin]);

  const act = async () => {
    if (inFlight.current) return;
    if (session.authenticated && getOfflineStatus().pending > 0
      && !window.confirm('There are unsynchronized edits on this device. Logging out will remove them. Log out anyway?')) return;
    // Opened synchronously within the click so pop-up blockers allow it.
    const approvalTab = session.authenticated ? null : window.open('about:blank', '_blank');
    if (approvalTab) approvalTab.opener = null;
    setBusy(true);
    inFlight.current = true;
    setError(null);
    try {
      if (session.authenticated) {
        const accountId = getAccountId();
        const revoked = await logoutFromTmdb();
        await clearAccountOfflineData(accountId);
        window.location.assign(revoked ? '/' : '/?logout_warning=1');
      } else {
        const approval = await startTmdbLogin();
        approvalTab?.location.replace(approval.approvalUrl);
        setApprovalUrl(approval.approvalUrl);
        if (!approvalTab) setError('Your browser blocked the new tab. Use the TMDB link below to open it.');
      }
    } catch (error) {
      approvalTab?.close();
      setError(error instanceof Error ? error.message : 'Account action failed. Try again.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return <dialog className="account-dialog" ref={dialogRef} aria-labelledby={titleId}
    onCancel={(event) => {
      event.preventDefault();
      if (!busy) onClose();
    }} onKeyDown={(event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!busy) onClose();
      }
    }} onClick={(event) => {
      if (event.target === event.currentTarget && !busy) onClose();
    }}>
    <div className="account-dialog-content">
    <header className="account-dialog-header">
      <h2 id={titleId}>{session.authenticated ? 'Your profile' : 'Log in to Movie Library'}</h2>
      <button className="account-cancel-button" type="button" disabled={busy} onClick={onClose} aria-label="Close account dialog">Close</button>
    </header>
    {!session.authenticated ? <p className="account-menu-hint">
      {reason ?? 'Save your favourites, rate titles, and keep your lists private to your account.'}
      {' '}TMDB opens in a new tab. Movie Library never asks for your password.
    </p> : null}
    {approvalUrl && !session.authenticated ? <div className="account-menu account-menu-pending">
      <p className="account-menu-hint">
        Approve access on the{' '}
        <a href={approvalUrl} target="_blank" rel="noopener noreferrer">TMDB tab</a>. You will be signed in automatically.
      </p>
      <p className="account-menu-hint" role="status">Waiting for TMDB approval...</p>
      <button className="account-cancel-button" type="button" disabled={busy}
        onClick={onClose}>
        Cancel
      </button>
      {error ? <p className="account-menu-error" role="alert">{error}</p> : null}
    </div> : <div className="account-menu">
    {session.account ? <span className="account-name" title={session.account.username}>{session.account.username}</span> : null}
    {onPreferences ? <button className="account-login-button" type="button" disabled={busy} onClick={onPreferences}>Genre preferences</button> : null}
    <button className="account-login-button" type="button" disabled={busy} onClick={() => void act()}>
      {busy ? 'Please wait...' : session.authenticated ? 'Log out' : 'Continue with TMDB'}
    </button>
    {error ? <p className="account-menu-error" role="alert">{error}</p> : null}
  </div>}
    </div>
  </dialog>;
}
