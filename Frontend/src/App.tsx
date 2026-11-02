import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ExpandedMediaListPage } from './pages/ExpandedMediaListPage';
import { ListEditorPage } from './pages/ListEditorPage';
import { HomePage } from './pages/HomePage';
import { LibraryListDetailsPage } from './pages/LibraryListDetailsPage';
import { LibraryPage } from './pages/LibraryPage';
import { CollectionDetailsPage } from './pages/CollectionDetailsPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { MoviesPage } from './pages/MoviesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PersonDetailsPage } from './pages/PersonDetailsPage';
import { KeywordResultsPage } from './pages/KeywordResultsPage';
import { SearchPage } from './pages/SearchPage';
import { TvShowDetailsPage } from './pages/TvShowDetailsPage';
import { TvEpisodeDetailsPage } from './pages/TvEpisodeDetailsPage';
import { TvSeasonDetailsPage } from './pages/TvSeasonDetailsPage';
import { TvShowsPage } from './pages/TvShowsPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/tvshows" element={<TvShowsPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/create-list" element={<ListEditorPage />} />
        <Route path="/library/lists/:listId" element={<LibraryListDetailsPage />} />
        <Route path="/library/lists/:listId/edit" element={<ListEditorPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/person/:id" element={<PersonDetailsPage />} />
        <Route path="/keyword/:id" element={<KeywordResultsPage />} />
        <Route path="/collection/:id" element={<CollectionDetailsPage />} />
        <Route path="/:mediaType/:category" element={<ExpandedMediaListRoute />} />
        <Route path="/:mediaType/:sourceId/:category" element={<ExpandedMediaListRoute />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/tv/:id" element={<TvShowDetailsPage />} />
        <Route path="/tv/:id/season/:seasonNumber" element={<TvSeasonDetailsPage />} />
        <Route path="/tv/:id/season/:seasonNumber/episode/:episodeNumber" element={<TvEpisodeDetailsPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>
    </Routes>
    );
}

// Route wrapper used to force remount on params change. (Resets the states, mounts effects from scratch.)
function ExpandedMediaListRoute() {
  const { mediaType, category, sourceId } = useParams();
  return <ExpandedMediaListPage key={`${mediaType ?? 'media'}-${sourceId ?? ''}-${category ?? 'category'}`} />;
}

export default App;
