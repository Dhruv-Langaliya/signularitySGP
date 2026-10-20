import React from 'react';
import { useApp } from '../../AppContext';
import { getBatchStatus } from '../../utils';

export default function MySubmissionStatus() {
  const { userName, userEmail, projects, submissionBatches } = useApp();

  const mySubmissions = (projects || []).filter(
    (p) =>
      (p.uploadedByName && p.uploadedByName === userName) ||
      (p.studentName && p.studentName === userName) ||
      (p.uploadedByEmail && p.uploadedByEmail === userEmail)
  );

  const activeBatches = (submissionBatches || []).filter((b) => getBatchStatus(b) === 'ACTIVE');
  const submittedCount = mySubmissions.length;
  const pendingActiveBatches = activeBatches.slice(submittedCount);

  return (
    <div className="card" id="mySubmissionCard">
      <h2>My Submission Status</h2>
      <div id="mySubmissionContent">
        {!submissionBatches || submissionBatches.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
            No submission windows configured.
          </p>
        ) : (
          <>
            {/* 1. Submitted cards */}
            {mySubmissions.map((sub, idx) => (
              <div
                key={sub.id || idx}
                style={{
                  background: '#eff6ff',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #bfdbfe',
                  marginBottom: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e40af' }}>
                      {sub.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                      <strong>Domain:</strong> {sub.domain} | <strong>Year:</strong> {sub.academicYear}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.1rem' }}>
                      <strong>Submitted At:</strong>{' '}
                      {new Date(sub.createdAt || sub.uploadedAt || Date.now()).toLocaleString()}
                    </div>
                  </div>
                  <span className="badge badge-submitted">✓ Submitted</span>
                </div>
              </div>
            ))}

            {/* 2. Pending active batches */}
            {pendingActiveBatches.length > 0 ? (
              pendingActiveBatches.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: '#fffbeb',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #fde68a',
                    marginBottom: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#92400e' }}>
                        📋 {b.name}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#78350f', marginTop: '0.2rem' }}>
                        <strong>Deadline:</strong> {new Date(b.endDate).toLocaleString()} — Upload your
                        project to complete this task.
                      </div>
                    </div>
                    <span className="badge badge-active">Pending</span>
                  </div>
                </div>
              ))
            ) : mySubmissions.length > 0 ? (
              <div
                style={{
                  background: '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #86efac',
                  marginBottom: '0.8rem',
                  textAlign: 'center'
                }}
              >
                <strong style={{ color: '#166534' }}>✅ No more tasks remaining!</strong>
                <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '0.3rem' }}>
                  You have submitted to all open submission windows.
                </div>
              </div>
            ) : null}

            {/* 3. If no submissions and no active pending batches, show closed/upcoming windows */}
            {mySubmissions.length === 0 && pendingActiveBatches.length === 0 && (
              <>
                {submissionBatches.map((b) => {
                  const windowStatus = getBatchStatus(b);
                  return (
                    <div
                      key={b.id}
                      style={{
                        background: '#f8fafc',
                        padding: '1rem',
                        borderRadius: '0.375rem',
                        border: '1px solid var(--border)',
                        marginBottom: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                            {b.name}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            <strong>Deadline:</strong> {new Date(b.endDate).toLocaleString()}
                          </div>
                        </div>
                        <span className={`badge badge-${windowStatus.toLowerCase()}`}>{windowStatus}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
