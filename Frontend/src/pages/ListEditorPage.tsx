import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import { SelectedMoviesList } from '../components/SelectedMoviesList';
import type { ListDetailsResponse, MovieDto, MovieListResponse, StatusDto } from '../types/media';

export function ListEditorPage() {
  const navigate = useNavigate();
  const { listId } = useParams();
  const editListId = listId ? Number(listId) : null;
  const isEditMode = Number.isFinite(editListId) && editListId !== null;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const [movieSearchResults, setMovieSearchResults] = useState<MovieDto[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState<MovieDto[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExistingList, setIsLoadingExistingList] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadEditData = async () => {
      if (!isEditMode || !editListId) {
        return;
      }

      try {
        setIsLoadingExistingList(true);
        const details = await apiGet<ListDetailsResponse>(`/api/Lists/${editListId}/details`);
        setName(details.name);
        setDescription(details.description ?? '');
        setSelectedMovies(details.items);
        setStatusMessage(null);
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : 'Failed to load list for editing.');
      } finally {
        setIsLoadingExistingList(false);
      }
    };

    void loadEditData();
  }, [editListId, isEditMode]);

  useEffect(() => {
    const query = movieSearchQuery.trim();

    if (query.length < 2) {
      return;
    }

    let isCurrent = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearchLoading(true);
        const encodedQuery = encodeURIComponent(query);
        const response = await apiGet<MovieListResponse>(`/api/Search/movies?query=${encodedQuery}`);

        if (!isCurrent) {
          return;
        }

        setMovieSearchResults(response.results);
        setIsSearchOpen(true);
      } catch {
        if (!isCurrent) {
          return;
        }

        setMovieSearchResults([]);
        setIsSearchOpen(true);
      } finally {
        if (isCurrent) {
          setIsSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [movieSearchQuery]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setStatusMessage('Name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: trimmedName,
        description: description.trim() || null,
        language: 'en',
      };

      if (isEditMode && editListId) {
        // v3 can't update the list; v4 I don't have write access.
        await apiDelete<StatusDto>(`/api/Lists/${editListId}`);

        const recreatedList = await apiPost<StatusDto>('/api/Lists', payload);
        const recreatedListId = recreatedList.list_id;

        if (!recreatedListId) {
          throw new Error('List recreated without an id. Please try again.');
        }

        for (const movie of [...selectedMovies].reverse()) {
          await apiPost<StatusDto>(`/api/Lists/${recreatedListId}/add_movie`, movie.id);
        }

        setStatusMessage('List updated.');
        navigate('/library?tab=lists');
        return;
      }

      const result = await apiPost<StatusDto>('/api/Lists', payload);

      const createdListId = result.list_id;

      if (!createdListId) {
        throw new Error('List created without an id. Please try again.');
      }

      for (const movie of selectedMovies) {
        await apiPost<StatusDto>(`/api/Lists/${createdListId}/add_movie`, movie.id);
      }

      setStatusMessage(result.status_message ?? 'List and selected movies saved.');
      navigate('/library?tab=lists');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to save list.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSelectedMovie = (movieId: number) => {
    setSelectedMovies((current) => current.filter((movie) => movie.id !== movieId));
  };

  const handleSelectMovie = (movie: MovieDto) => {
    setSelectedMovies((current) => {
      if (current.some((item) => item.id === movie.id)) {
        return current;
      }

      return [...current, movie];
    });

    setMovieSearchQuery('');
    setMovieSearchResults([]);
    setIsSearchOpen(false);
  };

  const handleSearchQueryChange = (nextQuery: string) => {
    setMovieSearchQuery(nextQuery);

    if (nextQuery.trim().length < 2) {
      setMovieSearchResults([]);
      setIsSearchOpen(false);
      setIsSearchLoading(false);
    }
  };

  return (
    <section className="create-list-page">
      <h1>{isEditMode ? 'Edit List' : 'New List'}</h1>

      {isLoadingExistingList ? <p>Loading list...</p> : null}

      <form className="list-create-form" onSubmit={(event) => void handleSave(event)}>
        <input type="text" placeholder="List name" value={name} onChange={(event) => setName(event.target.value)} />
        <textarea
          placeholder="Description (optional)"
          value={description}
          rows={5}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="create-list-movie-search" ref={searchContainerRef}>
          <input
            type="search"
            placeholder="Search movies to add"
            value={movieSearchQuery}
            onFocus={() => {
              if (movieSearchResults.length > 0) {
                setIsSearchOpen(true);
              }
            }}
            onChange={(event) => handleSearchQueryChange(event.target.value)}
          />

          {isSearchOpen ? (
            <div className="create-list-movie-dropdown" role="listbox" aria-label="Movie search results">
              {isSearchLoading ? <p className="create-list-movie-empty">Searching...</p> : null}
              {!isSearchLoading && movieSearchResults.length === 0 ? (
                <p className="create-list-movie-empty">No matches found.</p>
              ) : null}

              {!isSearchLoading
                ? movieSearchResults.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      className="create-list-movie-option"
                      onClick={() => handleSelectMovie(movie)}
                    >
                      <span>{movie.title}</span>
                      <small>{movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</small>
                    </button>
                  ))
                : null}
            </div>
          ) : null}
        </div>

        <SelectedMoviesList items={selectedMovies} onRemove={handleRemoveSelectedMovie} />

        <div className="list-create-actions">
          <button type="submit" className="view-more-btn" disabled={isSaving || isLoadingExistingList}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="view-more-btn"
            onClick={() => {
              if (isEditMode && editListId) {
                navigate(`/library/lists/${editListId}`);
                return;
              }

              navigate('/library');
            }}
          >
            Cancel
          </button>
        </div>
      </form>

      {statusMessage ? <p>{statusMessage}</p> : null}
    </section>
  );
}
