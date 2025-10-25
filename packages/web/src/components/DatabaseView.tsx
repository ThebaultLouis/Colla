import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageApi, PageDTO } from '../api/page.api';
import './DatabaseView.css';

export function DatabaseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [database, setDatabase] = useState<PageDTO | null>(null);
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      loadDatabase(id);
    } else {
      setLoading(false);
      setName('Nouvelle base de données');
      setDescription('');
    }
  }, [id]);

  const loadDatabase = async (dbId: string) => {
    try {
      setLoading(true);
      // Charger la database elle-même
      const dbData = await pageApi.getPage(dbId);

      if (!dbData.isDatabase) {
        console.error('This is not a database');
        navigate('/');
        return;
      }

      setDatabase(dbData);
      setName(dbData.title);
      setDescription(dbData.content);

      // Charger les pages de cette database
      const pagesData = await pageApi.listDatabasePages(dbId);
      setPages(pagesData);
    } catch (error) {
      console.error('Failed to load database:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (id === 'new') {
        const newDb = await pageApi.createDatabase(name, description);
        navigate(`/database/${newDb.id}`);
      } else {
        await pageApi.updatePage(id!, name, description);
        setDatabase(prev => prev ? { ...prev, title: name, content: description } : null);
      }
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  };

  const handleAddPage = async () => {
    if (!id || id === 'new') {
      alert('Veuillez d\'abord enregistrer la base de données');
      return;
    }

    try {
      // Créer une nouvelle page avec cette database comme parent
      const newPage = await pageApi.createPage('Sans titre', '', false, id);
      navigate(`/page/${newPage.id}`);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="database-view">
      <div className="database-header">
        <input
          type="text"
          className="database-name-input"
          placeholder="Nom de la base de données"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="database-actions">
          <button onClick={handleSave} className="save-btn">
            💾 Enregistrer
          </button>
        </div>
      </div>

      <div className="database-description">
        <input
          type="text"
          className="description-input"
          placeholder="Ajouter une description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="database-content">
        <div className="database-toolbar">
          <button onClick={handleAddPage} className="add-page-btn">
            ➕ Ajouter une page
          </button>
        </div>

        {pages.length === 0 ? (
          <div className="database-empty">
            <p>Cette base de données ne contient aucune page.</p>
            <button onClick={handleAddPage} className="empty-add-btn">
              Créer la première page
            </button>
          </div>
        ) : (
          <div className="database-table">
            <table>
              <thead>
                <tr>
                  <th>📄 Titre</th>
                  <th>📅 Créé le</th>
                  <th>✏️ Modifié le</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr
                    key={page.id}
                    onClick={() => navigate(`/page/${page.id}`)}
                    className="database-row"
                  >
                    <td className="title-cell">{page.title || 'Sans titre'}</td>
                    <td className="date-cell">
                      {new Date(page.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="date-cell">
                      {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
