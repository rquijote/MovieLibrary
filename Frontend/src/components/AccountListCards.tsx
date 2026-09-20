import type { AccountListSummary } from '../types/media';

interface AccountListCardsProps {
  lists: AccountListSummary[];
}

export function AccountListCards({ lists }: AccountListCardsProps) {
  if (lists.length === 0) {
    return <p>No custom lists found.</p>;
  }

  return (
    <div className="account-list-cards">
      {lists.map((list) => (
        <article key={list.id} className="account-list-card">
          <h3>{list.name}</h3>
          {list.description ? <p>{list.description}</p> : <p className="muted">No description.</p>}
          <span className="account-list-count">{list.item_count} {list.item_count === 1 ? 'movie' : 'movies'}</span>
        </article>
      ))}
    </div>
  );
}
