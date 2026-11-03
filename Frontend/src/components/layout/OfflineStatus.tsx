import { useSyncExternalStore } from 'react';
import {
  discardPendingChanges, getOfflineStatus, reportOfflineError, subscribeOfflineStatus, syncOfflineChanges,
} from '../../lib/api';
import { useSession } from '../../lib/session';

export function OfflineStatus() {
  const session = useSession();
  const status = useSyncExternalStore(subscribeOfflineStatus, getOfflineStatus);
  if (!session.authenticated && status.pending > 0) return null;
  if (!status.offline && !status.cached && !status.pending && !status.error && !status.synced) return null;

  const retry = () => {
    if (status.needsConfirmation && !window.confirm(
      'A previous edit may already exist on the server. Retrying list creation can create duplicates. '
      + 'Check the server first. Retry the first pending edit?',
    )) return;
    void syncOfflineChanges(status.needsConfirmation).catch(reportOfflineError);
  };
  const discard = () => {
    if (!window.confirm('Discard ALL pending edits on this device and refresh? This cannot undo edits already saved to the server.')) return;
    void discardPendingChanges().then(() => window.location.reload()).catch(reportOfflineError);
  };

  return (
    <aside className="offline-status" role="status" aria-live="polite">
      <p>
        {status.offline ? 'Connection unavailable. ' : ''}
        {status.cached ? 'Showing saved content, which may be out of date. ' : ''}
        {status.pending > 0 ? `${status.pending} edit(s) saved on this device, not yet synchronized. ` : ''}
        {status.syncing ? 'Synchronizing... ' : ''}
        {status.synced && !status.pending ? 'Edits synchronized. Refresh to load updated server content. ' : ''}
        {status.error}
      </p>
      {status.pending > 0 ? (
        <>
          <button type="button" className="view-more-btn" disabled={status.syncing || !navigator.onLine} onClick={retry}>
            Retry synchronization
          </button>
          <button type="button" className="view-more-btn" disabled={status.syncing} onClick={discard}>
            Discard pending edits
          </button>
        </>
      ) : null}
      {!status.syncing ? (
        <button type="button" className="view-more-btn" onClick={() => window.location.reload()}>Refresh content</button>
      ) : null}
    </aside>
  );
}
