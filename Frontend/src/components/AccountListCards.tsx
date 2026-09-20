import type { AccountListSummary } from '../types/media';

interface AccountListCardsProps {
  lists: AccountListSummary[];
  onSelectList: (listId: number) => void;
}

export function AccountListCards({ lists, onSelectList }: AccountListCardsProps) {
  if (lists.length === 0) {
    return <p>No custom lists found.</p>;
  }

  return (
    <div className="account-list-cards">
      {lists.map((list) => (
        <button
          key={list.id}
          type="button"
          className="account-list-card"
          onClick={() => onSelectList(list.id)}
        >
          <div className="account-list-card-main">
            <h3>{list.name}</h3>
          </div>
          <span className="account-list-count">{list.item_count} {list.item_count === 1 ? 'movie' : 'movies'}</span>
        </button>
      ))}
    </div>
  );
}
