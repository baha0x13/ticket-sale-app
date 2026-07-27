import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../api';

function formatTime(value) {
  if (!value) return '';
  return new Date(value.toString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    api.get('/movies')
      .then(({ data }) => setMovies(data))
      .catch(() => setError('Could not load movies'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="center"><div className="spinner" /></div>;
  }

  return (
    <div className="container">
      {error && <div className="error-banner">{error}</div>}

      <div className="movie-grid">
        {movies.map(movie => (
          <div key={movie.imdbID} className="movie-card" onClick={() => navigate(`/movies/${movie.id}`)}>
            <div className="movie-card__poster-wrap">
              <img className="movie-card__poster" src={movie.Poster} alt={movie.Title} />
              <button className="movie-card__cart-btn" onClick={e => e.stopPropagation()}>🛒</button>
            </div>
            <div className="movie-card__body">
              <p className="movie-card__title">{movie.Title}</p>
              <p className="movie-card__meta">{movie.Year}</p>
              <p className="movie-card__meta">{formatTime(movie.date)} &middot; Hall {movie.hall}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
