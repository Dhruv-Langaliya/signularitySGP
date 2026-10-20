import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { PERMISSIONS } from '../../constants';
import SubmissionBatchesTable from '../shared/SubmissionBatchesTable';

export default function SubmissionWindowsManager() {
  const { setSubmissionBatches, checkPermission, showAlert } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();

    if (!checkPermission(PERMISSIONS.CreateSubmissionBatch)) {
      showAlert('Permission Denied: CreateSubmissionBatch permission is required.', true);
      return;
    }

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
    showAlert(`Submission batch "${name}" successfully created by Faculty!`);
    setShowForm(false);
    setName('');
    setYear('');
    setDepartment('');
    setStartDate('');
    setEndDate('');
    setDesc('');
  };

  return (
    <div className="card" id="facultyBatchesCard">
      <h2>
        <span>Manage Project Submission Windows</span>
        <button onClick={() => setShowForm(!showForm)} className="btn-sm">
          + Create Submission Batch
        </button>
      </h2>

      {showForm && (
        <div
          id="facultyNewBatchFormContainer"
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
          <form id="facultyCreateBatchForm" onSubmit={handleCreate}>
            <div className="grid">
              <div className="form-group">
                <label>Batch Name</label>
                <input
                  type="text"
                  id="facBatchName"
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
                  id="facBatchYear"
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
                  id="facBatchDept"
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
                  id="facBatchStart"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date & Time (Deadline)</label>
                <input
                  type="datetime-local"
                  id="facBatchEnd"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  id="facBatchDesc"
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

      <SubmissionBatchesTable showCompletion={false} />
    </div>
  );
}
