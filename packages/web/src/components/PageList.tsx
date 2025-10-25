import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pageApi, PageDTO } from '../api/page.api';
import './PageList.css';

export function PageList() {
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const data = await pageApi.listPages();
      setPages(data);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading pages...</div>;

  return (
    <div className="page-list">
      <div className="list-header">
        <h1>My Pages</h1>
        <Link to="/page/new" className="new-page-btn">
          + New Page
        </Link>
      </div>
      <div className="pages-grid">
        {pages.length === 0 ? (
          <div className="empty-state">
            <p>No pages yet. Create your first page!</p>
            <Link to="/page/new" className="new-page-btn">
              + New Page
            </Link>
          </div>
        ) : (
          pages.map((page) => (
            <Link key={page.id} to={`/page/${page.id}`} className="page-card">
              <h3>{page.title || 'Untitled'}</h3>
              <p className="page-preview">{page.content.substring(0, 100)}...</p>
              <span className="page-date">
                Updated: {new Date(page.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
