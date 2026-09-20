import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MediaGrid } from '../components/MediaGrid';
import { apiGet } from '../lib/api';
import type { ListDetailsResponse } from '../types/media';

export function LibraryListDetailsPage() {
  const navigate = useNavigate();
  const { listId } = useParams();
  const [list, setList] = useState<ListDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!listId) {
        setList(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await apiGet<ListDetailsResponse>(`/api/Lists/${listId}/details`);
        setList(result);
        setError(null);
      } catch (loadError) {
        setList(null);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load list details.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [listId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!list) {
    return <p>List not found.</p>;
  }

  return (
    <section className="library-list-page-layout">
      <div className="library-list-page-main">
        <h1>{list.name}</h1>
        <p className="muted">{list.item_count} {list.item_count === 1 ? 'movie' : 'movies'}</p>
        <MediaGrid items={list.items} mediaType="movies" />
      </div>

      <aside className="library-list-command-center">
        <h2>Command Center</h2>
        <p className="muted">Manage this list.</p>
        <button
          type="button"
          className="create-list-button"
          onClick={() => navigate(`/library/lists/${list.id}/edit`)}
        >
          Edit this list
        </button>
      </aside>
    </section>
  );
}
