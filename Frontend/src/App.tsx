import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ExpandedMediaListPage } from './pages/ExpandedMediaListPage';
import { CreateListPage } from './pages/CreateListPage';
import { HomePage } from './pages/HomePage';
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
        <Route path="/library/create-list" element={<CreateListPage />} />
        <Route path="/lists" element={<Navigate to="/library" replace />} />
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

function ExpandedMediaListRoute() {
  const { mediaType, category } = useParams();
  return <ExpandedMediaListPage key={`${mediaType ?? 'media'}-${category ?? 'category'}`} />;
}

export default App;
