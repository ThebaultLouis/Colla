import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pageApi } from '../api/page.api';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAndRedirect();
  }, []);

  const checkAndRedirect = async () => {
    try {
      const pages = await pageApi.listRootPages();

      if (pages.length > 0) {
        // Rediriger vers la première page/database
        const firstItem = pages[0];
        const path = firstItem.object === 'database'
          ? `/database/${firstItem.id}`
          : `/page/${firstItem.id}`;
        navigate(path, { replace: true });
      } else {
        // Aucune page, afficher l'écran d'accueil
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-empty">
      <div className="empty-content">
        <div className="empty-icon">📝</div>
        <h1>Bienvenue dans Colla</h1>
        <p>Créez votre première page ou base de données pour commencer</p>

        <div className="empty-actions">
          <Link to="/page/new" className="create-btn primary">
            📄 Créer une page
          </Link>
          <Link to="/database/new" className="create-btn secondary">
            📊 Créer une database
          </Link>
        </div>
      </div>
    </div>
  );
}
