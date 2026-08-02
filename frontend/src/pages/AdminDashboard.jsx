import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../auth/useAuth.js';

const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected' };
const ROLES = ['user', 'editor', 'admin'];

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  function fetchOrders() {
    setIsLoading(true);
    api.get('/admin/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Could not load orders'))
      .finally(() => setIsLoading(false));
  }

  function act(id, action) {
    setActioningId(id);
    api.post(`/admin/orders/${id}/${action}`)
      .then(fetchOrders)
      .catch(() => setError(`Could not ${action} order`))
      .finally(() => setActioningId(null));
  }

  if (isLoading) return <div className="center"><div className="spinner" /></div>;

  return (
    <>
      {error && <div className="error-banner">{error}</div>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th><th>User</th><th>Movie</th><th>Reference</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.userName} <span className="admin-table__muted">{order.userEmail}</span></td>
              <td>{order.movie?.title}</td>
              <td>{order.bankReference}</td>
              <td><span className={`status-badge status-badge--${order.paymentStatus}`}>{STATUS_LABEL[order.paymentStatus]}</span></td>
              <td>
                {order.paymentStatus === 'pending' && (
                  <>
                    <button className="btn-approve" disabled={actioningId === order.id} onClick={() => act(order.id, 'approve')}>Approve</button>{' '}
                    <button className="btn-reject" disabled={actioningId === order.id} onClick={() => act(order.id, 'reject')}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function UsersPanel() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  function fetchUsers() {
    setIsLoading(true);
    api.get('/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(() => setError('Could not load users'))
      .finally(() => setIsLoading(false));
  }

  function changeRole(id, role) {
    setSavingId(id);
    api.patch(`/admin/users/${id}/role`, { role })
      .then(fetchUsers)
      .catch(() => setError('Could not update role'))
      .finally(() => setSavingId(null));
  }

  if (isLoading) return <div className="center"><div className="spinner" /></div>;

  return (
    <>
      {error && <div className="error-banner">{error}</div>}
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {user.id === me.id
                  ? <span className="admin-table__muted">{user.role} (you)</span>
                  : (
                    <select
                      value={user.role}
                      disabled={savingId === user.id}
                      onChange={e => changeRole(user.id, e.target.value)}
                    >
                      {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Modal({ title, eyebrow, variant, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={'modal-window' + (variant ? ` modal-window--${variant}` : '')} onClick={e => e.stopPropagation()}>
        <div className="modal-window__header">
          <div>
            {eyebrow && <div className="modal-window__eyebrow">{eyebrow}</div>}
            <h3>{title}</h3>
          </div>
          <button className="modal-window__close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function toDatetimeLocal(isoString) {
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EditMovieModal({ movie, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: movie.title,
    imdbID: movie.imdbID,
    hall: movie.hall,
    date: toDatetimeLocal(movie.date)
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    api.patch(`/movies/${movie.id}`, { ...form, hall: Number(form.hall) })
      .then(() => {
        onSaved();
        onClose();
      })
      .catch(err => setError(err.response?.data?.error?.message || 'Could not save changes'))
      .finally(() => setIsSaving(false));
  }

  return (
    <Modal title="Edit movie" onClose={onClose}>
      <form onSubmit={onSubmit} className="admin-form">
        {error && <div className="error-banner">{error}</div>}
        <label>Title</label>
        <input value={form.title} onChange={update('title')} required />

        <label>IMDb ID</label>
        <input value={form.imdbID} onChange={update('imdbID')} required />

        <label>Hall</label>
        <input type="number" value={form.hall} onChange={update('hall')} required />

        <label>Date</label>
        <input type="datetime-local" value={form.date} onChange={update('date')} required />

        <div className="admin-form__actions">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </Modal>
  );
}

function DeletedMoviesModal({ onClose, onRestored }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => { fetchDeleted(); }, []);

  function fetchDeleted() {
    setIsLoading(true);
    api.get('/admin/movies/deleted')
      .then(({ data }) => setMovies(data))
      .catch(() => setError('Could not load deleted movies'))
      .finally(() => setIsLoading(false));
  }

  function onRestore(id) {
    setRestoringId(id);
    api.post(`/admin/movies/${id}/restore`)
      .then(() => {
        fetchDeleted();
        onRestored();
      })
      .catch(() => setError('Could not restore movie'))
      .finally(() => setRestoringId(null));
  }

  return (
    <Modal title="Deleted movies" eyebrow="Archive" variant="archive" onClose={onClose}>
      {error && <div className="error-banner">{error}</div>}
      {isLoading
        ? <div className="center"><div className="spinner" /></div>
        : movies.length === 0
          ? <p className="admin-table__muted">Nothing deleted.</p>
          : (
            <>
              <p className="admin-table__muted">Hidden from listings — past orders referencing these movies still resolve fine.</p>
              <table className="admin-table admin-table--archive">
                <thead><tr><th>#</th><th>Title</th><th>Hall</th><th>Actions</th></tr></thead>
                <tbody>
                  {movies.map(movie => (
                    <tr key={movie.id}>
                      <td>{movie.id}</td>
                      <td>{movie.title}</td>
                      <td>{movie.hall}</td>
                      <td>
                        <button className="btn-restore" disabled={restoringId === movie.id} onClick={() => onRestore(movie.id)}>
                          {restoringId === movie.id ? 'Restoring…' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
    </Modal>
  );
}

function MoviesPanel() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ title: '', imdbID: '', hall: '', date: '' });
  const [formMessage, setFormMessage] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  useEffect(() => { fetchMovies(); }, []);

  function fetchMovies() {
    setIsLoading(true);
    api.get('/movies')
      .then(({ data }) => setMovies(data))
      .catch(() => setError('Could not load movies'))
      .finally(() => setIsLoading(false));
  }

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  function onAdd(e) {
    e.preventDefault();
    setIsAdding(true);
    setFormMessage(null);
    api.post('/movies', { ...form, hall: Number(form.hall) })
      .then(() => {
        setFormMessage({ type: 'ok', text: 'Movie added.' });
        setForm({ title: '', imdbID: '', hall: '', date: '' });
        fetchMovies();
      })
      .catch(err => setFormMessage({ type: 'error', text: err.response?.data?.error?.message || 'Could not add movie' }))
      .finally(() => setIsAdding(false));
  }

  function onDelete(id) {
    if (!confirm("Delete this movie? It'll disappear from listings, but any past orders for it are kept intact.")) return;
    setDeletingId(id);
    api.delete(`/movies/${id}`)
      .then(fetchMovies)
      .catch(err => setError(err.response?.data?.error?.message || 'Could not delete movie'))
      .finally(() => setDeletingId(null));
  }

  return (
    <>
      <form onSubmit={onAdd} className="admin-form">
        {formMessage && <div className={formMessage.type === 'error' ? 'error-banner' : 'ok-banner'}>{formMessage.text}</div>}
        <label>Title</label>
        <input value={form.title} onChange={update('title')} required />

        <label>IMDb ID <span className="admin-table__muted">(e.g. tt0372784 — used to fetch real details/trailer)</span></label>
        <input value={form.imdbID} onChange={update('imdbID')} required />

        <label>Hall</label>
        <input type="number" value={form.hall} onChange={update('hall')} required />

        <label>Date</label>
        <input type="datetime-local" value={form.date} onChange={update('date')} required />

        <button type="submit" disabled={isAdding}>{isAdding ? 'Adding…' : 'Add movie'}</button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      <button className="link-btn" onClick={() => setShowDeleted(true)}>View deleted movies</button>

      {isLoading
        ? <div className="center"><div className="spinner" /></div>
        : (
          <table className="admin-table">
            <thead><tr><th>#</th><th>Title</th><th>Year</th><th>Hall</th><th>Actions</th></tr></thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.id}>
                  <td>{movie.id}</td>
                  <td>{movie.Title || movie.title}</td>
                  <td>{movie.Year}</td>
                  <td>{movie.hall}</td>
                  <td>
                    <button className="btn-edit" onClick={() => setEditingMovie(movie)}>Edit</button>{' '}
                    <button className="btn-delete" disabled={deletingId === movie.id} onClick={() => onDelete(movie.id)}>
                      {deletingId === movie.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      {showDeleted && (
        <DeletedMoviesModal onClose={() => setShowDeleted(false)} onRestored={fetchMovies} />
      )}

      {editingMovie && (
        <EditMovieModal movie={editingMovie} onClose={() => setEditingMovie(null)} onSaved={fetchMovies} />
      )}
    </>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  return (
    <div className="container">
      {isAdmin && <>
        <h2>Pending payments</h2>
        <OrdersPanel />
      </>}

      <h2>Movies</h2>
      <MoviesPanel />

      {isAdmin && <>
        <h2>Users</h2>
        <UsersPanel />
      </>}
    </div>
  );
}
