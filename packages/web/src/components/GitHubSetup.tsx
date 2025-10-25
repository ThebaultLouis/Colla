import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupApi } from '../api/setup.api';
import './GitHubSetup.css';

export function GitHubSetup() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setupApi.setupGitHub(token, repoUrl);
      // Rediriger vers l'application principale
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="github-setup">
      <div className="setup-container">
        <div className="setup-header">
          <h1>🚀 Welcome to Colla</h1>
          <p>Connect your GitHub repository to start collaborating</p>
        </div>

        <form onSubmit={handleSetup} className="setup-form">
          <div className="form-group">
            <label htmlFor="token">GitHub Personal Access Token</label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              required
            />
            <small>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
              >
                Create a token
              </a> with 'repo' scope
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="repoUrl">Repository URL</label>
            <input
              id="repoUrl"
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              required
            />
            <small>
              The repository will be cloned locally. If it doesn't exist, it will be created.
            </small>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="setup-btn">
            {loading ? 'Connecting...' : 'Connect Repository'}
          </button>
        </form>

        <div className="setup-footer">
          <p>
            <strong>Why do we need this?</strong><br />
            Colla uses Git as a backend to enable real-time collaboration.
            Your pages will be stored as files in your repository.
          </p>
        </div>
      </div>
    </div>
  );
}
