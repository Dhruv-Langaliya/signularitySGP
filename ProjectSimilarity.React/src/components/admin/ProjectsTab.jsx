import React from 'react';
import { useApp } from '../../AppContext';
import { deleteProjectAPI } from '../../api';

export default function ProjectsTab({ onRunSimilarity }) {
  const { authToken, projects, loadProjects, showAlert } = useApp();

  const handleDelete = async (projectId, projectTitle) => {
    const confirmMsg = projectTitle
      ? `Are you sure you want to delete submission "${projectTitle}"?`
      : 'Are you sure you want to delete this project submission?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteProjectAPI(projectId, authToken);
      showAlert('Project submission deleted successfully.');
      await loadProjects();
    } catch (err) {
      showAlert(err.message || 'Failed to delete project submission.', true);
    }
  };

  const list = Array.isArray(projects) ? projects : [];

  return (
    <div id="adminProjectsTab">
      <div className="card">
        <h2>
          <span>System-Wide Project Repository</span>
          <button onClick={loadProjects} className="outline">
            Refresh List
          </button>
        </h2>

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Uploaded By</th>
              <th>Domain</th>
              <th>Year</th>
              <th>Uploaded Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="adminProjectsTbody">
            {list.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No projects registered.
                </td>
              </tr>
            ) : (
              list.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong></td>
                  <td>{p.uploadedByName || p.studentName || 'Student'}</td>
                  <td>{p.domain}</td>
                  <td>{p.academicYear}</td>
                  <td>{new Date(p.uploadedAt || p.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => onRunSimilarity(p.id)}
                      className="btn-sm btn-success"
                    >
                      Run Similarity
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="btn-sm btn-danger"
                      style={{ marginLeft: '0.35rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
