import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MediaGrid } from '../components/MediaGrid';
import { apiDelete, apiGet } from '../lib/api';
import type { ListDetailsResponse, StatusDto } from '../types/media';

export function LibraryListDetailsPage() {
  const navigate = useNavigate();
  const { listId } = useParams();
  const [list, setList] = useState<ListDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleDeleteList = async () => {
    try {
      setIsDeleting(true);
      await apiDelete<StatusDto>(`/api/Lists/${list.id}`);
      navigate('/library?tab=lists');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete list.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <section className="library-list-page-layout">
        <div className="library-list-page-main">
          <h1>{list.name}</h1>
          <p>{list.description ?? ''}</p>
          <p className="muted">{list.item_count} {list.item_count === 1 ? 'movie' : 'movies'}</p>
          <MediaGrid items={list.items} mediaType="movies" />
        </div>

        <aside className="library-list-command-center">
          <button
            type="button"
            className="create-list-button"
            onClick={() => navigate(`/library/lists/${list.id}/edit`)}
          >
            Edit this list
          </button>
          <button
            type="button"
            className="delete-list-button"
            disabled={isDeleting}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {isDeleting ? 'Deleting...' : 'Delete this list'}
          </button>
        </aside>
      </section>

      {isDeleteModalOpen ? (
        <div className="list-picker-overlay" role="presentation" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="list-picker-modal delete-confirm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>Delete List</h3>
            <p>Are you sure you want to delete this list?</p>
            <div className="delete-confirm-actions">
              <button type="button" className="delete-cancel-button" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button
                type="button"
                className="delete-list-button"
                disabled={isDeleting}
                onClick={() => void handleDeleteList()}
              >
                {isDeleting ? 'Deleting...' : 'Delete this list'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
