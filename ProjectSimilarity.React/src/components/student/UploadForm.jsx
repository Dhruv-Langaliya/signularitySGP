import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { PERMISSIONS } from '../../constants';
import { getBatchStatus } from '../../utils';
import { uploadProjectAPI } from '../../api';

export default function UploadForm() {
  const {
    authToken,
    userName,
    userEmail,
    submissionBatches,
    projects,
    loadProjects,
    checkPermission,
    showAlert
  } = useApp();

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const mySubmissions = (projects || []).filter(
    (p) =>
      (p.uploadedByName && p.uploadedByName === userName) ||
      (p.studentName && p.studentName === userName) ||
      (p.uploadedByEmail && p.uploadedByEmail === userEmail)
  );

  const activeBatches = (submissionBatches || []).filter((b) => getBatchStatus(b) === 'ACTIVE');
  const submittedCount = mySubmissions.length;
  const pendingActiveBatches = activeBatches.slice(submittedCount);

  const hasOpenWindow = (submissionBatches || []).some((b) => getBatchStatus(b) === 'ACTIVE');
  const allActiveSubmitted = hasOpenWindow && pendingActiveBatches.length === 0;

  const currentBatchId = selectedBatchId || pendingActiveBatches[0]?.id || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkPermission(PERMISSIONS.UploadProject)) {
      showAlert('Permission Denied: UploadProject permission is required.', true);
      return;
    }

    const targetBatch =
      submissionBatches.find((b) => b.id === currentBatchId) || activeBatches[0];

    const windowStatus = getBatchStatus(targetBatch);
    if (windowStatus !== 'ACTIVE') {
      showAlert(
        `Upload Failed: Selected submission window "${targetBatch ? targetBatch.name : ''}" is currently ${windowStatus}.`,
        true
      );
      return;
    }

    if (!file) {
      showAlert('Please select a project document file to upload.', true);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('domain', domain);
    formData.append('academicYear', year);
    formData.append('file', file);

    setUploading(true);
    try {
      await uploadProjectAPI(formData, authToken);
      showAlert(
        `Project successfully submitted for ${targetBatch ? targetBatch.name : 'Submission Window'}!`
      );
      setTitle('');
      setDomain('');
      setYear('');
      setFile(null);
      // Reset file input element value if present
      const fileInput = document.getElementById('projFile');
      if (fileInput) fileInput.value = '';
      await loadProjects();
    } catch (err) {
      showAlert(err.message || 'Upload failed. Please try again.', true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" id="uploadCard">
      <h2>Upload Project Document</h2>
      <div id="uploadFormContainer">
        {!checkPermission(PERMISSIONS.UploadProject) ? (
          <div className="alert alert-error" style={{ display: 'block' }}>
            ⚠️ You do not currently have the <strong>UploadProject</strong> permission. Contact administrator.
          </div>
        ) : !hasOpenWindow ? (
          <div className="alert alert-error" style={{ display: 'block' }}>
            ⚠️ No active submission windows are currently open for project uploading.
          </div>
        ) : allActiveSubmitted ? (
          <div
            className="alert"
            style={{
              display: 'block',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#166534',
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <strong>✅ All submissions complete!</strong>
            <br />
            <span style={{ fontSize: '0.9rem', color: '#15803d' }}>
              You have submitted to all open submission windows. No more tasks remaining.
            </span>
          </div>
        ) : (
          <form id="uploadForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Submission Window / Batch</label>
              <select
                id="projBatchSelect"
                value={currentBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                required
              >
                {pendingActiveBatches.length === 0 ? (
                  <option value="" disabled>
                    No pending submission windows
                  </option>
                ) : (
                  pendingActiveBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Project Title</label>
              <input
                type="text"
                id="projTitle"
                placeholder="Autonomous Robot Navigation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Domain / Category</label>
              <input
                type="text"
                id="projDomain"
                placeholder="Artificial Intelligence"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Academic Year</label>
              <input
                type="text"
                id="projYear"
                placeholder="2026-2027"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Project File (.pdf, .docx, .cs, .js, .py, .txt)</label>
              <input
                type="file"
                id="projFile"
                onChange={(e) => setFile(e.target.files[0] || null)}
                required
              />
            </div>
            <button type="submit" style={{ width: 'auto' }} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload & Submit Project'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
