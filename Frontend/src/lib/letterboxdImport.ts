import type { MovieListResponse } from '../types/media';

export interface LetterboxdImportItem {
  movieId: number;
  watched: boolean;
  watchlist: boolean;
  rating?: number;
}

export interface LetterboxdImportPlan {
  items: LetterboxdImportItem[];
  lists: LetterboxdImportList[];
  skippedRows: number;
}

type ListMovie = { movieId: number } | { title: string; year: string };

interface LetterboxdImportList {
  name: string;
  movies: ListMovie[];
}

export interface PreparedLetterboxdImport extends Omit<LetterboxdImportPlan, 'lists'> {
  lists: Array<{ name: string; movieIds: number[] }>;
  warnings: string[];
}

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[\s_-]/g, '');
const movieIdFromText = (value: string) => {
  const id = /^\d+$/.test(value) ? Number(value) : Number.NaN;
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let afterQuote = false;
  const content = text.replace(/^\uFEFF/, '');

  const finishRow = () => {
    row.push(field);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
    row = [];
    field = '';
    afterQuote = false;
  };

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (inQuotes) {
      if (character === '\\' && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        if (content[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (afterQuote) {
      if (character === ',') {
        row.push(field);
        field = '';
        afterQuote = false;
      } else if (character === '\r' || character === '\n') {
        finishRow();
        if (character === '\r' && content[index + 1] === '\n') index += 1;
      } else if (character !== ' ' && character !== '\t') {
        throw new Error('The CSV contains unexpected text after a quoted field.');
      }
    } else if (character === ',' ) {
      row.push(field);
      field = '';
    } else if (character === '\r' || character === '\n') {
      finishRow();
      if (character === '\r' && content[index + 1] === '\n') index += 1;
    } else if (character === '"') {
      if (field.length !== 0) throw new Error('The CSV contains a quote inside an unquoted field.');
      inQuotes = true;
    } else {
      field += character;
    }
  }

  if (inQuotes) throw new Error('The CSV has an unterminated quoted field.');
  if (row.length > 0 || field.length > 0 || afterQuote) finishRow();
  return rows;
}

function ratingForRow(row: string[], columns: Map<string, number>): number | undefined {
  const ratingText = row[columns.get('rating') ?? -1]?.trim();
  const rating10Text = row[columns.get('rating10') ?? -1]?.trim();
  const rating = ratingText ? Number(ratingText) : Number.NaN;
  if (Number.isFinite(rating) && rating >= 0.5 && rating <= 5 && Number.isInteger(rating * 2)) {
    return rating;
  }
  const rating10 = rating10Text ? Number(rating10Text) : Number.NaN;
  if (Number.isInteger(rating10) && rating10 >= 1 && rating10 <= 10) return rating10 / 2;
  return undefined;
}

export function parseLetterboxdImport(files: Array<{ name: string; text: string }>): LetterboxdImportPlan {
  const items = new Map<number, LetterboxdImportItem>();
  const lists: LetterboxdImportList[] = [];
  let skippedRows = 0;

  for (const file of files) {
    const filename = file.name.split(/[\\/]/).pop() ?? file.name;
    if (!/\.csv$/i.test(filename)) throw new Error(`${filename} is not a CSV file.`);
    const isWatchlist = filename.toLowerCase() === 'watchlist.csv';
    const isWatchedFile = ['diary.csv', 'watched.csv', 'ratings.csv'].includes(filename.toLowerCase());
    const isList = !isWatchlist && !isWatchedFile;
    const rows = parseCsv(file.text);
    // Exported lists may start with a separate list-metadata table.
    const headerIndex = isList ? rows.findIndex((row) => {
      const names = row.map(normalizeHeader);
      return names.includes('tmdbid')
        || ((names.includes('name') || names.includes('title')) && names.includes('year'));
    }) : 0;
    const headers = rows[headerIndex]?.map(normalizeHeader) ?? [];
    const columns = new Map(headers.map((header, index) => [header, index]));
    const tmdbIdColumn = columns.get('tmdbid');
    if (isList) {
      if (headerIndex < 0) throw new Error(`${filename} needs a tmdbID column or Name/Title and Year columns.`);
      const name = filename.replace(/\.csv$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (!name || name.length > 200) throw new Error(`${filename}: list titles must contain 1 to 200 characters.`);
      const titleColumn = columns.get('name') ?? columns.get('title');
      const positionColumn = columns.get('position');
      const listRows = rows.slice(headerIndex + 1);
      if (positionColumn !== undefined) {
        const positions = listRows.map((row) => Number(row[positionColumn]?.trim()));
        if (positions.some((position) => !Number.isSafeInteger(position) || position < 1)
          || new Set(positions).size !== positions.length) {
          throw new Error(`${filename} has invalid or duplicate list positions.`);
        }
        listRows.sort((left, right) => Number(left[positionColumn]) - Number(right[positionColumn]));
      }
      const movies: ListMovie[] = [];
      for (const row of listRows) {
        const movieId = movieIdFromText(row[tmdbIdColumn ?? -1]?.trim() ?? '');
        if (movieId !== undefined) {
          movies.push({ movieId });
        } else {
          const title = row[titleColumn ?? -1]?.trim() ?? '';
          const year = row[columns.get('year') ?? -1]?.trim() ?? '';
          if (title && /^\d{4}$/.test(year)) movies.push({ title, year });
          else skippedRows += 1;
        }
      }
      if (listRows.length > 0 && movies.length === 0) {
        throw new Error(`${filename} has no usable movie rows. Include tmdbID or a movie title and four-digit year.`);
      }
      lists.push({ name: name.charAt(0).toUpperCase() + name.slice(1), movies });
      continue;
    }
    if (tmdbIdColumn === undefined) {
      throw new Error(`${file.name} must include a tmdbID column to match movies safely.`);
    }
    const watchedDateColumn = columns.get('watcheddate');
    const ratingColumn = columns.has('rating') || columns.has('rating10');

    for (const row of rows.slice(1)) {
      const idText = row[tmdbIdColumn]?.trim() ?? '';
      const movieId = movieIdFromText(idText);
      if (movieId === undefined) {
        skippedRows += 1;
        continue;
      }

      const watched = !isWatchlist && (isWatchedFile || Boolean(row[watchedDateColumn ?? -1]?.trim()));
      const watchlist = isWatchlist;
      const rating = ratingForRow(row, columns);
      const hasRatingData = ratingColumn && Boolean(
        row[columns.get('rating') ?? -1]?.trim() || row[columns.get('rating10') ?? -1]?.trim(),
      );
      if (!watched && !watchlist && !rating) {
        skippedRows += 1;
        continue;
      }
      if (hasRatingData && rating === undefined) skippedRows += 1;

      const existing = items.get(movieId) ?? { movieId, watched: false, watchlist: false };
      items.set(movieId, {
        movieId,
        watched: existing.watched || watched || rating !== undefined,
        watchlist: existing.watchlist || watchlist,
        ...(rating === undefined ? (existing.rating === undefined ? {} : { rating: existing.rating }) : { rating }),
      });
    }
  }

  return { items: [...items.values()], lists, skippedRows };
}

export async function prepareLetterboxdImport(
  plan: LetterboxdImportPlan,
  search: (title: string) => Promise<MovieListResponse>,
): Promise<PreparedLetterboxdImport> {
  const lists: PreparedLetterboxdImport['lists'] = [];
  const warnings: string[] = [];
  const searches = new Map<string, MovieListResponse>();
  const normalizeTitle = (title: string) => title.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
  let skippedRows = plan.skippedRows;

  for (const list of plan.lists) {
    const movieIds = new Set<number>();
    for (const movie of list.movies) {
      if ('movieId' in movie) {
        movieIds.add(movie.movieId);
        continue;
      }
      const title = normalizeTitle(movie.title);
      let response = searches.get(title);
      if (!response) {
        response = await search(movie.title);
        searches.set(title, response);
      }
      const matches = response.results.filter((result) =>
        result.release_date?.slice(0, 4) === movie.year
        && [result.title, result.original_title].some((value) => value && normalizeTitle(value) === title));
      const ids = [...new Set(matches.map((result) => result.id))];
      if (response.total_pages <= 1 && ids.length === 1) {
        movieIds.add(ids[0]);
      } else {
        skippedRows += 1;
        warnings.push(`${list.name}: ${movie.title} (${movie.year}) could not be matched uniquely. Add its tmdbID to import it.`);
      }
    }
    if (list.movies.length > 0 && movieIds.size === 0) {
      warnings.push(`${list.name}: no movies could be matched, so this list will not be created.`);
    } else {
      lists.push({ name: list.name, movieIds: [...movieIds] });
    }
  }

  return { items: plan.items, lists, skippedRows, warnings };
}
