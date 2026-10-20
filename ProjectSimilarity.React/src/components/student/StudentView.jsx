import React from 'react';
import SubmissionBanner from './SubmissionBanner';
import UploadForm from './UploadForm';
import MySubmissionStatus from './MySubmissionStatus';

export default function StudentView({ currentTab }) {
  const showUpload = currentTab === 'Dashboard' || currentTab === 'Upload';
  const showMySubmission = currentTab === 'Dashboard' || currentTab === 'MyProject';

  return (
    <div id="studentView">
      <SubmissionBanner />
      <div className="grid">
        {showUpload && <UploadForm />}
        {showMySubmission && <MySubmissionStatus />}
      </div>
    </div>
  );
}
