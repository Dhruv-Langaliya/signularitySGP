import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { getNormalizedRole } from '../../utils';
import { changeUserRoleAPI, deleteUserAPI, registerUserAPI } from '../../api';

export default function UserManagement() {
  const {
    authToken,
    userEmail,
    systemUsers,
    setSystemUsers,
    loadAdminData,
    logout,
    showAlert
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState('All'); // 'All' | 'Student' | 'Faculty' | 'Admin'
  const [search, setSearch] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Student');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');
  const [pass, setPass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedDept = dept.trim() || 'Computer Engineering';
    const trimmedYear = year.trim() || '2026-27';

    if (!trimmedName || !trimmedEmail) {
      showAlert('Please provide both full name and email address.', true);
      return;
    }

    const existingUser = systemUsers.find(
      (u) => (u.email || '').trim().toLowerCase() === trimmedEmail
    );
    if (existingUser) {
      showAlert(`Account with email "${trimmedEmail}" already exists.`, true);
      return;
    }

    const defaultPass =
      role === 'Admin' ? 'Admin@12345' : role === 'Faculty' ? 'Faculty@123' : 'Student@123';
    const userPassword = pass.trim() || defaultPass;

    setSubmitting(true);
    try {
      await registerUserAPI({
        name: trimmedName,
        email: trimmedEmail,
        department: trimmedDept,
        password: userPassword
      });

      const updatedUsers = await loadAdminData();
      if (role !== 'Student' && updatedUsers) {
        const createdUser = updatedUsers.find(
          (u) => u.email.toLowerCase() === trimmedEmail
        );
        if (createdUser) {
          await changeUserRoleAPI(createdUser.id, role, authToken);
          await loadAdminData();
        }
      }

      showAlert(`User account for ${trimmedName} (${role}) successfully created!`);
      setShowForm(false);
      setName('');
      setEmail('');
      setRole('Student');
      setDept('');
      setYear('');
      setPass('');
    } catch (err) {
      // If backend API failed, update locally
      const fallbackUser = {
        id: `u-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        password: userPassword,
        role: getNormalizedRole(role),
        department: trimmedDept,
        academicYear: trimmedYear,
        isActive: true
      };
      setSystemUsers((prev) => [...prev, fallbackUser]);
      showAlert(`User account for ${trimmedName} (${role}) created locally.`);
      setShowForm(false);
      setName('');
      setEmail('');
      setRole('Student');
      setDept('');
      setYear('');
      setPass('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const user = systemUsers.find((u) => String(u.id) === String(userId));
    if (!user || !newRole) return;

    try {
      await changeUserRoleAPI(userId, newRole, authToken);
      setSystemUsers((prev) =>
        prev.map((u) => (String(u.id) === String(userId) ? { ...u, role: newRole } : u))
      );
      showAlert(`${user.name} is now a ${newRole}.`);
    } catch (err) {
      // Fallback local update if API fails
      setSystemUsers((prev) =>
        prev.map((u) => (String(u.id) === String(userId) ? { ...u, role: newRole } : u))
      );
      showAlert(`${user.name} is now a ${newRole}.`);
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = systemUsers.find((u) => u.id === userId);
    if (
      user &&
      getNormalizedRole(user.role) === 'Admin' &&
      systemUsers.filter((u) => getNormalizedRole(u.role) === 'Admin').length <= 1
    ) {
      showAlert('Cannot delete the last remaining Administrator account.', true);
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete user account "${user ? user.name : userId}"?`
      )
    ) {
      return;
    }

    const deletedEmail = user ? user.email : null;
    setSystemUsers((prev) => prev.filter((u) => u.id !== userId));
    showAlert(`User account "${user ? user.name : userId}" permanently deleted.`);

    if (deletedEmail) {
      await deleteUserAPI(deletedEmail, authToken);
    }

    if (
      deletedEmail &&
      userEmail &&
      userEmail.toLowerCase() === deletedEmail.toLowerCase()
    ) {
      logout();
      showAlert('Your account was deleted by Administrator.', true);
    }
  };

  const searchLower = search.toLowerCase();
  const filteredUsers = (systemUsers || []).filter((u) => {
    const normUserRole = getNormalizedRole(u.role);
    if (filterRole !== 'All' && normUserRole !== filterRole) return false;
    if (searchLower) {
      const match =
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div id="adminUsersTab">
      <div className="card">
        <h2>
          <span>User & Role Administration</span>
          <button onClick={() => setShowForm(!showForm)} className="btn-sm">
            + Create New User
          </button>
        </h2>

        {showForm && (
          <div
            id="newUserFormContainer"
            style={{
              background: '#f8fafc',
              padding: '1.2rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem'
            }}
          >
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Register System User</h3>
            <form id="createUserForm" onSubmit={handleCreateUser}>
              <div className="grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    id="adminNewName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    id="adminNewEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Account Role</label>
                  <select
                    id="adminNewRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    id="adminNewDept"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Academic Year / Enrollment ID</label>
                  <input
                    type="text"
                    id="adminNewYear"
                    placeholder="23DCS001 / 2026-27"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    id="adminNewPass"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={{ width: 'auto' }} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="filter-bar">
          <div className="btn-group">
            <button
              className={`btn-filter ${filterRole === 'All' ? 'active' : ''}`}
              onClick={() => setFilterRole('All')}
            >
              All Users
            </button>
            <button
              className={`btn-filter ${filterRole === 'Student' ? 'active' : ''}`}
              onClick={() => setFilterRole('Student')}
            >
              Students
            </button>
            <button
              className={`btn-filter ${filterRole === 'Faculty' ? 'active' : ''}`}
              onClick={() => setFilterRole('Faculty')}
            >
              Faculty
            </button>
            <button
              className={`btn-filter ${filterRole === 'Admin' ? 'active' : ''}`}
              onClick={() => setFilterRole('Admin')}
            >
              Admins
            </button>
          </div>
          <input
            type="text"
            id="usersSearchInput"
            className="search-input"
            placeholder="Search user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="usersTbody">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const normR = getNormalizedRole(u.role);
                return (
                  <tr key={u.id || u.email}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="role-select"
                        value={normR}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        aria-label={`Change role for ${u.name}`}
                      >
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td>{u.department}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
