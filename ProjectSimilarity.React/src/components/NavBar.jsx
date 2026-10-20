import React from 'react';
import { useApp } from '../AppContext';
import { getNormalizedRole } from '../utils';
import { PERMISSIONS } from '../constants';

export default function NavBar({ currentTab, setCurrentTab, currentAdminTab, setCurrentAdminTab }) {
  const { userRole, checkPermission } = useApp();
  const normRole = getNormalizedRole(userRole);

  if (normRole === 'Student') {
    return (
      <nav className="nav-bar" id="navBar">
        <button
          className={`nav-tab ${currentTab === 'Dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('Dashboard')}
        >
          📊 Dashboard
        </button>
        {checkPermission(PERMISSIONS.UploadProject) && (
          <button
            className={`nav-tab ${currentTab === 'Upload' ? 'active' : ''}`}
            onClick={() => setCurrentTab('Upload')}
          >
            📤 Upload Project
          </button>
        )}
        <button
          className={`nav-tab ${currentTab === 'MyProject' ? 'active' : ''}`}
          onClick={() => setCurrentTab('MyProject')}
        >
          📁 My Submission
        </button>
      </nav>
    );
  }

  if (normRole === 'Faculty') {
    return (
      <nav className="nav-bar" id="navBar">
        <button
          className={`nav-tab ${currentTab === 'Dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('Dashboard')}
        >
          📊 Dashboard
        </button>
        {(checkPermission(PERMISSIONS.ViewPendingSubmissions) || checkPermission(PERMISSIONS.ViewSubmissionStatus)) && (
          <button
            className={`nav-tab ${currentTab === 'Monitoring' ? 'active' : ''}`}
            onClick={() => setCurrentTab('Monitoring')}
          >
            👥 Student Submissions
          </button>
        )}
        {checkPermission(PERMISSIONS.ViewProjects) && (
          <button
            className={`nav-tab ${currentTab === 'Projects' ? 'active' : ''}`}
            onClick={() => setCurrentTab('Projects')}
          >
            📚 Projects Repository
          </button>
        )}
        {checkPermission(PERMISSIONS.UploadProject) && (
          <button
            className={`nav-tab ${currentTab === 'Upload' ? 'active' : ''}`}
            onClick={() => setCurrentTab('Upload')}
          >
            📤 Upload Project
          </button>
        )}
        {(checkPermission(PERMISSIONS.CreateSubmissionBatch) ||
          checkPermission(PERMISSIONS.UpdateSubmissionBatch) ||
          checkPermission(PERMISSIONS.StartSubmissionBatch) ||
          checkPermission(PERMISSIONS.CloseSubmissionBatch)) && (
          <button
            className={`nav-tab ${currentTab === 'SubmissionWindows' ? 'active' : ''}`}
            onClick={() => setCurrentTab('SubmissionWindows')}
          >
            📅 Submission Windows
          </button>
        )}
      </nav>
    );
  }

  if (normRole === 'Admin') {
    return (
      <nav className="nav-bar" id="navBar">
        <button
          className={`nav-tab ${currentAdminTab === 'adminOverviewTab' ? 'active' : ''}`}
          onClick={() => setCurrentAdminTab('adminOverviewTab')}
        >
          📈 Overview
        </button>
        <button
          className={`nav-tab ${currentAdminTab === 'adminBatchesTab' ? 'active' : ''}`}
          onClick={() => setCurrentAdminTab('adminBatchesTab')}
        >
          📅 Submission Windows
        </button>
        <button
          className={`nav-tab ${currentAdminTab === 'adminAccessTab' ? 'active' : ''}`}
          onClick={() => setCurrentAdminTab('adminAccessTab')}
        >
          🛡️ Access Control Matrix
        </button>
        <button
          className={`nav-tab ${currentAdminTab === 'adminUsersTab' ? 'active' : ''}`}
          onClick={() => setCurrentAdminTab('adminUsersTab')}
        >
          👤 User Management
        </button>
        <button
          className={`nav-tab ${currentAdminTab === 'adminProjectsTab' ? 'active' : ''}`}
          onClick={() => setCurrentAdminTab('adminProjectsTab')}
        >
          📚 Projects & Similarity
        </button>
      </nav>
    );
  }

  return null;
}
