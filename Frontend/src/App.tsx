import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ExpandedMediaListPage } from './pages/ExpandedMediaListPage';
import { HomePage } from './pages/HomePage';
import { ListsPage } from './pages/ListsPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { MoviesPage } from './pages/MoviesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TvShowDetailsPage } from './pages/TvShowDetailsPage';
import { TvShowsPage } from './pages/TvShowsPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/tvshows" element={<TvShowsPage />} />
        <Route path="/lists" element={<ListsPage />} />
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
