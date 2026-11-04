import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { apiGet, apiPost, getOfflineStatus } from '../../lib/api';
import { assertAccount, getAccountId } from '../../lib/session';
import { parseLetterboxdImport, prepareLetterboxdImport } from '../../lib/letterboxdImport';
import type { PreparedLetterboxdImport } from '../../lib/letterboxdImport';
import type { AccountListsResponse, ListDetailsResponse, MovieListResponse } from '../../types/media';

const watchedListName = 'Letterboxd Watched';
const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

export function LetterboxdImport() {
  const [plan, setPlan] = useState<PreparedLetterboxdImport | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const inFlight = useRef(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prepareFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    setPlan(null);
    setFileNames(files.map((file) => file.name));
    setMessage(null);
    setError(null);
    if (files.length === 0) return;

    setPreparing(true);
    try {
      const parsed = parseLetterboxdImport(await Promise.all(
        files.map(async (file) => ({ name: file.name, text: await file.text() })),
      ));
      const prepared = await prepareLetterboxdImport(parsed, (title) => {
        if (!isOnline()) throw new Error('Connect to the internet to match movies by title and year.');
        return apiGet<MovieListResponse>(`/api/Search/movies?query=${encodeURIComponent(title)}`);
      });
      setPlan(prepared);
      if (prepared.items.length === 0 && prepared.lists.length === 0) {
        setMessage('No importable movie rows or lists were found in those files.');
      }
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'Could not read the selected CSV files.');
    } finally {
      setPreparing(false);
    }
  };

  const importFiles = async () => {
    if (!plan || inFlight.current || preparing) return;
    if (!isOnline()) {
      setError('Connect to the internet before importing your Letterboxd data.');
      return;
    }
    const offlineStatus = getOfflineStatus();
    if (offlineStatus.pending > 0) {
      setError('Synchronize your pending library changes before starting an import.');
      return;
    }

    const accountId = getAccountId();
    if (accountId === null) {
      setError('Log in with TMDB before importing your library.');
      return;
    }

    const actions = plan.items.reduce((count, item) =>
      count + Number(item.watched) + Number(item.watchlist) + Number(item.rating !== undefined), 0)
      + plan.lists.reduce((count, list) => count + 1 + list.movieIds.length, 0);
    inFlight.current = true;
    setBusy(true);
    setProgress({ done: 0, total: actions });
    setMessage(null);
    setError(null);
    let done = 0;
    let watchedImported = 0;
    let watchedAlreadyPresent = 0;
    let watchlistImported = 0;
    let ratingsImported = 0;
    let listsImported = 0;
    let listMoviesImported = 0;

    const mutate = async (path: string, body?: unknown) => {
      assertAccount(accountId);
      if (!isOnline()) throw new Error('Connection lost. Import stopped; reconnect before continuing.');
      const result = await apiPost(path, body);
      if (result.queued) throw new Error('A change is pending synchronization. Import paused to avoid queuing more changes.');
      if (!result.success) throw new Error(result.status_message ?? 'TMDB rejected an import change.');
      return result;
    };

    try {
      let watchedListId: number | null = null;
      const watchedMovieIds = new Set<number>();
      if (plan.items.some((item) => item.watched)) {
        const firstPage = await apiGet<AccountListsResponse>('/api/Account/lists?page=1');
        const lists = [...firstPage.results];
        for (let page = 2; page <= firstPage.total_pages; page += 1) {
          const nextPage = await apiGet<AccountListsResponse>(`/api/Account/lists?page=${page}`);
          lists.push(...nextPage.results);
        }
        const watchedList = lists.find((list) => list.name.trim().toLowerCase() === watchedListName.toLowerCase());
        if (watchedList) {
          watchedListId = watchedList.id;
          const details = await apiGet<ListDetailsResponse>(`/api/Lists/${watchedList.id}/details`);
          details.items.forEach((movie) => watchedMovieIds.add(movie.id));
        } else {
          const created = await apiPost('/api/Lists', {
            name: watchedListName,
            description: 'Movies marked as watched from a Letterboxd import.',
            language: 'en',
          });
          if (created.queued) throw new Error('The watched list is pending synchronization. Import paused.');
          if (!created.success || !created.list_id) {
            throw new Error(created.status_message ?? 'Could not create the Letterboxd Watched list.');
          }
          watchedListId = created.list_id;
        }
      }

      for (const item of plan.items) {
        if (item.watched && watchedListId !== null) {
          if (watchedMovieIds.has(item.movieId)) {
            watchedAlreadyPresent += 1;
          } else {
            await mutate(`/api/Lists/${watchedListId}/add_movie`, item.movieId);
            watchedImported += 1;
            watchedMovieIds.add(item.movieId);
          }
          done += 1;
          setProgress({ done, total: actions });
        }
        if (item.watchlist) {
          await mutate('/api/Account/watchlist', {
            media_type: 'movie', media_id: item.movieId, watchlist: true,
          });
          watchlistImported += 1;
          done += 1;
          setProgress({ done, total: actions });
        }
        if (item.rating !== undefined) {
          await mutate(`/api/Movie/${item.movieId}/rating`, { value: item.rating * 2 });
          ratingsImported += 1;
          done += 1;
          setProgress({ done, total: actions });
        }
      }

      for (const list of plan.lists) {
        const created = await mutate('/api/Lists', {
          name: list.name,
          description: '',
          language: 'en',
          movie_order: list.movieIds,
        });
        if (!Number.isSafeInteger(created.list_id) || Number(created.list_id) < 1) {
          throw new Error(`List creation for "${list.name}" returned no valid ID. Check your library before importing again.`);
        }
        listsImported += 1;
        done += 1;
        setProgress({ done, total: actions });
        for (const movieId of list.movieIds) {
          await mutate(`/api/Lists/${created.list_id}/add_movie`, movieId);
          listMoviesImported += 1;
          done += 1;
          setProgress({ done, total: actions });
        }
      }

      setMessage([
        `Imported ${watchedImported} watched films${watchedAlreadyPresent ? ` (${watchedAlreadyPresent} already in the list)` : ''}`,
        `${watchlistImported} watchlist entries`,
        `${ratingsImported} ratings`,
        `${listsImported} new lists with ${listMoviesImported} movie entries`,
      ].join('; ') + (plan.skippedRows ? `. Skipped ${plan.skippedRows} row(s) or values without usable matches or ratings.` : '.'));
    } catch (importError) {
      setError(`${done} of ${actions} changes completed. ${importError instanceof Error ? importError.message : 'Import stopped unexpectedly.'} Completed changes remain saved. Importing again creates new custom lists.`);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const actionCount = plan ? plan.items.reduce((count, item) =>
    count + Number(item.watched) + Number(item.watchlist) + Number(item.rating !== undefined), 0)
    + plan.lists.reduce((count, list) => count + 1 + list.movieIds.length, 0) : 0;

  return <section className="letterboxd-import" aria-labelledby="letterboxd-import-title">
    <h2 id="letterboxd-import-title">Import Letterboxd CSV</h2>
    <ul className="account-menu-hint letterboxd-import-types">
      <li>Watched films (private list)</li>
      <li>Watchlist</li>
      <li>Ratings</li>
      <li>Custom movie lists (new private lists)</li>
    </ul>
    <label className="letterboxd-file-label">
      Choose CSV files
      <input type="file" autoComplete="off" accept=".csv,text/csv" multiple disabled={busy || preparing} onChange={(event) => void prepareFiles(event)} />
    </label>
    {fileNames.length > 0 ? <p className="letterboxd-file-names">{fileNames.join(', ')}</p> : null}
    {preparing ? <p className="account-menu-hint" role="status">Reading CSVs and matching list movies...</p> : null}
    {plan ? <p className="account-menu-hint" role="status">
      {plan.items.length} unique movies; {plan.items.filter((item) => item.watched).length} watched,
      {' '}{plan.items.filter((item) => item.watchlist).length} watchlist,
      {' '}{plan.items.filter((item) => item.rating !== undefined).length} rated.
      {plan.skippedRows ? ` ${plan.skippedRows} row(s) will be skipped.` : ''}
    </p> : null}
    {plan?.lists.length ? <ul>
      {plan.lists.map((list, index) => <li key={index}>{list.name}: {list.movieIds.length} movies (new list)</li>)}
    </ul> : null}
    {plan?.warnings.length ? <details>
      <summary>{plan.warnings.length} matching warnings</summary>
      <ul>{plan.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
    </details> : null}
    {plan && actionCount > 0 ? <button className="account-login-button" type="button" disabled={busy}
      onClick={() => void importFiles()}>
      {busy && progress ? `Importing ${progress.done}/${progress.total}...` : `Import ${actionCount} changes`}
    </button> : null}
    {!isOnline() ? <p className="account-menu-hint">Import requires an internet connection.</p> : null}
    {message ? <p className="letterboxd-import-status" role="status">{message}</p> : null}
    {error ? <p className="account-menu-error" role="alert">{error}</p> : null}
  </section>;
}
