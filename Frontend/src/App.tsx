import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ExpandedMediaListPage } from './pages/ExpandedMediaListPage';
import { ListEditorPage } from './pages/ListEditorPage';
import { HomePage } from './pages/HomePage';
import { LibraryListDetailsPage } from './pages/LibraryListDetailsPage';
import { LibraryPage } from './pages/LibraryPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { MoviesPage } from './pages/MoviesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SearchPage } from './pages/SearchPage';
import { TvShowDetailsPage } from './pages/TvShowDetailsPage';
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
        <Route path="/:mediaType/:category" element={<ExpandedMediaListRoute />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/tv/:id" element={<TvShowDetailsPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>
    </Routes>
    );
}

// Route wrapper used to force remount on params change. (Resets the states, mounts effects from scratch.)
function ExpandedMediaListRoute() {
  const { mediaType, category } = useParams();
  return <ExpandedMediaListPage key={`${mediaType ?? 'media'}-${category ?? 'category'}`} />;
}

export default App;
