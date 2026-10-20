export const API_BASE = '/api';

export const PERMISSIONS = {
  UploadProject: 'UploadProject',
  ViewOwnProject: 'ViewOwnProject',
  ViewProjects: 'ViewProjects',
  ViewProjectDetails: 'ViewProjectDetails',
  DeleteProject: 'DeleteProject',
  RunSimilarity: 'RunSimilarity',
  ViewSimilarityResults: 'ViewSimilarityResults',
  GenerateSimilarityReport: 'GenerateSimilarityReport',
  ViewReports: 'ViewReports',
  ViewFacultyDashboard: 'ViewFacultyDashboard',
  ViewStudentDashboard: 'ViewStudentDashboard',
  ViewAdminDashboard: 'ViewAdminDashboard',
  CreateUser: 'CreateUser',
  ViewUsers: 'ViewUsers',
  UpdateUser: 'UpdateUser',
  DeactivateUser: 'DeactivateUser',
  DeleteUser: 'DeleteUser',
  ChangeUserRole: 'ChangeUserRole',
  ViewPermissions: 'ViewPermissions',
  ManagePermissions: 'ManagePermissions',
  CreateSubmissionBatch: 'CreateSubmissionBatch',
  UpdateSubmissionBatch: 'UpdateSubmissionBatch',
  DeleteSubmissionBatch: 'DeleteSubmissionBatch',
  StartSubmissionBatch: 'StartSubmissionBatch',
  CloseSubmissionBatch: 'CloseSubmissionBatch',
  ViewSubmissionStatus: 'ViewSubmissionStatus',
  ViewPendingSubmissions: 'ViewPendingSubmissions'
};

export const DEFAULT_ROLE_PERMISSIONS = {
  Student: [
    PERMISSIONS.UploadProject,
    PERMISSIONS.ViewOwnProject,
    PERMISSIONS.ViewStudentDashboard
  ],
  Faculty: [
    PERMISSIONS.ViewProjects,
    PERMISSIONS.ViewProjectDetails,
    PERMISSIONS.DeleteProject,
    PERMISSIONS.RunSimilarity,
    PERMISSIONS.ViewSimilarityResults,
    PERMISSIONS.GenerateSimilarityReport,
    PERMISSIONS.ViewReports,
    PERMISSIONS.ViewSubmissionStatus,
    PERMISSIONS.ViewPendingSubmissions,
    PERMISSIONS.CreateSubmissionBatch,
    PERMISSIONS.UpdateSubmissionBatch,
    PERMISSIONS.DeleteSubmissionBatch,
    PERMISSIONS.StartSubmissionBatch,
    PERMISSIONS.CloseSubmissionBatch,
    PERMISSIONS.ViewFacultyDashboard
  ],
  Admin: []
};
DEFAULT_ROLE_PERMISSIONS.Admin = Object.values(PERMISSIONS);

export const DEFAULT_INITIAL_USERS = [
  { id: 'u1', name: 'Dhruv', email: 'student@example.com', password: 'Student@123', role: 'Student', department: 'Computer Engineering', academicYear: '23DCS053', isActive: true },
  { id: 'u5', name: 'Dr. Sarah Smith', email: 'faculty@example.com', password: 'Faculty@123', role: 'Faculty', department: 'Computer Engineering', academicYear: 'FAC-101', isActive: true },
  { id: 'u7', name: 'Administrator', email: 'admin@projectsimilarity.local', password: 'Admin@12345', role: 'Admin', department: 'Administration', academicYear: 'ADM-001', isActive: true }
];

export const DEFAULT_BATCHES = [
  {
    id: 'batch-1',
    name: 'SGP 2026-27 Project Submission - Phase 1',
    academicYear: '2026-27',
    department: 'Computer Engineering',
    startDate: '2026-08-01T09:00',
    endDate: '2026-09-30T23:59',
    isActive: true,
    description: 'Official phase 1 submission window for SGP capstone projects.'
  },
  {
    id: 'batch-2',
    name: 'SGP 2026-27 Project Submission - Phase 2',
    academicYear: '2026-27',
    department: 'Computer Engineering',
    startDate: '2026-08-26T00:01',
    endDate: '2026-10-31T23:59',
    isActive: true,
    description: 'Official phase 2 submission window for SGP capstone projects.'
  }
];

export const PERMISSION_CATEGORIES = {
  'Projects & Submissions': [PERMISSIONS.UploadProject, PERMISSIONS.ViewOwnProject, PERMISSIONS.ViewProjects, PERMISSIONS.ViewProjectDetails, PERMISSIONS.DeleteProject],
  'Similarity Analysis & Reports': [PERMISSIONS.RunSimilarity, PERMISSIONS.ViewSimilarityResults, PERMISSIONS.GenerateSimilarityReport, PERMISSIONS.ViewReports],
  'Submission Status & Tracking': [PERMISSIONS.ViewSubmissionStatus, PERMISSIONS.ViewPendingSubmissions, PERMISSIONS.CreateSubmissionBatch, PERMISSIONS.UpdateSubmissionBatch, PERMISSIONS.DeleteSubmissionBatch, PERMISSIONS.StartSubmissionBatch, PERMISSIONS.CloseSubmissionBatch],
  'User & Role Administration': [PERMISSIONS.CreateUser, PERMISSIONS.ViewUsers, PERMISSIONS.UpdateUser, PERMISSIONS.DeactivateUser, PERMISSIONS.DeleteUser, PERMISSIONS.ChangeUserRole],
  'Permissions & Security': [PERMISSIONS.ViewPermissions, PERMISSIONS.ManagePermissions]
};
