import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import SubmissionBatchesTable from '../shared/SubmissionBatchesTable';

export default function BatchesTab() {
  const { setSubmissionBatches, showAlert } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();

    const newBatch = {
      id: `batch-${Date.now()}`,
      name,
      academicYear: year,
      department,
      startDate,
      endDate,
      isActive: true,
      description: desc
    };

    setSubmissionBatches((prev) => [newBatch, ...prev]);
    showAlert(`Submission batch "${name}" successfully created!`);
    setShowForm(false);
    setName('');
    setYear('');
    setDepartment('');
    setStartDate('');
    setEndDate('');
    setDesc('');
  };

  return (
    <div id="adminBatchesTab">
      <div className="card">
        <h2>
          <span>Manage Submission Batches / Project Submission Windows</span>
          <button onClick={() => setShowForm(!showForm)} className="btn-sm">
            + Create Submission Batch
          </button>
        </h2>

        {showForm && (
          <div
            id="newBatchFormContainer"
            style={{
              background: '#f8fafc',
              padding: '1.2rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem'
            }}
          >
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              Create New SGP Submission Window
            </h3>
            <form id="createBatchForm" onSubmit={handleCreate}>
              <div className="grid">
                <div className="form-group">
                  <label>Batch Name</label>
                  <input
                    type="text"
                    id="batchName"
                    placeholder="SGP 2026-27 Project Submission - Phase 1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <input
                    type="text"
                    id="batchYear"
                    placeholder="2026-27"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    id="batchDept"
                    placeholder="Computer Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    id="batchStart"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date & Time (Deadline)</label>
                  <input
                    type="datetime-local"
                    id="batchEnd"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    id="batchDesc"
                    placeholder="Official phase 1 submission window for SGP capstone projects."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={{ width: 'auto' }}>
                  Save & Activate Batch
                </button>
              </div>
            </form>
          </div>
        )}

        <SubmissionBatchesTable showCompletion={true} />
      </div>
    </div>
  );
}
