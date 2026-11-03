import type { ReactNode } from 'react';
import { useSession } from '../../lib/session';
import { AccountMenu } from '../header/AccountMenu';

export function RequireAccount({ children }: { children: ReactNode }) {
  const session = useSession();
  if (session.authenticated) return children;
  return <section className="account-required">
    <h1>Your personal library</h1>
    <p className="muted">Log in with TMDB to see your lists, favourites, watchlist, and ratings. Your library is private to your account.</p>
    <AccountMenu initiallyOpen />
  </section>;
}
