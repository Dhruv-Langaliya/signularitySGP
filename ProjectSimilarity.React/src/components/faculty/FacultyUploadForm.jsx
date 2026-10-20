import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { PERMISSIONS } from '../../constants';
import { uploadProjectAPI } from '../../api';

export default function FacultyUploadForm() {
  const { authToken, loadProjects, checkPermission, showAlert } = useApp();

  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkPermission(PERMISSIONS.UploadProject)) {
      showAlert('Permission Denied: UploadProject permission is required.', true);
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
      showAlert('Project successfully uploaded and registered!');
      setTitle('');
      setDomain('');
      setYear('');
      setFile(null);
      const fileInput = document.getElementById('facProjFile');
      if (fileInput) fileInput.value = '';
      await loadProjects();
    } catch (err) {
      showAlert(err.message || 'Upload failed. Please try again.', true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" id="facultyUploadCard">
      <h2>Upload Project Document</h2>
      <form id="facultyUploadForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Project Title</label>
          <input
            type="text"
            id="facProjTitle"
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
            id="facProjDomain"
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
            id="facProjYear"
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
            id="facProjFile"
            onChange={(e) => setFile(e.target.files[0] || null)}
            required
          />
        </div>
        <button type="submit" style={{ width: 'auto' }} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload & Register Project'}
        </button>
      </form>
    </div>
  );
}
