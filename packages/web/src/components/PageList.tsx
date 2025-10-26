import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pageApi, PageDTO } from '../api/page.api';
import './PageList.css';

export function PageList() {
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDatabase, setCreatingDatabase] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const data = await pageApi.listRootPages();
      setPages(data);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDatabase = async () => {
    setCreatingDatabase(true);
    try {
      const newDb = await pageApi.createDatabase('New Database', 'Database description');
      setPages([...pages, newDb]);
    } catch (error) {
      console.error('Failed to create database:', error);
    } finally {
      setCreatingDatabase(false);
    }
  };

  if (loading) return <div className="loading">Loading pages...</div>;

  // Séparer les pages et les databases
  const databases = pages.filter(p => p.object === 'database');
  const regularPages = pages.filter(p => p.object === 'page');

  return (
    <div className="page-list">
      <div className="list-header">
        <div className="header-actions">
          <button
            onClick={handleCreateDatabase}
            className="new-database-btn"
            disabled={creatingDatabase}
          >
            {creatingDatabase ? 'Creating...' : '📊 New Database'}
          </button>
          <Link to="/page/new" className="new-page-btn">
            📄 New Page
          </Link>
        </div>
      </div>

      {/* Databases Section */}
      {databases.length > 0 && (
        <div className="section">
          <h2>📊 Databases</h2>
          <div className="pages-grid">
            {databases.map((db) => {
              const icon = db.icon?.emoji || db.icon?.external?.url || db.icon?.file?.url || '📊';
              return (
                <Link key={db.id} to={`/database/${db.id}`} className="page-card database-card">
                  <div className="card-icon">{icon}</div>
                  <h3>{db.title || 'Untitled Database'}</h3>
                  <p className="page-preview">{db.content || 'No description'}</p>
                  <span className="page-date">
                    Updated: {new Date(db.last_edited_time).toLocaleDateString()}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Pages Section */}
      <div className="section">
        <h2>📄 Pages</h2>
        <div className="pages-grid">
          {regularPages.length === 0 ? (
            <div className="empty-state">
              <p>No pages yet. Create your first page!</p>
              <Link to="/page/new" className="new-page-btn">
                📄 New Page
              </Link>
            </div>
          ) : (
            regularPages.map((page) => {
              const icon = page.icon?.emoji || page.icon?.external?.url || page.icon?.file?.url || '📄';
              return (
                <Link key={page.id} to={`/page/${page.id}`} className="page-card">
                  <div className="card-icon">{icon}</div>
                  <h3>{page.title || 'Untitled'}</h3>
                  <p className="page-preview">{page.content.substring(0, 100)}{page.content.length > 100 ? '...' : ''}</p>
                  <span className="page-date">
                    Updated: {new Date(page.last_edited_time).toLocaleDateString()}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
