import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api from '../api';

const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected' };

function formatDate(value) {
  if (!value) return '';
  return new Date(value.toString()).toLocaleString();
}

function formatTime(value) {
  if (!value) return '';
  return new Date(value.toString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Could not load orders'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="center"><div className="spinner" /></div>;
  }

  return (
    <div className="container">
      {error && <div className="error-banner">{error}</div>}

      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div>
            <strong>{formatDate(order.createdAt)}</strong>{' '}
            <span className={`status-badge status-badge--${order.paymentStatus}`}>{STATUS_LABEL[order.paymentStatus]}</span>
          </div>
          <p><strong>Hall:</strong> {order.movie.hall}</p>
          <p><strong>Time:</strong> {formatTime(order.movie.date)}</p>
          <p><strong>Movie:</strong> {order.movie.title}</p>
          <div>
            <strong>Seats:</strong>{' '}
            {order.seats.map(seat => (
              <span key={seat.id}>{seat.row}{seat.column} </span>
            ))}
          </div>
          {order.paymentStatus === 'pending' && (
            <p><Link to={`/payment/${order.id}`}>View payment details</Link></p>
          )}
        </div>
      ))}
    </div>
  );
}
