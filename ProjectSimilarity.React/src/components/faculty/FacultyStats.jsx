import React from 'react';
import { useApp } from '../../AppContext';
import { getNormalizedRole } from '../../utils';

export default function FacultyStats() {
  const { systemUsers, projects } = useApp();

  const students = (systemUsers || []).filter(
    (u) => getNormalizedRole(u.role) === 'Student'
  );
  const uploadedProjects = projects || [];

  let submittedCount = 0;
  let pendingCount = 0;

  students.forEach((st) => {
    const matchingProj = uploadedProjects.find(
      (p) =>
        (p.uploadedByName && p.uploadedByName === st.name) ||
        (p.studentName && p.studentName === st.name) ||
        (p.uploadedByEmail && p.uploadedByEmail === st.email) ||
        (p.studentId && p.studentId === st.academicYear)
    );
    if (matchingProj) submittedCount++;
    else pendingCount++;
  });

  const totalStudents = students.length;
  const ratePct = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

  return (
    <div className="stats-grid" id="facultyStatsGrid">
      <div className="stat-box">
        <div className="stat-value" id="facTotalStudents">
          {totalStudents}
        </div>
        <div className="stat-label">Total Students</div>
      </div>
      <div className="stat-box">
        <div className="stat-value" id="facSubmittedCount" style={{ color: 'var(--success)' }}>
          {submittedCount}
        </div>
        <div className="stat-label">Submitted</div>
      </div>
      <div className="stat-box">
        <div className="stat-value" id="facPendingCount" style={{ color: 'var(--warning)' }}>
          {pendingCount}
        </div>
        <div className="stat-label">Not Submitted</div>
      </div>
      <div className="stat-box">
        <div className="stat-value" id="facSubmissionRate">
          {ratePct}%
        </div>
        <div className="stat-label">Submission Rate</div>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              id="facRateBar"
              style={{ width: `${ratePct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
