import { useState } from 'react';
import { getImageUrl } from '../../lib/media';
import { useSession } from '../../lib/session';
import { AccountDialog } from './AccountDialog';

export function AccountMenu({ profile = false, initiallyOpen = false, onPreferences }: {
  profile?: boolean;
  initiallyOpen?: boolean;
  onPreferences?: () => void;
}) {
  const session = useSession();
  const [open, setOpen] = useState(initiallyOpen);
  const [failedAvatarPath, setFailedAvatarPath] = useState<string | null>(null);
  const avatarPath = session.account?.avatarPath;
  const initial = session.account?.username.trim().charAt(0).toUpperCase();
  const label = session.authenticated ? 'Open profile' : 'Log in';

  return <>
    <button className={profile ? 'profile-placeholder' : 'account-login-button'}
      type="button" aria-label={label} title={label} onClick={() => setOpen(true)}>
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
    {open ? <AccountDialog onClose={() => setOpen(false)} onPreferences={onPreferences ? () => {
      setOpen(false);
      onPreferences();
    } : undefined} /> : null}
  </>;
}
