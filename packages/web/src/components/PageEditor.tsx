import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageApi, PageDTO } from '../api/page.api';
import './PageEditor.css';

export function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageDTO | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadPage(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadPage = async (pageId: string) => {
    try {
      const data = await pageApi.getPage(pageId);
      setPage(data);
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error('Failed to load page:', error);
      alert('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await pageApi.updatePage(id, title, content);
      } else {
        const newPage = await pageApi.createPage(title, content);
        navigate(`/page/${newPage.id}`);
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this page?')) return;

    try {
      await pageApi.deletePage(id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete page:', error);
      alert('Failed to delete page');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-editor">
      <div className="editor-header">
        <input
          type="text"
          className="title-input"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          {id && (
            <button onClick={handleDelete} className="delete-btn">
              Delete
            </button>
          )}
        </div>
      </div>
      <textarea
        className="content-editor"
        placeholder="Start writing..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}
