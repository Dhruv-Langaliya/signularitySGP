import React from 'react';
import { useApp } from '../../AppContext';
import { getActiveSubmissionBatch, getBatchStatus } from '../../utils';

export default function FacultyBanner() {
  const { submissionBatches } = useApp();
  const activeBatch = getActiveSubmissionBatch(submissionBatches);

  if (!activeBatch) {
    return (
      <div id="facultyWindowBanner" className="window-banner banner-closed">
        <div className="banner-info">
          <h3>Faculty Submission Monitoring</h3>
          <p>No active submission period is currently open.</p>
        </div>
        <span className="badge badge-closed">Closed</span>
      </div>
    );
  }

  const windowStatus = getBatchStatus(activeBatch);

  return (
    <div
      id="facultyWindowBanner"
      className={`window-banner banner-${windowStatus.toLowerCase()}`}
    >
      <div className="banner-info">
        <h3>Faculty Submission Monitoring: {activeBatch.name}</h3>
        <p>
          <strong>Academic Year:</strong> {activeBatch.academicYear} |{' '}
          <strong>Deadline:</strong> {new Date(activeBatch.endDate).toLocaleString()}
        </p>
      </div>
      <span className={`badge badge-${windowStatus.toLowerCase()}`}>
        {windowStatus}
      </span>
    </div>
  );
}
