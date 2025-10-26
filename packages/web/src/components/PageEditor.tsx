import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageApi, PageDTO, PropertyValueDTO } from '../api/page.api';
import './PageEditor.css';

export function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageDTO | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [properties, setProperties] = useState<Record<string, PropertyValueDTO>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyType, setNewPropertyType] = useState<'rich_text' | 'number' | 'checkbox' | 'url' | 'email' | 'select' | 'date' | 'status'>('rich_text');

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
      setProperties(data.properties || {});
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
        await pageApi.updatePage(id, title, content, properties);
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

  const handleAddProperty = async () => {
    if (!id || !newPropertyName.trim()) {
      alert('Veuillez entrer un nom de propriété');
      return;
    }

    // Vérifier que la propriété n'existe pas déjà
    if (properties[newPropertyName]) {
      alert('Une propriété avec ce nom existe déjà');
      return;
    }

    // Générer un ID unique pour la propriété
    const propertyId = `prop_${Date.now()}`;

    // Créer la valeur par défaut selon le type
    let defaultValue: PropertyValueDTO;

    switch (newPropertyType) {
      case 'rich_text':
        defaultValue = {
          id: propertyId,
          type: 'rich_text',
          rich_text: []
        };
        break;

      case 'number':
        defaultValue = {
          id: propertyId,
          type: 'number',
          number: null
        };
        break;

      case 'checkbox':
        defaultValue = {
          id: propertyId,
          type: 'checkbox',
          checkbox: false
        };
        break;

      case 'url':
        defaultValue = {
          id: propertyId,
          type: 'url',
          url: null
        };
        break;

      case 'email':
        defaultValue = {
          id: propertyId,
          type: 'email',
          email: null
        };
        break;

      case 'select':
        defaultValue = {
          id: propertyId,
          type: 'select',
          select: null
        };
        break;

      case 'date':
        defaultValue = {
          id: propertyId,
          type: 'date',
          date: null
        };
        break;

      case 'status':
        defaultValue = {
          id: propertyId,
          type: 'status',
          status: null
        };
        break;

      default:
        return;
    }

    const updatedProperties = { ...properties, [newPropertyName]: defaultValue };
    setProperties(updatedProperties);

    // Sauvegarder
    try {
      await pageApi.updatePage(id, title, content, updatedProperties);
      setShowAddProperty(false);
      setNewPropertyName('');
      setNewPropertyType('rich_text');
    } catch (error) {
      console.error('Failed to add property:', error);
      alert('Erreur lors de l\'ajout de la propriété');
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

  const propertyEntries = Object.entries(properties).filter(([name]) => name !== 'title');

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

      {/* Section des propriétés */}
      <div className="properties-section">
        <div className="properties-header">
          <h3 className="properties-title">Propriétés</h3>
          <button
            className="add-property-btn"
            onClick={() => setShowAddProperty(!showAddProperty)}
          >
            + Ajouter une propriété
          </button>
        </div>

        {showAddProperty && (
          <div className="add-property-form">
            <input
              type="text"
              placeholder="Nom de la propriété"
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
              className="property-name-input"
            />
            <select
              value={newPropertyType}
              onChange={(e) => setNewPropertyType(e.target.value as any)}
              className="property-type-select"
            >
              <option value="rich_text">Texte</option>
              <option value="number">Nombre</option>
              <option value="checkbox">Case à cocher</option>
              <option value="url">URL</option>
              <option value="email">Email</option>
              <option value="select">Sélection</option>
              <option value="date">Date</option>
              <option value="status">Statut</option>
            </select>
            <div className="add-property-actions">
              <button onClick={handleAddProperty} className="btn-primary">
                Créer
              </button>
              <button
                onClick={() => {
                  setShowAddProperty(false);
                  setNewPropertyName('');
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {propertyEntries.length > 0 && (
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
        )}
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
