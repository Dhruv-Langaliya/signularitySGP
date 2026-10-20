import React, { useState } from 'react';
import { useApp } from '../../AppContext';

export default function LoginCard({ onSwitchToRegister, initialEmail = '' }) {
  const { login, showAlert } = useApp();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      showAlert('Please enter both email address and password.', true);
      return;
    }

    setLoading(true);
    try {
      const res = await login(trimmedEmail, password);
      showAlert(`Welcome back, ${res.name}! Signed in as ${res.role}.`);
    } catch (err) {
      showAlert(err.message || 'Invalid email address or password.', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" id="loginCard">
      <h2>Account Login</h2>

      <form id="loginForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            id="loginEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            id="loginPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <div className="auth-toggle-text">
          New user?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToRegister();
            }}
          >
            Register here
          </a>
        </div>
      </form>
    </div>
  );
}
