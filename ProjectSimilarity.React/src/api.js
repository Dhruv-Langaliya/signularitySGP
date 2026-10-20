import { API_BASE } from './constants.js';

export async function runSimilarityAPI(projectId, authToken) {
  const res = await fetch(`${API_BASE}/similarity/run/${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Similarity analysis failed.');
  return data;
}

export async function deleteProjectAPI(projectId, authToken) {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to delete project submission.');
  return data;
}

export async function changeUserRoleAPI(userId, role, authToken) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
    body: JSON.stringify({ role })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Unable to update user role.');
  return data;
}

export async function loadAdminDataAPI(authToken) {
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Unable to load administrator data.');
  return data;
}

export async function deleteUserAPI(email, authToken) {
  await fetch(`${API_BASE}/admin/users/email/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  }).catch(() => {});
}

export async function uploadProjectAPI(formData, authToken) {
  const res = await fetch(`${API_BASE}/projects/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
    body: formData
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

export async function registerUserAPI({ name, email, department, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, department: department || 'Computer Engineering', password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed.');
  return data;
}
