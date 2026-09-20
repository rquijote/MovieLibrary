import type { AccountListSummary } from '../types/media';

interface AccountListCardsProps {
  lists: AccountListSummary[];
  selectedListId: number | null;
  onSelectList: (listId: number) => void;
}

export function AccountListCards({ lists, selectedListId, onSelectList }: AccountListCardsProps) {
  if (lists.length === 0) {
    return <p>No custom lists found.</p>;
  }

  return (
    <div className="account-list-cards">
      {lists.map((list) => (
        <button
          key={list.id}
          type="button"
          className={`account-list-card ${selectedListId === list.id ? 'account-list-card-active' : ''}`}
          onClick={() => onSelectList(list.id)}
        >
          <div className="account-list-card-main">
            <h3>{list.name}</h3>
            {list.description ? <p>{list.description}</p> : <p className="muted">No description.</p>}
          </div>
          <span className="account-list-count">{list.item_count} {list.item_count === 1 ? 'movie' : 'movies'}</span>
        </button>
      ))}
    </div>
  );
}
