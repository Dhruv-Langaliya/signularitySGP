import React from 'react';

export default function SimilarityResultsCard({ data, loading, error, onClose }) {
  return (
    <div className="card" id="resultsCard" style={{ display: 'block', marginTop: '1.5rem' }}>
      <h2>
        <span>Similarity Analysis Results</span>
        <button onClick={onClose} className="outline">
          Close
        </button>
      </h2>
      <div id="resultsContent">
        {loading && (
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            Analyzing document vectors with TF-IDF Cosine Similarity engine...
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-error" style={{ display: 'block' }}>
            {error}
          </div>
        )}

        {!loading && !error && data && data.length === 0 && (
          <p className="empty-state">No other stored projects are available for comparison.</p>
        )}

        {!loading && !error && data && data.length > 0 && (
          <div className="similarity-results">
            <h3>Similarity analysis completed</h3>
            {data.map((result, idx) => {
              const percentage = Math.round(Number(result.score) * 1000) / 10;
              const riskClass = String(result.riskLevel || 'Low').toLowerCase();
              return (
                <div key={idx} className="similarity-result-row">
                  <div>
                    <strong>{result.projectTitle || 'Untitled project'}</strong>
                    <div className="progress-bar-container">
                      <div className="progress-bar">
                        <div
                          className={`progress-fill progress-${riskClass}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className={`badge badge-${riskClass}`}>
                    {percentage}% · {result.riskLevel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
