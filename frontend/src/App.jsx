import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router';

import Movies from './pages/Movies.jsx';
import Movie from './pages/Movie.jsx';
import Orders from './pages/Orders.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Payment from './pages/Payment.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useAuth } from './auth/useAuth.js';
import RequireAuth from './auth/RequireAuth.jsx';
import RequireRole from './auth/RequireRole.jsx';

function navLinkClass({ isActive }) {
  return 'nav__link' + (isActive ? ' active' : '');
}

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate('/movies');
  }

  return (
    <div>
      <nav className="nav">
        <span className="nav__title">Ticket-Sale 🎬</span>
        <NavLink to="/movies" className={navLinkClass}>Movies</NavLink>

        {user && <NavLink to="/orders" className={navLinkClass}>Orders</NavLink>}
        {(user?.role === 'admin' || user?.role === 'editor') &&
          <NavLink to="/admin" className={navLinkClass}>Dashboard</NavLink>}

        {user
          ? <>
              <span className="nav__link">Hi, {user.name}</span>
              <button className="nav__logout" onClick={onLogout}>Log out</button>
            </>
          : <>
              <NavLink to="/login" className={navLinkClass}>Log in</NavLink>
              <NavLink to="/register" className={navLinkClass}>Register</NavLink>
            </>}
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/movies" replace />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<Movie />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path="/payment/:id" element={<RequireAuth><Payment /></RequireAuth>} />
        <Route path="/admin" element={<RequireRole roles={['admin', 'editor']}><AdminDashboard /></RequireRole>} />
      </Routes>
    </div>
  );
}
