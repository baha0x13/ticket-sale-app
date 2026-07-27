import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../auth/useAuth.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register(email, password, name);
      navigate('/movies', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container auth-form">
      <h2>Create an account</h2>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={onSubmit}>
        <label>Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />

        <button type="submit" disabled={isLoading}>{isLoading ? 'Creating…' : 'Register'}</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
