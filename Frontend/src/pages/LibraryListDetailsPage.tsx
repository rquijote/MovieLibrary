import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MediaGrid } from '../components/layout/MediaGrid';
import { LoadingState } from '../components/layout/LoadingState';
import { apiDelete, apiGet } from '../lib/api';
import type { ListDetailsResponse } from '../types/media';
import './Lists.css';

export function LibraryListDetailsPage() {
  const navigate = useNavigate();
  const { listId } = useParams();
  const [list, setList] = useState<ListDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const deleting = useRef(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!listId) {
        setList(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await apiGet<ListDetailsResponse>(`/api/Lists/${listId}/details`);
        if (!active) return;
        setList(result);
        setError(null);
      } catch (loadError) {
        if (active) {
          setList(null);
          setError(loadError instanceof Error ? loadError.message : 'Failed to load list details.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [listId, loadAttempt]);

  if (error) {
    return <section className="lists-page"><Link to="/library?tab=lists" className="lists-back">Back to your library</Link>
      <div className="lists-error" role="alert"><p>{error}</p>
        <button type="button" className="view-more-btn" onClick={() => { setError(null); setLoadAttempt((attempt) => attempt + 1); }}>Try again</button>
      </div></section>;
  }

  if (isLoading) {
    return <LoadingState variant="grid" label="Loading list" />;
  }

  if (!list) {
    return <p>List not found.</p>;
  }

  const handleDeleteList = async () => {
    if (deleting.current) return;
    try {
      deleting.current = true;
      setIsDeleting(true);
      setDeleteError(null);
      await apiDelete(`/api/Lists/${list.id}`);
      navigate('/library?tab=lists');
    } catch (deleteError) {
      setDeleteError(deleteError instanceof Error ? deleteError.message : 'Failed to delete list.');
    } finally {
      deleting.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <>
      <section className="lists-page">
        <header className="lists-heading">
          <h1>{list.name}</h1>
          {list.description ? <p className="muted">{list.description}</p> : null}
          {list.tags?.length ? <div className="list-tags" aria-label="List tags">
            {list.tags.map((tag) => <span className="list-tag" key={tag}>{tag}</span>)}
          </div> : null}
        </header>
        <div className="lists-toolbar">
        <span className="muted">{list.item_count} {list.item_count === 1 ? 'movie' : 'movies'}</span>
        <div className="lists-toolbar-actions">
          <button
            type="button"
            className="view-more-btn"
            onClick={() => navigate(`/library/lists/${list.id}/edit`)}
          >
            Edit this list
          </button>
          <button
            type="button"
            className="view-more-btn view-more-btn-danger"
            disabled={isDeleting}
            onClick={() => { setDeleteError(null); setIsDeleteModalOpen(true); }}
          >
            {isDeleting ? 'Deleting...' : 'Delete this list'}
          </button>
        </div>
        </div>
        {list.items.length ? <MediaGrid items={list.items} mediaType="movies" /> : <div className="lists-empty">
          <strong>A little room for inspiration.</strong>Edit this list to add your first movie.
        </div>}
      </section>

      {isDeleteModalOpen ? (
        <div className="list-picker-overlay" role="presentation" onClick={() => { if (!isDeleting) setIsDeleteModalOpen(false); }}>
          <div className="list-picker-modal delete-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-list-title" onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => { if (event.key === 'Escape' && !isDeleting) setIsDeleteModalOpen(false); }}>
            <h3 id="delete-list-title">Delete this list?</h3>
            <p>This will permanently delete "{list.name}". Your movies will not be deleted.</p>
            {deleteError ? <p className="lists-error" role="alert">{deleteError}</p> : null}
            <div className="delete-confirm-actions">
              <button type="button" autoFocus disabled={isDeleting} className="delete-cancel-button" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
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
