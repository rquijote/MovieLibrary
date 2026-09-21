import { getImageUrl, handleMediaImageError } from '../../lib/media';
import type { AccountListSummary } from '../../types/media';

interface AccountListCardsProps {
  lists: AccountListSummary[];
  previewPostersByListId: Record<number, string[]>;
  onSelectList: (listId: number) => void;
}

export function AccountListCards({ lists, previewPostersByListId, onSelectList }: AccountListCardsProps) {
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
            <div className="account-list-previews" aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => {
                const posterPath = previewPostersByListId[list.id]?.[index];

                if (!posterPath) {
                  return <span key={`${list.id}-preview-placeholder-${index}`} className="account-list-preview-placeholder" />;
                }

                return (
                  <img
                    key={`${list.id}-preview-${index}`}
                    src={getImageUrl(posterPath, 'w185')}
                    srcSet={`${getImageUrl(posterPath, 'w185')} 1x, ${getImageUrl(posterPath, 'w342')} 2x`}
                    alt=""
                    loading="lazy"
                    onError={handleMediaImageError}
                  />
                );
              })}
            </div>
            <div className="account-list-card-text">
              <h3>{list.name}</h3>
              <span className="account-list-count">{list.item_count} {list.item_count === 1 ? 'movie' : 'movies'}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
