import React from 'react';
import { useApp } from '../../AppContext';
import { getNormalizedRole, getActiveSubmissionBatch } from '../../utils';
import { PERMISSIONS } from '../../constants';

export default function AdminOverview() {
  const { systemUsers, projects, submissionBatches, rolePermissions } = useApp();

  const totalStudents = (systemUsers || []).filter(
    (u) => getNormalizedRole(u.role) === 'Student'
  ).length;
  const totalFaculty = (systemUsers || []).filter(
    (u) => getNormalizedRole(u.role) === 'Faculty'
  ).length;
  const totalAdmins = (systemUsers || []).filter(
    (u) => getNormalizedRole(u.role) === 'Admin'
  ).length;

  const submittedCount = (projects || []).length;
  const pendingCount = Math.max(0, totalStudents - submittedCount);

  const activeBatch = getActiveSubmissionBatch(submissionBatches);

  return (
    <div id="adminOverviewTab">
      <div className="stats-grid" id="adminOverviewStats">
        <div className="stat-box">
          <div className="stat-value" id="admStatStudents">
            {totalStudents}
          </div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" id="admStatFaculty">
            {totalFaculty}
          </div>
          <div className="stat-label">Total Faculty</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" id="admStatAdmins">
            {totalAdmins}
          </div>
          <div className="stat-label">Total Admins</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" id="admStatProjects">
            {submittedCount}
          </div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" id="admStatSubmitted" style={{ color: 'var(--success)' }}>
            {submittedCount}
          </div>
          <div className="stat-label">Submitted</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" id="admStatPending" style={{ color: 'var(--warning)' }}>
            {pendingCount}
          </div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h2>Active Submission Window</h2>
          <div id="adminActiveWindowSummary">
            {activeBatch ? (
              <>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.05rem' }}>
                  {activeBatch.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  <strong>Academic Year:</strong> {activeBatch.academicYear} |{' '}
                  <strong>Status:</strong> <span className="badge badge-active">Active</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <strong>Deadline:</strong> {new Date(activeBatch.endDate).toLocaleString()}
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No active submission window configured.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2>System Security & Permissions Summary</h2>
          <div id="adminSecuritySummary">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <p><strong>RBAC System Status:</strong> Active & Enforced</p>
              <p><strong>Total Defined Permissions:</strong> {Object.keys(PERMISSIONS).length}</p>
              <p><strong>Student Allowed Perms:</strong> {(rolePermissions?.Student || []).length}</p>
              <p><strong>Faculty Allowed Perms:</strong> {(rolePermissions?.Faculty || []).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
