import React from 'react';
import { useApp } from '../../AppContext';
import { getBatchStatus, getNormalizedRole } from '../../utils';

export default function SubmissionBatchesTable({ showCompletion = false }) {
  const { submissionBatches, setSubmissionBatches, systemUsers, projects, showAlert } = useApp();

  const toggleBatchActive = (batchId) => {
    const target = submissionBatches.find((b) => b.id === batchId);
    if (!target) return;
    const newStatus = !target.isActive;
    setSubmissionBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, isActive: newStatus } : b))
    );
    showAlert(`Submission batch "${target.name}" status updated to ${newStatus ? 'Active' : 'Closed'}.`);
  };

  const deleteBatch = (batchId) => {
    if (window.confirm('Are you sure you want to delete this submission batch?')) {
      setSubmissionBatches((prev) => prev.filter((b) => b.id !== batchId));
      showAlert('Submission batch deleted.');
    }
  };

  const studentsCount = systemUsers.filter((u) => getNormalizedRole(u.role) === 'Student').length;
  const submittedCount = (projects || []).length;
  const completionRate = studentsCount > 0 ? Math.round((submittedCount / studentsCount) * 100) : 0;

  return (
    <table>
      <thead>
        <tr>
          <th>Batch Name</th>
          <th>Academic Year</th>
          <th>Department</th>
          <th>Start Date</th>
          <th>End Date (Deadline)</th>
          <th>Status</th>
          {showCompletion && <th>Completion</th>}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {submissionBatches.length === 0 ? (
          <tr>
            <td colSpan={showCompletion ? 8 : 7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No submission batches configured. Click "+ Create Submission Batch" to add one.
            </td>
          </tr>
        ) : (
          submissionBatches.map((b) => {
            const status = getBatchStatus(b);
            const startStr = new Date(b.startDate).toLocaleString();
            const endStr = new Date(b.endDate).toLocaleString();

            return (
              <tr key={b.id}>
                <td><strong>{b.name}</strong></td>
                <td>{b.academicYear}</td>
                <td>{b.department}</td>
                <td>{startStr}</td>
                <td>{endStr}</td>
                <td>
                  <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
                </td>
                {showCompletion && (
                  <td>
                    <span>{submittedCount} / {studentsCount} ({completionRate}%)</span>
                  </td>
                )}
                <td>
                  <button
                    onClick={() => toggleBatchActive(b.id)}
                    className="outline btn-sm"
                  >
                    {b.isActive ? 'Close Window' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteBatch(b.id)}
                    className="btn-danger btn-sm"
                    style={{ marginLeft: '0.35rem' }}
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
  );
}
