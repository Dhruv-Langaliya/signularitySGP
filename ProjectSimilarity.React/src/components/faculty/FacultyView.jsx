import React from 'react';
import { useApp } from '../../AppContext';
import { PERMISSIONS } from '../../constants';
import FacultyBanner from './FacultyBanner';
import FacultyStats from './FacultyStats';
import StudentMonitoringTable from './StudentMonitoringTable';
import ProjectsRepository from './ProjectsRepository';
import FacultyUploadForm from './FacultyUploadForm';
import SubmissionWindowsManager from './SubmissionWindowsManager';

export default function FacultyView({ currentTab, onRunSimilarity }) {
  const { checkPermission } = useApp();

  const canUpload = checkPermission(PERMISSIONS.UploadProject);
  const canManageBatches =
    checkPermission(PERMISSIONS.CreateSubmissionBatch) ||
    checkPermission(PERMISSIONS.UpdateSubmissionBatch) ||
    checkPermission(PERMISSIONS.StartSubmissionBatch) ||
    checkPermission(PERMISSIONS.CloseSubmissionBatch);
  const canViewMonitoring =
    checkPermission(PERMISSIONS.ViewPendingSubmissions) ||
    checkPermission(PERMISSIONS.ViewSubmissionStatus);
  const canViewProjects = checkPermission(PERMISSIONS.ViewProjects);

  return (
    <div id="facultyView">
      <FacultyBanner />

      {currentTab === 'Dashboard' && (
        <>
          <FacultyStats />
          {canViewMonitoring && <StudentMonitoringTable />}
          {canViewProjects && <ProjectsRepository onRunSimilarity={onRunSimilarity} />}
          {canUpload && <FacultyUploadForm />}
          {canManageBatches && <SubmissionWindowsManager />}
        </>
      )}

      {currentTab === 'Monitoring' && (
        <>
          <FacultyStats />
          <StudentMonitoringTable />
        </>
      )}

      {currentTab === 'Projects' && (
        <ProjectsRepository onRunSimilarity={onRunSimilarity} />
      )}

      {currentTab === 'Upload' && (
        <FacultyUploadForm />
      )}

      {currentTab === 'SubmissionWindows' && (
        <SubmissionWindowsManager />
      )}
    </div>
  );
}
