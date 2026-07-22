import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../api';
import socket from '../socket';
import { getIdFromURL } from '../utils/youtube';
import { useAuth } from '../auth/useAuth.js';

export default function Movie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerStatus, setTrailerStatus] = useState('loading'); // 'loading' | 'found' | 'unavailable'
  const [seatsOrder, setSeatsOrder] = useState([]);
  const [error, setError] = useState(null);

  const room = `movie/${id}`;

  useEffect(() => {
    setIsLoading(true);
    setTrailerStatus('loading');

    api.get(`/movies/${id}`)
      .then(({ data }) => {
        setDetails(data);
        setIsLoading(false);

        socket.emit('join-room', room);

        // The trailer lookup goes movie-service -> an external TMDb API call with
        // no timeout anywhere in that chain -- if that call hangs instead of
        // erroring, there'd be nothing to ever resolve this without a client-side
        // cutoff, leaving the UI stuck on the spinner forever.
        return api.get(`/movies/${id}/trailer`, { params: { title: data.Title, year: data.Year }, timeout: 15000 })
          .then(({ data: trailer }) => {
            setTrailerUrl(trailer.trailerUrl);
            setTrailerStatus(trailer.trailerUrl ? 'found' : 'unavailable');
          })
          .catch(() => setTrailerStatus('unavailable'));
      })
      .catch(() => setError('Could not load movie details'));

    function onTempBook(params) {
      setDetails(prev => prev && ({
        ...prev,
        seats: prev.seats.map(seat => seat.id === params.seatId ? { ...seat, isTempUnavailable: params.state } : seat)
      }));
    }

    socket.on('temp-book-seat', onTempBook);

    return () => {
      socket.emit('leave-room', room);
      socket.off('temp-book-seat', onTempBook);
    };
  }, [id, room]);

  function temporaryReservation(seatId, state) {
    socket.emit('temp-book-seat', { room, seatId, state });
  }

  function addToOrder(seat) {
    if (!seat.isAvailable) return;

    const nowSelected = !seat.isSelected;
    setDetails(prev => ({
      ...prev,
      seats: prev.seats.map(s => s.id === seat.id ? { ...s, isSelected: nowSelected } : s)
    }));
    setSeatsOrder(prev => nowSelected ? [...prev, seat.id] : prev.filter(seatId => seatId !== seat.id));
    temporaryReservation(seat.id, nowSelected);
  }

  function sendOrder() {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    api.post(`/movies/${id}/orders`, { seatIds: seatsOrder })
      .then(({ data: order }) => navigate(`/payment/${order.id}`))
      .catch(() => setError('Could not place order'));
  }

  if (isLoading) {
    return <div className="center"><div className="spinner" /></div>;
  }

  if (error && !details) {
    return <div className="container"><div className="error-banner">{error}</div></div>;
  }

  const videoId = getIdFromURL(trailerUrl);

  return (
    <div className="container">
      {error && <div className="error-banner">{error}</div>}

      <div className="movie-details">
        <div className="movie-details__panel">
          <p>12:00 ({details.Runtime})</p>
          <p>Hall: {details.hall}</p>
          <p><strong>{details.Title}</strong></p>
          <p><em>{details.Year}</em></p>
          <p><strong>Production:</strong> {details.Production}</p>
          <p><strong>Director:</strong> {details.Director}</p>
        </div>

        <div className="movie-details__panel">
          <div className="movie-details__screen">
            {trailerStatus === 'found' && videoId && (
              <iframe
                title="trailer"
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {trailerStatus === 'loading' && <div className="center"><div className="spinner" /></div>}
            {trailerStatus === 'unavailable' && <p className="movie-details__no-trailer">No trailer available</p>}
          </div>
        </div>

        <div className="movie-details__panel">
          <p>Open Movie Database: {details.imdbRating ? `${details.imdbRating}/10` : 'n/a'}</p>
          <p>Metacritic: {details.Metascore ? `${details.Metascore}/100` : 'n/a'}</p>
          <p><strong>Awards:</strong> {details.Awards}</p>
        </div>
      </div>

      <div className="seat-grid">
        {details.seats.map(seat => (
          <div
            key={seat.id}
            className={
              'seat' +
              (seat.isAvailable ? ' available' : ' unavailable') +
              (seat.isTempUnavailable ? ' temp-unavailable' : '') +
              (seat.isSelected ? ' selected' : '')
            }
            onClick={() => addToOrder(seat)}
          >
            {seat.row} {seat.column}
          </div>
        ))}
      </div>

      <button className="buy-btn" disabled={seatsOrder.length === 0} onClick={sendOrder}>
        🛒 Buy ({seatsOrder.length})
      </button>
    </div>
  );
}
