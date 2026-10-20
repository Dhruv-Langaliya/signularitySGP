import React from 'react';
import AdminOverview from './AdminOverview';
import BatchesTab from './BatchesTab';
import AccessControlMatrix from './AccessControlMatrix';
import UserManagement from './UserManagement';
import ProjectsTab from './ProjectsTab';

export default function AdminView({ currentAdminTab, onRunSimilarity }) {
  return (
    <div id="adminView">
      {currentAdminTab === 'adminOverviewTab' && <AdminOverview />}
      {currentAdminTab === 'adminBatchesTab' && <BatchesTab />}
      {currentAdminTab === 'adminAccessTab' && <AccessControlMatrix />}
      {currentAdminTab === 'adminUsersTab' && <UserManagement />}
      {currentAdminTab === 'adminProjectsTab' && (
        <ProjectsTab onRunSimilarity={onRunSimilarity} />
      )}
    </div>
  );
}
