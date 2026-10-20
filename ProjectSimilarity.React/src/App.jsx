import React, { useEffect, useState } from 'react';
import { useApp } from './AppContext';
import { getNormalizedRole } from './utils';
import { DEFAULT_INITIAL_USERS, PERMISSIONS } from './constants';
import { runSimilarityAPI } from './api';
import Header from './components/Header';
import AlertBox from './components/AlertBox';
import NavBar from './components/NavBar';
import LoginCard from './components/auth/LoginCard';
import RegisterCard from './components/auth/RegisterCard';
import StudentView from './components/student/StudentView';
import FacultyView from './components/faculty/FacultyView';
import AdminView from './components/admin/AdminView';
import SimilarityResultsCard from './components/shared/SimilarityResultsCard';

export default function App() {
  const {
    authToken,
    userRole,
    userEmail,
    systemUsers,
    loadProjects,
    loadAdminData,
    showAlert,
    logout,
    checkPermission
  } = useApp();

  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [prefillEmail, setPrefillEmail] = useState('');
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [currentAdminTab, setCurrentAdminTab] = useState('adminOverviewTab');
  const [similarityData, setSimilarityData] = useState(null);
  const [similarityLoading, setSimilarityLoading] = useState(false);
  const [similarityError, setSimilarityError] = useState(null);

  const normRole = getNormalizedRole(userRole);
  const isLoggedIn = !!authToken;

  // On login, verify user still exists in system
  useEffect(() => {
    if (authToken && userEmail) {
      const found =
        systemUsers.find((u) => u.email.toLowerCase() === userEmail.toLowerCase()) ||
        DEFAULT_INITIAL_USERS.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
      if (!found) {
        logout();
        showAlert(`Your account (${userEmail}) was deleted by Administrator.`, true);
      }
    }
  }, [authToken, userEmail, systemUsers, logout, showAlert]);

  // Load projects and dashboard data on login
  useEffect(() => {
    if (authToken) {
      loadProjects();
      if (getNormalizedRole(userRole) === 'Admin') {
        loadAdminData();
      }
    }
  }, [authToken, userRole, loadProjects, loadAdminData]);

  // Reset tabs on login
  useEffect(() => {
    if (authToken) {
      setCurrentTab('Dashboard');
      setCurrentAdminTab('adminOverviewTab');
    }
  }, [authToken]);

  const handleRunSimilarity = async (projectId) => {
    if (!checkPermission(PERMISSIONS.RunSimilarity)) {
      showAlert('Permission Denied: RunSimilarity permission is required.', true);
      return;
    }

    setSimilarityLoading(true);
    setSimilarityError(null);
    setSimilarityData(null);

    try {
      const data = await runSimilarityAPI(projectId, authToken);
      setSimilarityData(data);
    } catch (err) {
      setSimilarityError(err.message || 'Similarity analysis failed.');
    } finally {
      setSimilarityLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <div className="container">
          <AlertBox />
          <div className="auth-container" id="authSection">
            {authView === 'login' ? (
              <LoginCard
                initialEmail={prefillEmail}
                onSwitchToRegister={() => setAuthView('register')}
              />
            ) : (
              <RegisterCard
                onSwitchToLogin={(email) => {
                  if (email) setPrefillEmail(email);
                  setAuthView('login');
                }}
              />
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container">
        <AlertBox />
        <div id="appSection">
          <NavBar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            currentAdminTab={currentAdminTab}
            setCurrentAdminTab={setCurrentAdminTab}
          />
          {normRole === 'Student' && (
            <StudentView currentTab={currentTab} />
          )}
          {normRole === 'Faculty' && (
            <FacultyView
              currentTab={currentTab}
              onRunSimilarity={handleRunSimilarity}
            />
          )}
          {normRole === 'Admin' && (
            <AdminView
              currentAdminTab={currentAdminTab}
              onRunSimilarity={handleRunSimilarity}
            />
          )}
          {(similarityData !== null || similarityLoading || similarityError) && (
            <SimilarityResultsCard
              data={similarityData}
              loading={similarityLoading}
              error={similarityError}
              onClose={() => {
                setSimilarityData(null);
                setSimilarityLoading(false);
                setSimilarityError(null);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
