import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DEFAULT_INITIAL_USERS, DEFAULT_BATCHES, DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, API_BASE } from './constants';
import { getNormalizedRole } from './utils';
import { loadAdminDataAPI } from './api';

const AppContext = createContext(null);

function migrateUsers(stored) {
  let users = stored ? JSON.parse(stored) : [...DEFAULT_INITIAL_USERS];
  let changed = false;
  DEFAULT_INITIAL_USERS.forEach(defUser => {
    const exists = users.find(u => u.email.toLowerCase() === defUser.email.toLowerCase());
    if (!exists) { users.push(defUser); changed = true; }
  });
  const defFacultyEmails = DEFAULT_INITIAL_USERS.filter(u => getNormalizedRole(u.role) === 'Faculty').map(u => u.email.toLowerCase());
  const before = users.length;
  users = users.filter(u => getNormalizedRole(u.role) !== 'Faculty' || defFacultyEmails.includes(u.email.toLowerCase()));
  if (users.length !== before) changed = true;
  if (changed || !stored) localStorage.setItem('app_system_users_v3', JSON.stringify(users));
  return users;
}

function loadPermissions() {
  try {
    const stored = JSON.parse(localStorage.getItem('app_role_permissions_v4'));
    if (stored && stored.Faculty && stored.Faculty.includes(PERMISSIONS.RunSimilarity)) return stored;
  } catch (e) {}
  const fresh = { ...DEFAULT_ROLE_PERMISSIONS, Admin: Object.values(PERMISSIONS) };
  localStorage.setItem('app_role_permissions_v4', JSON.stringify(fresh));
  return fresh;
}

export function AppProvider({ children }) {
  // Auth state
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('jwt_token') || null);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('user_role') || null);
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || null);
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('user_email') || null);

  // System state
  const [systemUsers, setSystemUsersRaw] = useState(() => migrateUsers(localStorage.getItem('app_system_users_v3')));
  const [rolePermissions, setRolePermissionsRaw] = useState(loadPermissions);
  const [submissionBatches, setSubmissionBatchesRaw] = useState(() =>
    JSON.parse(localStorage.getItem('app_submission_batches')) || DEFAULT_BATCHES
  );
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('cached_projects')) || []);

  // Alert state
  const [alert, setAlert] = useState({ msg: '', isError: false, visible: false });

  // Persisted setters
  const setSystemUsers = useCallback(users => {
    setSystemUsersRaw(prev => {
      const u = typeof users === 'function' ? users(prev) : users;
      localStorage.setItem('app_system_users_v3', JSON.stringify(u));
      return u;
    });
  }, []);

  const setRolePermissions = useCallback(perms => {
    setRolePermissionsRaw(prev => {
      const p = typeof perms === 'function' ? perms(prev) : perms;
      localStorage.setItem('app_role_permissions_v4', JSON.stringify(p));
      return p;
    });
  }, []);

  const setSubmissionBatches = useCallback(batches => {
    setSubmissionBatchesRaw(prev => {
      const b = typeof batches === 'function' ? batches(prev) : batches;
      localStorage.setItem('app_submission_batches', JSON.stringify(b));
      return b;
    });
  }, []);

  // showAlert helper
  const showAlert = useCallback((msg, isError = false) => {
    setAlert({ msg, isError, visible: true });
    setTimeout(() => setAlert(a => ({ ...a, visible: false })), 5000);
  }, []);

  // checkPermission helper
  const checkPermission = useCallback((permName) => {
    const role = getNormalizedRole(userRole);
    if (!role) return false;
    if (role === 'Admin') return true;
    return (rolePermissions[role] || []).includes(permName);
  }, [userRole, rolePermissions]);

  // login
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid email or password.');
    const role = getNormalizedRole(data.role);
    setAuthToken(data.token);
    setUserRole(role);
    setUserName(data.name);
    setUserEmail(email);
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', data.name);
    localStorage.setItem('user_email', email);
    return { token: data.token, role, name: data.name };
  }, []);

  // logout
  const logout = useCallback(() => {
    setAuthToken(null);
    setUserRole(null);
    setUserName(null);
    setUserEmail(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
  }, []);

  // loadProjects
  const loadProjects = useCallback(async () => {
    if (!authToken) return [];
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        localStorage.setItem('cached_projects', JSON.stringify(data));
        return data;
      }
    } catch (e) {}
    const fallback = JSON.parse(localStorage.getItem('cached_projects')) || [];
    setProjects(fallback);
    return fallback;
  }, [authToken]);

  // loadAdminData
  const loadAdminData = useCallback(async () => {
    if (!authToken) return;
    try {
      const data = await loadAdminDataAPI(authToken);
      const updated = (data.users || []).map(user => ({
        ...user,
        role: getNormalizedRole(user.role)
      }));
      setSystemUsers(updated);
      return updated;
    } catch (err) {
      showAlert(err.message || 'Unable to load administrator data.', true);
    }
  }, [authToken, setSystemUsers, showAlert]);

  const value = {
    authToken,
    userRole,
    userName,
    userEmail,
    systemUsers,
    setSystemUsers,
    rolePermissions,
    setRolePermissions,
    submissionBatches,
    setSubmissionBatches,
    projects,
    setProjects,
    loadProjects,
    loadAdminData,
    alert,
    showAlert,
    checkPermission,
    login,
    logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
