import React from 'react';
import { useApp } from '../../AppContext';
import { getBatchStatus } from '../../utils';

export default function SubmissionBanner() {
  const { submissionBatches } = useApp();

  if (!submissionBatches || submissionBatches.length === 0) {
    return (
      <div id="studentWindowBanner" className="window-banner banner-closed">
        <div className="banner-info">
          <h3>Submission Window Status: CLOSED</h3>
          <p>
            No active submission period is currently open. Please wait for an administrator to open a submission batch.
          </p>
        </div>
        <span className="badge badge-closed">Closed</span>
      </div>
    );
  }

  return (
    <div id="studentWindowBanner">
      {submissionBatches.map((batch) => {
        const windowStatus = getBatchStatus(batch);
        const startDateStr = new Date(batch.startDate).toLocaleString();
        const endDateStr = new Date(batch.endDate).toLocaleString();

        let bannerClass = 'banner-closed';
        let badgeLabel = 'Closed';
        let badgeClass = 'badge-closed';

        if (windowStatus === 'ACTIVE') {
          bannerClass = 'banner-active';
          badgeLabel = 'Window Open';
          badgeClass = 'badge-active';
        } else if (windowStatus === 'UPCOMING') {
          bannerClass = 'banner-upcoming';
          badgeLabel = 'Upcoming';
          badgeClass = 'badge-upcoming';
        }

        return (
          <div
            key={batch.id}
            className={`window-banner ${bannerClass}`}
            style={{ marginBottom: '0.8rem' }}
          >
            <div className="banner-info">
              <h3>Submission Period: {batch.name}</h3>
              <p>
                <strong>Academic Year:</strong> {batch.academicYear} |{' '}
                <strong>Start:</strong> {startDateStr} |{' '}
                <strong>Deadline:</strong> {endDateStr}
              </p>
            </div>
            <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
