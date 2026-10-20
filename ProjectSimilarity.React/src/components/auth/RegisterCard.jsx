import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { registerUserAPI } from '../../api';

export default function RegisterCard({ onSwitchToLogin }) {
  const { setSystemUsers, showAlert } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedDept = department.trim() || 'Computer Engineering';

    if (!trimmedName || !trimmedEmail || !password) {
      showAlert('Please fill in all required fields.', true);
      return;
    }

    setLoading(true);
    try {
      await registerUserAPI({
        name: trimmedName,
        email: trimmedEmail,
        department: trimmedDept,
        password
      });

      const newUser = {
        id: `u-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        password,
        role: 'Student',
        department: trimmedDept,
        academicYear: '2026-27',
        isActive: true
      };

      setSystemUsers((prev) => [...prev, newUser]);
      showAlert(`Account created successfully for ${trimmedName}! You can now sign in with your credentials.`);
      onSwitchToLogin(trimmedEmail);
    } catch (err) {
      showAlert(err.message || 'Registration failed. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" id="registerCard">
      <h2>Create Account (Sign Up)</h2>
      <form id="registerForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            id="regName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            id="regEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            id="regDept"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Account Role</label>
          <input type="text" value="Student (assigned by default)" disabled />
          <small className="form-help">
            New accounts start as Student. An Administrator can promote approved users to Faculty.
          </small>
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            id="regPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="secondary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        <div className="auth-toggle-text">
          Already have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
          >
            Sign in here
          </a>
        </div>
      </form>
    </div>
  );
}
