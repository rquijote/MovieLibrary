import { useState, useSyncExternalStore } from 'react';
import {
  discardPendingChanges, getOfflineStatus, reportOfflineError, subscribeOfflineStatus, syncOfflineChanges,
} from '../../lib/api';
import { useSession } from '../../lib/session';
import { ActionToast } from '../media-actions/ActionToast';

function SynchronisedToast() {
  const [dismissed, setDismissed] = useState(false);
  return <ActionToast
    toast={dismissed ? null : { id: 1, kind: 'success', message: 'Edits synchronised.' }}
    onDismiss={() => setDismissed(true)}
  />;
}

export function OfflineStatus() {
  const session = useSession();
  const status = useSyncExternalStore(subscribeOfflineStatus, getOfflineStatus, getOfflineStatus);
  if (!session.authenticated && status.pending > 0) return null;
  const showBanner = status.offline || status.pending > 0 || Boolean(status.error);

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
    <>
      {status.synced && !status.pending && !status.syncing && !status.error ? <SynchronisedToast /> : null}
      {showBanner ? <aside className="offline-status" role="status" aria-live="polite">
      <p>
        {status.offline ? 'Connection unavailable. ' : ''}
        {status.cached ? 'Showing saved content, which may be out of date. ' : ''}
        {status.pending > 0 ? `${status.pending} edit(s) saved on this device, not yet synchronized. ` : ''}
        {status.syncing ? 'Synchronizing... ' : ''}
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
    </aside> : null}
    </>
  );
}
