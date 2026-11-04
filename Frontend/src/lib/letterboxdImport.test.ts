import { describe, expect, it, vi } from 'vitest';
import { parseLetterboxdImport, prepareLetterboxdImport } from './letterboxdImport';
import type { MovieListResponse } from '../types/media';

const searchResult = (movies: Array<{ id: number; title: string; year: string }>): MovieListResponse => ({
  page: 1, total_pages: 1, total_results: movies.length,
  results: movies.map((movie) => ({
    id: movie.id, title: movie.title, original_title: movie.title, release_date: `${movie.year}-01-01`,
    overview: '', poster_path: null, backdrop_path: null, original_language: 'en',
    vote_average: 0, vote_count: 0, popularity: 0, video: false, genre_ids: [],
  })),
});

describe('parseLetterboxdImport', () => {
  it('combines watched, watchlist, and rating files by TMDB movie ID', () => {
    const plan = parseLetterboxdImport([
      { name: 'diary.csv', text: 'Date,Name,tmdbID,WatchedDate\r\n2024-01-02,"A, Film",11,2024-01-02\r\n' },
      { name: 'ratings.csv', text: 'tmdbID,Rating10\n11,9\n12,7\n' },
      { name: 'watchlist.csv', text: 'Title,TMDB ID\nA Film,11\nB Film,13\n' },
    ]);

    expect(plan).toEqual({
      items: [
        { movieId: 11, watched: true, watchlist: true, rating: 4.5 },
        { movieId: 12, watched: true, watchlist: false, rating: 3.5 },
        { movieId: 13, watched: false, watchlist: true },
      ],
      lists: [],
      skippedRows: 0,
    });
  });

  it('supports UTF-8 BOM, quoted newlines, and escaped quotes', () => {
    const plan = parseLetterboxdImport([{
      name: 'diary.csv',
      text: '\uFEFFtmdbID,Title,Review\n21,"A ""Quoted"" Film","First line\nsecond line"\n',
    }]);

    expect(plan.items).toEqual([{ movieId: 21, watched: true, watchlist: false }]);
  });

  it('supports Letterboxd backslash-escaped quotes', () => {
    const escapedQuote = `${String.fromCharCode(92)}"`;
    const plan = parseLetterboxdImport([{
      name: 'diary.csv',
      text: `tmdbID,Title\n22,"A ${escapedQuote}Quoted${escapedQuote} Film"\n`,
    }]);

    expect(plan.items).toEqual([{ movieId: 22, watched: true, watchlist: false }]);
  });

  it('skips rows without valid IDs and reports malformed ratings', () => {
    const plan = parseLetterboxdImport([{
      name: 'ratings.csv',
      text: 'tmdbID,Rating\n,4\n23,4.2\n24,6\n',
    }]);

    expect(plan.items).toEqual([
      { movieId: 23, watched: true, watchlist: false },
      { movieId: 24, watched: true, watchlist: false },
    ]);
    expect(plan.skippedRows).toBe(3);
  });

  it('requires TMDB IDs rather than guessing from titles', () => {
    expect(() => parseLetterboxdImport([{
      name: 'diary.csv', text: 'Title,Year\nA Film,2024\n',
    }])).toThrow('must include a tmdbID column');
  });

  it('rejects malformed quoted fields', () => {
    expect(() => parseLetterboxdImport([{
      name: 'diary.csv', text: 'tmdbID,Title\n1,"A Film\n',
    }])).toThrow('unterminated quoted field');
  });

  it('uses custom filenames as list titles and honors Position rather than row order', async () => {
    const parsed = parseLetterboxdImport([{
      name: 'lists\\movies-that-are-good.csv',
      text: 'Position,tmdbID,Name,Year\n3,33,Third,2003\n1,11,First,2001\n2,22,Second,2002\n4,11,First,2001\n',
    }]);
    const search = vi.fn();
    const plan = await prepareLetterboxdImport(parsed, search);

    expect(plan).toMatchObject({
      items: [],
      lists: [{ name: 'Movies that are good', movieIds: [11, 22, 33] }],
      skippedRows: 0,
    });
    expect(search).not.toHaveBeenCalled();
  });

  it('recognizes exported list metadata and matches Name and Year', async () => {
    const parsed = parseLetterboxdImport([{
      name: 'favourites.csv',
      text: 'Letterboxd list export v7\n\nDate,Name,Tags,URL,Description\n2024-01-01,Original list,,https://letterboxd.com/list/test/,"Some notes"\n\nPosition,Name,Year,URL,Description\n1,"Paris, Texas",1984,https://letterboxd.com/film/paris-texas/,"ignored"\n',
    }]);
    const search = vi.fn().mockResolvedValue(searchResult([{ id: 655, title: 'Paris, Texas', year: '1984' }]));
    const plan = await prepareLetterboxdImport(parsed, search);

    expect(plan.lists).toEqual([{ name: 'Favourites', movieIds: [655] }]);
    expect(plan.items).toEqual([]);
    expect(search).toHaveBeenCalledExactlyOnceWith('Paris, Texas');
  });

  it('keeps multiple custom lists separate and does not infer watched or rating state', async () => {
    const plan = await prepareLetterboxdImport(parseLetterboxdImport([
      { name: 'good_movies.CSV', text: 'tmdbID,Rating,WatchedDate\n11,4.5,2024-01-01\n' },
      { name: 'Good Movies.csv', text: 'tmdbID\n11\n22\n' },
    ]), vi.fn());

    expect(plan.lists).toEqual([
      { name: 'Good movies', movieIds: [11] },
      { name: 'Good Movies', movieIds: [11, 22] },
    ]);
    expect(plan.items).toEqual([]);
  });

  it('preserves CSV row order when no Position is present, including an empty list', async () => {
    const plan = await prepareLetterboxdImport(parseLetterboxdImport([
      { name: 'ranked.csv', text: 'tmdbID\n33\n11\n22\n' },
      { name: 'empty.csv', text: 'Position,Name,Year,URL\n' },
    ]), vi.fn());
    expect(plan.lists).toEqual([
      { name: 'Ranked', movieIds: [33, 11, 22] },
      { name: 'Empty', movieIds: [] },
    ]);
  });

  it('skips and reports unmatched, ambiguous, and incomplete search results', async () => {
    const parsed = parseLetterboxdImport([{
      name: 'my-list.csv', text: 'Name,Year\nMissing,2000\nRemake,2001\nPopular,2002\nKnown,2003\n',
    }]);
    const search = vi.fn()
      .mockResolvedValueOnce(searchResult([]))
      .mockResolvedValueOnce(searchResult([
        { id: 1, title: 'Remake', year: '2001' }, { id: 2, title: 'Remake', year: '2001' },
      ]))
      .mockResolvedValueOnce({ ...searchResult([{ id: 3, title: 'Popular', year: '2002' }]), total_pages: 2 })
      .mockResolvedValueOnce(searchResult([{ id: 4, title: 'Known', year: '2003' }]));
    const plan = await prepareLetterboxdImport(parsed, search);

    expect(plan.lists).toEqual([{ name: 'My list', movieIds: [4] }]);
    expect(plan.skippedRows).toBe(3);
    expect(plan.warnings).toHaveLength(3);
    expect(plan.warnings[0]).toContain('Missing (2000)');
  });

  it('does not create empty lists when every movie fails matching', async () => {
    const parsed = parseLetterboxdImport([{ name: 'missing.csv', text: 'Name,Year\nMissing,2000\n' }]);
    const plan = await prepareLetterboxdImport(parsed, vi.fn().mockResolvedValue(searchResult([])));
    expect(plan.lists).toEqual([]);
    expect(plan.warnings).toContain('Missing: no movies could be matched, so this list will not be created.');
  });

  it('reuses searches across lists and rejects search failures', async () => {
    const parsed = parseLetterboxdImport([
      { name: 'one.csv', text: 'Name,Year\nMovie,2000\n' },
      { name: 'two.csv', text: 'Name,Year\nMovie,2000\n' },
    ]);
    const search = vi.fn().mockResolvedValue(searchResult([{ id: 5, title: 'Movie', year: '2000' }]));
    expect((await prepareLetterboxdImport(parsed, search)).lists).toHaveLength(2);
    expect(search).toHaveBeenCalledTimes(1);
    await expect(prepareLetterboxdImport(parsed, vi.fn().mockRejectedValue(new Error('Search unavailable'))))
      .rejects.toThrow('Search unavailable');
  });

  it('rejects invalid positions and unusable custom list files', () => {
    for (const text of ['Position,tmdbID\n1,11\n1,22\n', 'Position,tmdbID\n0,11\n']) {
      expect(() => parseLetterboxdImport([{ name: 'ranked.csv', text }])).toThrow('list positions');
    }
    expect(() => parseLetterboxdImport([{ name: 'bad.csv', text: 'Name,Year\nUnknown,\n' }]))
      .toThrow('no usable movie rows');
    expect(() => parseLetterboxdImport([{ name: 'profile.csv', text: 'Username,URL\nme,url\n' }]))
      .toThrow('needs a tmdbID column');
    expect(() => parseLetterboxdImport([{ name: 'x'.repeat(201) + '.csv', text: 'tmdbID\n11\n' }]))
      .toThrow('1 to 200');
  });
});
