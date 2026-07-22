import { useState } from 'react';
import api from '../api';
import { AuthContext } from './authContext';

function loadStoredUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  function persist(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
  }

  async function register(email, password, name) {
    const { data } = await api.post('/auth/register', { email, password, name });
    persist(data.token, data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
