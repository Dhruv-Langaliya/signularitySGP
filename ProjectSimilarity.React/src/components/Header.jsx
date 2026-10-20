import React from 'react';
import { useApp } from '../AppContext';
import { getNormalizedRole } from '../utils';

export default function Header() {
  const { authToken, userName, userRole, logout } = useApp();
  const normRole = getNormalizedRole(userRole);

  return (
    <header>
      <div className="brand">🔍 ProjectSimilarity Engine</div>
      <div className="user-info" id="userBar">
        {authToken ? (
          <>
            <span>Signed in as <strong>{userName || 'User'}</strong></span>
            <span className={`badge badge-${normRole.toLowerCase()}`}>{normRole}</span>
            <button className="outline" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
    </header>
  );
}
