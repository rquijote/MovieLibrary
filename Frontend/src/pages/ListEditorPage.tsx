import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiPost, apiUpdateList } from '../lib/api';
import { SelectedMoviesList } from '../components/lists/SelectedMoviesList';
import { LoadingState } from '../components/layout/LoadingState';
import type { ListDetailsResponse, MovieDto, MovieListResponse } from '../types/media';
import { getImageUrl, handleMediaImageError } from '../lib/media';
import './Lists.css';

export function ListEditorPage() {
  const navigate = useNavigate();
  const { listId } = useParams();
  const editListId = listId ? Number(listId) : null;
  const isEditMode = editListId !== null && Number.isInteger(editListId) && editListId !== 0;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const [movieSearchResults, setMovieSearchResults] = useState<MovieDto[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState<MovieDto[]>([]);
  const [originalMovieIds, setOriginalMovieIds] = useState<number[]>([]);
  const [createdListId, setCreatedListId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExistingList, setIsLoadingExistingList] = useState(isEditMode);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchVersion = useRef(0);
  const saveInProgress = useRef(false);
  const needsMembershipRefresh = useRef(false);

  useEffect(() => {
    let active = true;
    const loadEditData = async () => {
      if (!isEditMode || !editListId) {
        return;
      }

      try {
        setIsLoadingExistingList(true);
        const details = await apiGet<ListDetailsResponse>(`/api/Lists/${editListId}/details`);
        if (!active) return;
        setName(details.name);
        setDescription(details.description ?? '');
        setTags(details.tags ?? []);
        setSelectedMovies(details.items);
        setOriginalMovieIds(details.items.map((movie) => movie.id));
        setStatusMessage(null);
        setLoadError(null);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'Failed to load list for editing.');
      } finally {
        if (active) setIsLoadingExistingList(false);
      }
    };

    void loadEditData();
    return () => { active = false; };
  }, [editListId, isEditMode, loadAttempt]);

  useEffect(() => {
    const query = movieSearchQuery.trim();

    if (!query) {
      return;
    }

    let isCurrent = true;
    const version = searchVersion.current;
    const search = async () => {
      try {
        const encodedQuery = encodeURIComponent(query);
        const response = await apiGet<MovieListResponse>(`/api/Search/movies?query=${encodedQuery}`);

        if (!isCurrent || version !== searchVersion.current) {
          return;
        }

        setMovieSearchResults(response.results);
      } catch (error) {
        if (!isCurrent || version !== searchVersion.current) {
          return;
        }

        setMovieSearchResults([]);
        setSearchError(error instanceof Error ? error.message : 'Movie search failed. Try again.');
      } finally {
        if (isCurrent && version === searchVersion.current) {
          setIsSearchLoading(false);
        }
      }
    };
    void search();

    return () => {
      isCurrent = false;
    };
  }, [movieSearchQuery, searchAttempt]);

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
    if (saveInProgress.current || isLoadingExistingList || loadError) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      setStatusMessage('Name is required.');
      return;
    }
    const savedTags = addTag();
    if (!savedTags) return;

    try {
      saveInProgress.current = true;
      setIsSaving(true);
      setStatusMessage(null);
      const payload = {
        name: trimmedName,
        description: description.trim() || null,
        language: 'en',
        tags: savedTags,
      };

      const targetId = editListId ?? createdListId;
      if (targetId) {
        const previousIds = needsMembershipRefresh.current
          ? (await apiGet<ListDetailsResponse>(`/api/Lists/${targetId}/details`)).items.map((movie) => movie.id)
          : originalMovieIds;
        const results = await apiUpdateList(targetId, payload, previousIds, selectedMovies.map((movie) => movie.id));
        setStatusMessage(results.some((result) => result.queued)
          ? 'List changes saved on this device. Pending synchronization.' : 'List updated.');
        navigate('/library?tab=lists');
        return;
      }

      const result = await apiPost('/api/Lists', payload);

      const nextListId = result.list_id;

      if (!nextListId) {
        throw new Error('List creation returned no ID. Check your library before trying again.');
      }

      setCreatedListId(nextListId);
      await apiUpdateList(nextListId, payload, [], selectedMovies.map((movie) => movie.id));

      setStatusMessage(result.status_message ?? 'List and selected movies saved.');
      navigate('/library?tab=lists');
    } catch (error) {
      needsMembershipRefresh.current = true;
      setStatusMessage(error instanceof Error ? error.message : 'Failed to save list.');
    } finally {
      saveInProgress.current = false;
      setIsSaving(false);
    }
  };

  const handleRemoveSelectedMovie = (movieId: number) => {
    setSelectedMovies((current) => current.filter((movie) => movie.id !== movieId));
  };

  const addTag = (): string[] | null => {
    const tag = tagInput.trim();
    if (!tag) return tags;
    if (tag.length > 40 || (tags.length >= 20 && !tags.some((current) => current.toLowerCase() === tag.toLowerCase()))) {
      setTagError('Use at most 20 tags, each up to 40 characters.');
      return null;
    }
    const next = tags.some((current) => current.toLowerCase() === tag.toLowerCase()) ? tags : [...tags, tag];
    setTags(next);
    setTagInput('');
    setTagError(null);
    return next;
  };

  const handleReorder = (movieId: number, targetId: number) => {
    setSelectedMovies((current) => {
      const from = current.findIndex((movie) => movie.id === movieId);
      const to = current.findIndex((movie) => movie.id === targetId);
      if (from < 0 || to < 0 || from === to) return current;
      const next = [...current];
      const [movie] = next.splice(from, 1);
      next.splice(to, 0, movie);
      return next;
    });
  };

  const handleSelectMovie = (movie: MovieDto) => {
    searchVersion.current += 1;
    setSelectedMovies((current) => {
      if (current.some((item) => item.id === movie.id)) {
        return current;
      }

      return [...current, movie];
    });

    setMovieSearchQuery('');
    setMovieSearchResults([]);
    setIsSearchOpen(false);
    setIsSearchLoading(false);
    setSearchError(null);
  };

  const handleSearchQueryChange = (nextQuery: string) => {
    searchVersion.current += 1;
    setMovieSearchQuery(nextQuery);
    setMovieSearchResults([]);
    setSearchError(null);
    setIsSearchOpen(Boolean(nextQuery.trim()));
    setIsSearchLoading(Boolean(nextQuery.trim()));
  };

  if (listId && !isEditMode) {
    return <section className="lists-page">
      <p className="lists-error" role="alert">This list address is invalid.</p></section>;
  }

  return (
    <section className="create-list-page lists-page">
      <header className="lists-heading">
        <h1>{isEditMode ? 'Edit your list' : 'New list'}</h1>
        <hr className="list-heading-divider" />
      </header>

      {isLoadingExistingList ? <LoadingState variant="inline" label="Preparing your list" /> : null}
      {loadError ? <div className="lists-error" role="alert">
        <p>{loadError}</p>
        <button type="button" className="view-more-btn" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Try again</button>
      </div> : null}

      <form className="list-create-form" autoComplete="off" onSubmit={(event) => void handleSave(event)}>
        <fieldset className="list-editor-fields" disabled={isSaving || isLoadingExistingList || Boolean(loadError)}>
        <div className="list-editor-layout">
        <section className="list-editor-panel">
        <label htmlFor="list-name">Name</label>
        <input id="list-name" type="text" autoComplete="off" required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} />
        <label htmlFor="list-tags">Tags</label>
        <div className="list-tag-input">
          <input id="list-tags" type="text" autoComplete="off" value={tagInput} maxLength={40}
            aria-describedby={tagError ? 'list-tag-error' : undefined}
            onChange={(event) => { setTagInput(event.target.value); setTagError(null); }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') { event.preventDefault(); addTag(); }
            }} />
          <button type="button" className="view-more-btn" onClick={addTag}>Add tag</button>
        </div>
        {tagError ? <p id="list-tag-error" className="lists-error" role="alert">{tagError}</p> : null}
        <div className="list-tags" aria-label="List tags">
          {tags.map((tag) => <span className="list-tag" key={tag}>{tag}
            <button type="button" aria-label={`Remove tag ${tag}`} onClick={() => setTags((current) => current.filter((value) => value !== tag))}>×</button>
          </span>)}
        </div>
        </section>
        <section className="list-editor-panel list-description-panel">
        <label htmlFor="list-description">Description</label>
        <textarea
          id="list-description"
          autoComplete="off"
          value={description}
          maxLength={2000}
          rows={5}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="list-create-actions">
          <button type="submit" className="view-more-btn" disabled={isSaving || isLoadingExistingList}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="view-more-btn"
            onClick={() => navigate(isEditMode && editListId ? `/library/lists/${editListId}` : '/library?tab=lists')}>
            Cancel
          </button>
        </div>
        </section>
        <section className="list-editor-panel list-movies-panel">
        <div className="list-section-heading"><h2>Your movies</h2><span className="list-count">{selectedMovies.length} selected</span></div>
        <div className="create-list-movie-search" ref={searchContainerRef}>
          <label htmlFor="list-movie-search">Find a movie</label>
          <input
            id="list-movie-search"
            type="search"
            placeholder="Search movies to add"
            autoComplete="off"
            aria-controls={isSearchOpen ? 'list-movie-results' : undefined}
            aria-expanded={isSearchOpen}
            value={movieSearchQuery}
            onFocus={() => {
              if (movieSearchQuery.trim()) {
                setIsSearchOpen(true);
              }
            }}
            onChange={(event) => handleSearchQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsSearchOpen(false);
              if (event.key === 'Enter') event.preventDefault();
            }}
          />

          {isSearchOpen ? (
            <div id="list-movie-results" className="create-list-movie-dropdown" aria-label="Movie search results" aria-busy={isSearchLoading}>
              {isSearchLoading ? <LoadingState variant="inline" label="Finding titles" /> : null}
              {searchError ? <div className="lists-search-error" role="alert">
                <p>{searchError}</p>
                <button type="button" className="view-more-btn" onClick={() => {
                  setSearchError(null);
                  setIsSearchLoading(true);
                  setSearchAttempt((attempt) => attempt + 1);
                }}>Try search again</button>
              </div> : null}
              {!isSearchLoading && !searchError && movieSearchResults.length === 0 ? (
                <p className="create-list-movie-empty">No matches found.</p>
              ) : null}

              {!isSearchLoading
                ? movieSearchResults.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      className="create-list-movie-option"
                      disabled={selectedMovies.some((selected) => selected.id === movie.id)}
                      onClick={() => handleSelectMovie(movie)}
                    >
                      <img src={getImageUrl(movie.poster_path, 'w92')} alt="" onError={handleMediaImageError} />
                      <span><strong>{movie.title}</strong><small>{movie.release_date ? movie.release_date.slice(0, 4) : 'Year unavailable'}</small></span>
                      <small>{selectedMovies.some((selected) => selected.id === movie.id) ? 'Added' : '+ Add'}</small>
                    </button>
                  ))
                : null}
            </div>
          ) : null}
        </div>

        <SelectedMoviesList items={selectedMovies} onRemove={handleRemoveSelectedMovie} onReorder={handleReorder} />
        </section>
        </div>
        {statusMessage ? <p className="lists-error" role="alert">{statusMessage}</p> : null}
        </fieldset>
      </form>
    </section>
  );
}
