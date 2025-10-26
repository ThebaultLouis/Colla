import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { pageApi, PageDTO } from '../api/page.api';
import { syncApi } from '../api/sync.api';
import { useRefresh } from '../contexts/RefreshContext';
import './Sidebar.css';

// Composant pour afficher un élément de l'arborescence
interface TreeItemProps {
  item: PageDTO;
  level: number;
  isActive: (id: string, object: 'page' | 'database') => boolean;
  onDelete: () => void;
  refreshTrigger: number;
}

function TreeItem({ item, level, isActive, onDelete, refreshTrigger }: TreeItemProps) {
  const navigate = useNavigate();
  const { toggleExpanded, isExpanded: isExpandedInContext } = useRefresh();
  const [children, setChildren] = useState<PageDTO[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [hasLoadedChildren, setHasLoadedChildren] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const [addMenuPosition, setAddMenuPosition] = useState({ top: 0, left: 0 });
  const [optionsMenuPosition, setOptionsMenuPosition] = useState({ top: 0, left: 0 });

  const isExpanded = isExpandedInContext(item.id);

  // Charger les enfants au montage si l'item est déjà ouvert
  useEffect(() => {
    if (isExpanded && !hasLoadedChildren) {
      loadChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  // Recharger les enfants quand refreshTrigger change (si déjà chargés)
  useEffect(() => {
    if (hasLoadedChildren && isExpanded) {
      // Recharger sans fermer l'arborescence
      const reloadChildren = async () => {
        try {
          setIsLoadingChildren(true);
          const childPages = await pageApi.listPageChildren(item.id);
          setChildren(childPages);
        } catch (error) {
          console.error('Failed to reload children:', error);
        } finally {
          setIsLoadingChildren(false);
        }
      };
      reloadChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const loadChildren = async () => {
    try {
      setIsLoadingChildren(true);
      const childPages = await pageApi.listPageChildren(item.id);
      setChildren(childPages);
      setHasLoadedChildren(true);
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isExpanded && !hasLoadedChildren) {
      await loadChildren();
    }
    toggleExpanded(item.id);
  };

  const handleAddPage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newPage = await pageApi.createPage('Sans titre', '', 'page', item.id);
      // Recharger les enfants (force reload)
      setHasLoadedChildren(false);
      await loadChildren();
      if (!isExpanded) toggleExpanded(item.id);
      navigate(`/page/${newPage.id}`);
      setShowAddMenu(false);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const handleAddDatabase = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newDb = await pageApi.createPage('Nouvelle base de données', '', 'database', item.id);
      // Recharger les enfants (force reload)
      setHasLoadedChildren(false);
      await loadChildren();
      if (!isExpanded) toggleExpanded(item.id);
      navigate(`/database/${newDb.id}`);
      setShowAddMenu(false);
    } catch (error) {
      console.error('Failed to create database:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${item.title || 'Sans titre'}" ?`)) return;
    
    try {
      await pageApi.deletePage(item.id);
      setShowOptionsMenu(false);
      onDelete(); // Notifier le parent pour recharger
    } catch (error) {
      console.error('Failed to delete page:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const path = item.object === 'database' ? `/database/${item.id}` : `/page/${item.id}`;
  const icon = item.icon?.emoji || item.icon?.external?.url || item.icon?.file?.url || (item.object === 'database' ? '📊' : '📄');
  
  // L'arborescence n'est disponible que pour les pages, pas pour les databases
  const canHaveChildren = item.object === 'page';
  
  // Afficher le toggle uniquement si :
  // 1. C'est une page (canHaveChildren)
  // 2. ET (on a des enfants chargés OU le backend indique qu'il y a des enfants)
  const showToggle = canHaveChildren && (children.length > 0 || (item.hasChildren && !hasLoadedChildren));

  return (
    <div className="tree-item">
      <div className="tree-item-wrapper">
        <Link
          to={path}
          className={`sidebar-item ${isActive(item.id, item.object) ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {showToggle && (
            <button 
              className={`tree-toggle ${isExpanded ? 'expanded' : ''}`}
              onClick={handleToggle}
            >
              {isLoadingChildren ? '⏳' : isExpanded ? '▼' : '▶'}
            </button>
          )}
          <span className="sidebar-item-icon">{icon}</span>
          <span className="sidebar-item-title">
            {item.title || 'Sans titre'}
          </span>
        </Link>

        {/* Boutons d'action */}
        <div className="tree-item-actions">
          {canHaveChildren && (
            <div className="tree-action-menu">
              <button 
                ref={addButtonRef}
                className="tree-action-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (!showAddMenu && addButtonRef.current) {
                    const rect = addButtonRef.current.getBoundingClientRect();
                    setAddMenuPosition({
                      top: rect.bottom + 2,
                      left: rect.left
                    });
                  }
                  
                  setShowAddMenu(!showAddMenu);
                  setShowOptionsMenu(false);
                }}
                title="Ajouter une page enfant"
              >
                +
              </button>
            </div>
          )}
          
          <div className="tree-action-menu">
            <button 
              ref={optionsButtonRef}
              className="tree-action-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!showOptionsMenu && optionsButtonRef.current) {
                  const rect = optionsButtonRef.current.getBoundingClientRect();
                  setOptionsMenuPosition({
                    top: rect.bottom + 2,
                    left: rect.left
                  });
                }
                
                setShowOptionsMenu(!showOptionsMenu);
                setShowAddMenu(false);
              }}
              title="Options"
            >
              ⋮
            </button>
          </div>
        </div>
      </div>
      
      {/* Dropdowns en position fixed */}
      {showAddMenu && (
        <div 
          className="tree-dropdown tree-dropdown-fixed"
          style={{
            position: 'fixed',
            top: `${addMenuPosition.top}px`,
            left: `${addMenuPosition.left}px`
          }}
        >
          <button onClick={handleAddPage} className="tree-dropdown-item">
            📄 Page
          </button>
          <button onClick={handleAddDatabase} className="tree-dropdown-item">
            📊 Base de données
          </button>
        </div>
      )}
      
      {showOptionsMenu && (
        <div 
          className="tree-dropdown tree-dropdown-fixed"
          style={{
            position: 'fixed',
            top: `${optionsMenuPosition.top}px`,
            left: `${optionsMenuPosition.left}px`
          }}
        >
          <button onClick={handleDelete} className="tree-dropdown-item tree-dropdown-item-danger">
            🗑️ Supprimer
          </button>
        </div>
      )}
      
      {isExpanded && children.length > 0 && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              isActive={isActive}
              onDelete={loadChildren}
              refreshTrigger={refreshTrigger}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [rootItems, setRootItems] = useState<PageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshTrigger } = useRefresh();

  useEffect(() => {
    loadData();
  }, [refreshTrigger]); // Recharger quand refreshTrigger change

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
                    📄 Page
                  </button>
                  <button onClick={handleCreateDatabase} className="dropdown-item">
                    📊 Base de données
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
              rootItems.map((item) => (
                <TreeItem
                  key={item.id}
                  item={item}
                  level={0}
                  isActive={isActive}
                  onDelete={loadData}
                  refreshTrigger={refreshTrigger}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
