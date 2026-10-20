import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { getNormalizedRole } from '../../utils';

export default function StudentMonitoringTable() {
  const { systemUsers, projects } = useApp();
  const [filter, setFilter] = useState('All'); // 'All' | 'Submitted' | 'Pending'
  const [search, setSearch] = useState('');

  const students = (systemUsers || []).filter(
    (u) => getNormalizedRole(u.role) === 'Student'
  );
  const uploadedProjects = projects || [];
  const searchLower = search.toLowerCase();

  const filteredStudents = students
    .map((st) => {
      const matchingProj = uploadedProjects.find(
        (p) =>
          (p.uploadedByName && p.uploadedByName === st.name) ||
          (p.studentName && p.studentName === st.name) ||
          (p.uploadedByEmail && p.uploadedByEmail === st.email) ||
          (p.studentId && p.studentId === st.academicYear)
      );
      const isSubmitted = !!matchingProj;
      const projTitle = matchingProj ? matchingProj.title : 'Not Submitted';
      const submittedAtStr = matchingProj
        ? new Date(matchingProj.createdAt || matchingProj.uploadedAt || Date.now()).toLocaleDateString()
        : '-';

      if (filter === 'Submitted' && !isSubmitted) return null;
      if (filter === 'Pending' && isSubmitted) return null;

      if (searchLower) {
        const matchSearch =
          st.name.toLowerCase().includes(searchLower) ||
          (st.academicYear && st.academicYear.toLowerCase().includes(searchLower)) ||
          st.department.toLowerCase().includes(searchLower) ||
          projTitle.toLowerCase().includes(searchLower);
        if (!matchSearch) return null;
      }

      return {
        ...st,
        isSubmitted,
        matchingProj,
        projTitle,
        submittedAtStr
      };
    })
    .filter(Boolean);

  return (
    <div className="card" id="facultyMonitoringCard">
      <h2>
        <span>Student Submission Status & Pending Tracking</span>
        <span className="badge badge-faculty">Real-Time</span>
      </h2>

      <div className="filter-bar">
        <div className="btn-group">
          <button
            className={`btn-filter ${filter === 'All' ? 'active' : ''}`}
            onClick={() => setFilter('All')}
          >
            All Students
          </button>
          <button
            className={`btn-filter ${filter === 'Submitted' ? 'active' : ''}`}
            onClick={() => setFilter('Submitted')}
          >
            Submitted
          </button>
          <button
            className={`btn-filter ${filter === 'Pending' ? 'active' : ''}`}
            onClick={() => setFilter('Pending')}
          >
            Pending (Not Submitted)
          </button>
        </div>
        <input
          type="text"
          id="facSearchInput"
          className="search-input"
          placeholder="Search by name, ID, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Enrollment ID</th>
            <th>Department</th>
            <th>Project Submission</th>
            <th>Submitted At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="facultyStudentTbody">
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                No student records found matching filter.
              </td>
            </tr>
          ) : (
            filteredStudents.map((st) => (
              <tr key={st.id || st.email}>
                <td><strong>{st.name}</strong></td>
                <td><code>{st.academicYear || '23DCS001'}</code></td>
                <td>{st.department}</td>
                <td>
                  {st.isSubmitted ? (
                    st.projTitle
                  ) : (
                    <em style={{ color: 'var(--text-muted)' }}>Not Submitted</em>
                  )}
                </td>
                <td>{st.submittedAtStr}</td>
                <td>
                  <span
                    className={`badge badge-${st.isSubmitted ? 'submitted' : 'pending'}`}
                  >
                    {st.isSubmitted ? 'Submitted' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
