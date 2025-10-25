import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { pageApi, PageDTO } from '../api/page.api';
import { syncApi } from '../api/sync.api';
import './Sidebar.css';

export function Sidebar() {
  const [rootItems, setRootItems] = useState<PageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const items = await pageApi.listRootPages();
      setRootItems(items);
    } catch (error) {
      console.error('Failed to load sidebar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (id: string, object: 'page' | 'database') => {
    const basePath = object === 'database' ? '/database/' : '/page/';
    return location.pathname === `${basePath}${id}`;
  };

  const handleCreatePage = async () => {
    try {
      const newPage = await pageApi.createPage('Sans titre', '');
      await loadData();
      navigate(`/page/${newPage.id}`);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const handleCreateDatabase = async () => {
    try {
      const newDb = await pageApi.createDatabase('Nouvelle base de données', '');
      await loadData();
      navigate(`/database/${newDb.id}`);
    } catch (error) {
      console.error('Failed to create database:', error);
    }
    setShowNewMenu(false);
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncApi.sync();
      // Recharger les données après synchronisation
      await loadData();
    } catch (error) {
      console.error('Failed to sync:', error);
      alert('Erreur lors de la synchronisation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Colla</h2>
        <button
          className="sidebar-sync-btn"
          onClick={handleSync}
          disabled={isSyncing}
          title="Synchroniser avec GitHub"
        >
          {isSyncing ? '⏳' : '🔄'}
        </button>
      </div>

      <div className="sidebar-content">
        {/* Section unique pour Pages et Databases */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">Workspace</span>
            <div className="sidebar-add-menu">
              <button
                className="sidebar-add-btn"
                onClick={() => setShowNewMenu(!showNewMenu)}
                title="Nouveau"
              >
                +
              </button>
              {showNewMenu && (
                <div className="sidebar-dropdown">
                  <button onClick={handleCreatePage} className="dropdown-item">
                    📝 Page
                  </button>
                  <button onClick={handleCreateDatabase} className="dropdown-item">
                    🗃️ Base de données
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="sidebar-items">
            {isLoading ? (
              <div className="sidebar-loading">Chargement...</div>
            ) : rootItems.length === 0 ? (
              <div className="sidebar-empty">Aucun élément</div>
            ) : (
              rootItems.map((item) => {
                const path = item.object === 'database' ? `/database/${item.id}` : `/page/${item.id}`;
                const icon = item.icon?.emoji || item.icon?.external?.url || item.icon?.file?.url || (item.object === 'database' ? '🗃️' : '📝');

                return (
                  <Link
                    key={item.id}
                    to={path}
                    className={`sidebar-item ${isActive(item.id, item.object) ? 'active' : ''}`}
                  >
                    <span className="sidebar-item-icon">{icon}</span>
                    <span className="sidebar-item-title">
                      {item.title || 'Sans titre'}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
