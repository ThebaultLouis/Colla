import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageApi, PageDTO, PropertyValueDTO } from '../api/page.api';
import { useRefresh } from '../contexts/RefreshContext';
import './PageEditor.css';

export function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { triggerRefresh } = useRefresh();
  const [page, setPage] = useState<PageDTO | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [properties, setProperties] = useState<Record<string, PropertyValueDTO>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState<PageDTO[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState('');
  const [newChildType, setNewChildType] = useState<'page' | 'database'>('page');

  const loadPage = useCallback(async (pageId: string) => {
    try {
      const data = await pageApi.getPage(pageId);
      setPage(data);
      setTitle(data.title);
      setContent(data.content);
      setProperties(data.properties || {});
    } catch (error) {
      console.error('Failed to load page:', error);
      alert('Failed to load page');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChildren = useCallback(async (pageId: string) => {
    try {
      const childPages = await pageApi.listPageChildren(pageId);
      setChildren(childPages);
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  }, []);

  useEffect(() => {
    if (id && id !== 'new') {
      loadPage(id);
      loadChildren(id);
    } else {
      setLoading(false);
    }
  }, [id, loadPage, loadChildren]);

  const handleAddChild = async () => {
    if (!id || !newChildTitle.trim()) return;

    try {
      await pageApi.createPage(newChildTitle, '', newChildType, id);
      setNewChildTitle('');
      setShowAddChild(false);
      await loadChildren(id); // Recharger les enfants
    } catch (error) {
      console.error('Failed to create child page:', error);
      alert('Failed to create child page');
    }
  };

  const handleSave = async () => {
    // Ne pas sauvegarder si c'est une nouvelle page sans titre
    if (!id && !title.trim()) return;

    console.log('💾 Saving page:', { id, title, content: content.substring(0, 50) });

    setSaving(true);
    try {
      if (id && id !== 'new') {
        // Mise à jour d'une page existante
        // Ne pas envoyer les properties ici car elles sont gérées séparément avec handleUpdateProperty
        await pageApi.updatePage(id, title, content);
        console.log('✅ Page saved successfully');
        // Déclencher le refresh de la sidebar
        triggerRefresh();
      } else {
        // Création d'une nouvelle page
        const newPage = await pageApi.createPage(title || 'Sans titre', content);
        navigate(`/page/${newPage.id}`, { replace: true });
        console.log('✅ New page created:', newPage.id);
        // Déclencher le refresh de la sidebar
        triggerRefresh();
      }
    } catch (error) {
      console.error('❌ Failed to save page:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProperty = async (propertyName: string, value: any) => {
    if (!page) return;

    // Trouver la propriété existante
    const existingProperty = properties[propertyName];
    if (!existingProperty) return;

    // Créer la nouvelle valeur de propriété au format Notion
    let newPropertyValue: PropertyValueDTO;

    switch (existingProperty.type) {
      case 'title':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'title',
          title: [{
            type: 'text',
            text: { content: value as string, link: null },
            annotations: {},
            plain_text: value as string,
            href: null
          }]
        };
        break;

      case 'rich_text':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'rich_text',
          rich_text: value ? [{
            type: 'text',
            text: { content: value as string, link: null },
            annotations: {},
            plain_text: value as string,
            href: null
          }] : []
        };
        break;

      case 'number':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'number',
          number: value === '' || value === null ? null : Number(value)
        };
        break;

      case 'checkbox':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'checkbox',
          checkbox: Boolean(value)
        };
        break;

      case 'url':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'url',
          url: value as string || null
        };
        break;

      case 'email':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'email',
          email: value as string || null
        };
        break;

      case 'select':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'select',
          select: value ? { name: value as string, color: 'default' } : null
        };
        break;

      case 'multi_select':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'multi_select',
          multi_select: (value as string[]).map(v => ({ name: v, color: 'default' }))
        };
        break;

      case 'date':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'date',
          date: value ? { start: value as string, end: null, time_zone: null } : null
        };
        break;

      case 'status':
        newPropertyValue = {
          id: existingProperty.id,
          type: 'status',
          status: value ? { id: '', name: value as string, color: 'default' } : null
        };
        break;

      default:
        return;
    }

    const updatedProperties = { ...properties, [propertyName]: newPropertyValue };
    setProperties(updatedProperties);

    // Sauvegarder immédiatement
    try {
      await pageApi.updatePage(id!, title, content, updatedProperties);
    } catch (error) {
      console.error('Failed to update property:', error);
    }
  };

  const renderPropertyValue = (propertyName: string, property: PropertyValueDTO) => {
    switch (property.type) {
      case 'title':
        return (
          <input
            type="text"
            value={property.title?.[0]?.plain_text || ''}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.value)}
            className="property-input"
          />
        );

      case 'rich_text':
        return (
          <input
            type="text"
            value={property.rich_text?.[0]?.plain_text || ''}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.value)}
            className="property-input"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={property.number ?? ''}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.value)}
            className="property-input"
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={property.checkbox || false}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.checked)}
            className="property-checkbox"
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={property.url || ''}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.value)}
            className="property-input"
            placeholder="https://..."
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={property.email || ''}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.value)}
            className="property-input"
            placeholder="email@example.com"
          />
        );

      case 'select':
        return (
          <input
            type="text"
            value={property.select?.name || ''}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.value)}
            className="property-input"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={property.date?.start || ''}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.value)}
            className="property-input"
          />
        );

      case 'status':
        return (
          <input
            type="text"
            value={property.status?.name || ''}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.value)}
            className="property-input"
          />
        );

      case 'multi_select':
        return (
          <input
            type="text"
            value={property.multi_select?.map(s => s.name).join(', ') || ''}
            onChange={(e) => handleUpdateProperty(propertyName, e.target.value.split(',').map(s => s.trim()))}
            className="property-input"
            placeholder="Séparer par des virgules"
          />
        );

      default:
        return <span>Type non supporté</span>;
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  // Ne garder que les propriétés non-title (title est géré par le champ principal)
  const propertyEntries = Object.entries(properties).filter(([name]) => name !== 'title');

  // Les propriétés ne sont éditables que pour les pages appartenant à une database
  // Le schema des propriétés est défini par la database parente
  const isPageInDatabase = page && page.parent && page.parent.type === 'database_id';

  // Les pages enfants ne sont disponibles que pour les pages normales (pas les databases, pas les pages de database)
  const canHaveChildren = page && page.object === 'page' && !isPageInDatabase;

  return (
    <div className="page-editor">
      <div className="editor-header">
        <input
          type="text"
          className="title-input"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
        />
        {saving && (
          <div className="actions">
            <span className="saving-indicator">Saving...</span>
          </div>
        )}
      </div>

      {/* Section des propriétés - Uniquement pour les pages appartenant à une database */}
      {isPageInDatabase && propertyEntries.length > 0 && (
        <div className="properties-section">
          <h3 className="properties-title">Propriétés</h3>
          <div className="properties-list">
            {propertyEntries.map(([name, property]) => (
              <div key={name} className="property-row">
                <label className="property-label">{name}</label>
                <div className="property-value">
                  {renderPropertyValue(name, property)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <textarea
        className="content-editor"
        placeholder="Start writing..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleSave}
      />

      {/* Section des pages enfants - Uniquement pour les pages normales (pas databases, pas pages de database) */}
      {canHaveChildren && id && id !== 'new' && (
        <div className="children-section">
          <div className="children-header">
            <h3>Pages enfants</h3>
            <button onClick={() => setShowAddChild(true)} className="add-child-btn">
              + Ajouter une page
            </button>
          </div>

          {showAddChild && (
            <div className="add-child-form">
              <input
                type="text"
                placeholder="Titre de la page"
                value={newChildTitle}
                onChange={(e) => setNewChildTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChild()}
              />
              <select value={newChildType} onChange={(e) => setNewChildType(e.target.value as 'page' | 'database')}>
                <option value="page">Page</option>
                <option value="database">Base de données</option>
              </select>
              <button onClick={handleAddChild}>Créer</button>
              <button onClick={() => { setShowAddChild(false); setNewChildTitle(''); }}>Annuler</button>
            </div>
          )}

          <div className="children-list">
            {children.length === 0 ? (
              <p className="no-children">Aucune page enfant</p>
            ) : (
              children.map((child) => (
                <div key={child.id} className="child-item" onClick={() => navigate(`/page/${child.id}`)}>
                  <span className="child-icon">{child.object === 'database' ? '🗂️' : '📄'}</span>
                  <span className="child-title">{child.title}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
