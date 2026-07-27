import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import api from '../api';

const SIMULATED_BANK_ACCOUNT = 'TF-0192 8374 6501 2298';

const STATUS_LABEL = {
  pending: 'Awaiting payment confirmation',
  confirmed: 'Confirmed — ticket sent to your email',
  rejected: 'Payment rejected'
};

export default function Payment() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(() => {
    setIsLoading(true);
    api.get('/orders')
      .then(({ data }) => setOrder(data.find(o => String(o.id) === id) || null))
      .catch(() => setError('Could not load order'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (isLoading) {
    return <div className="center"><div className="spinner" /></div>;
  }

  if (error || !order) {
    return <div className="container"><div className="error-banner">{error || 'Order not found'}</div></div>;
  }

  return (
    <div className="container payment">
      {order.paymentStatus === 'pending' && (
        <div className="payment__box">
          <h2>Complete your payment</h2>
          <p>This is a simulated bank transfer — no real payment is processed. An admin will review and confirm it manually.</p>
          <dl>
            <dt>Bank account</dt>
            <dd>{SIMULATED_BANK_ACCOUNT}</dd>
            <dt>Reference (required)</dt>
            <dd className="payment__reference">{order.bankReference}</dd>
            <dt>Amount</dt>
            <dd>${Number(order.total).toFixed(2)}</dd>
          </dl>
          <button onClick={fetchOrder}>Refresh status</button>
        </div>
      )}

      <div className={`status-badge status-badge--${order.paymentStatus}`}>
        {STATUS_LABEL[order.paymentStatus]}
      </div>

      <p><Link to="/orders">View all my orders</Link></p>
    </div>
  );
}
