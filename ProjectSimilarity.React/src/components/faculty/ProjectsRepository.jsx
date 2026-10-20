import React from 'react';
import { useApp } from '../../AppContext';
import { PERMISSIONS } from '../../constants';
import { deleteProjectAPI } from '../../api';

export default function ProjectsRepository({ onRunSimilarity }) {
  const { authToken, projects, loadProjects, checkPermission, showAlert } = useApp();
  const canDelete = checkPermission(PERMISSIONS.DeleteProject);

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
    <div className="card" id="facultyProjectsCard">
      <h2>
        <span>Registered Student Projects Repository</span>
        <button onClick={loadProjects} className="outline">
          Refresh List
        </button>
      </h2>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Student</th>
            <th>Domain</th>
            <th>Year</th>
            <th>Submission Batch</th>
            <th>Uploaded Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="facultyProjectsTbody">
          {list.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                No projects registered.
              </td>
            </tr>
          ) : (
            list.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.title}</strong></td>
                <td>{p.studentName || p.uploadedByName || 'Student'}</td>
                <td>{p.domain}</td>
                <td>{p.academicYear}</td>
                <td>{p.batchName || 'SGP Phase 1'}</td>
                <td>{new Date(p.uploadedAt || p.createdAt || Date.now()).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => onRunSimilarity(p.id)}
                    className="btn-sm btn-success"
                  >
                    Run Similarity
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="btn-sm btn-danger"
                      style={{ marginLeft: '0.35rem' }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
