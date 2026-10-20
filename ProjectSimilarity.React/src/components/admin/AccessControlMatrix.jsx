import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { PERMISSION_CATEGORIES, PERMISSIONS } from '../../constants';

export default function AccessControlMatrix() {
  const { rolePermissions, setRolePermissions, showAlert } = useApp();
  const [localPermissions, setLocalPermissions] = useState(() => ({
    Student: rolePermissions?.Student || [],
    Faculty: rolePermissions?.Faculty || [],
    Admin: Object.values(PERMISSIONS)
  }));

  useEffect(() => {
    setLocalPermissions({
      Student: rolePermissions?.Student || [],
      Faculty: rolePermissions?.Faculty || [],
      Admin: Object.values(PERMISSIONS)
    });
  }, [rolePermissions]);

  const togglePermission = (role, perm) => {
    setLocalPermissions((prev) => {
      const currentList = prev[role] || [];
      const hasPerm = currentList.includes(perm);
      const updatedList = hasPerm
        ? currentList.filter((p) => p !== perm)
        : [...currentList, perm];
      return {
        ...prev,
        [role]: updatedList
      };
    });
  };

  const handleSave = () => {
    const updated = {
      Student: localPermissions.Student,
      Faculty: localPermissions.Faculty,
      Admin: Object.values(PERMISSIONS)
    };
    setRolePermissions(updated);
    showAlert('Access Control Permission Matrix successfully updated and saved!');
  };

  return (
    <div id="adminAccessTab">
      <div className="card">
        <h2>
          <span>Access Control / Permission Matrix Editor</span>
          <button onClick={handleSave} className="btn-sm btn-success" style={{ width: 'auto' }}>
            Save Changes
          </button>
        </h2>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Manage fine-grained permissions for <strong>Student</strong> and <strong>Faculty</strong> roles. Changes are stored in the database and enforced by backend API authorization filters. Admin permissions are locked to maintain system stability.
        </p>

        <table className="permission-matrix-table" id="permissionMatrixTable">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '45%' }}>Permission Name</th>
              <th style={{ width: '18%' }}>Student</th>
              <th style={{ width: '18%' }}>Faculty</th>
              <th style={{ width: '18%' }}>Admin</th>
            </tr>
          </thead>
          <tbody id="permissionMatrixTbody">
            {Object.entries(PERMISSION_CATEGORIES).map(([catName, permList]) => (
              <React.Fragment key={catName}>
                <tr className="perm-category-row">
                  <td colSpan="4">{catName}</td>
                </tr>
                {permList.map((perm) => {
                  const studentChecked = (localPermissions.Student || []).includes(perm);
                  const facultyChecked = (localPermissions.Faculty || []).includes(perm);

                  return (
                    <tr key={perm}>
                      <td><strong>{perm}</strong></td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="checkbox-custom"
                          checked={studentChecked}
                          onChange={() => togglePermission('Student', perm)}
                          aria-label={`Student permission ${perm}`}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="checkbox-custom"
                          checked={facultyChecked}
                          onChange={() => togglePermission('Faculty', perm)}
                          aria-label={`Faculty permission ${perm}`}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="checkbox-custom"
                          checked={true}
                          disabled={true}
                          aria-label={`Admin permission ${perm}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
