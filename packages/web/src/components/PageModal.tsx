import { useState, useEffect } from 'react';
import { pageApi, PageDTO, PropertyValueDTO } from '../api/page.api';
import './PageModal.css';

interface PageModalProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function PageModal({ pageId, isOpen, onClose, onUpdate }: PageModalProps) {
  const [page, setPage] = useState<PageDTO | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [properties, setProperties] = useState<Record<string, PropertyValueDTO>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    if (onUpdate) onUpdate(); // Recharger la base de données à la fermeture
    onClose();
  };

  useEffect(() => {
    if (isOpen && pageId) {
      loadPage();
    }
  }, [isOpen, pageId]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const data = await pageApi.getPage(pageId);
      setPage(data);
      setTitle(data.title);
      setContent(data.content);
      setProperties(data.properties || {});
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await pageApi.updatePage(pageId, title, content, properties);
      // Ne pas appeler onUpdate ici pour éviter le clignotement
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProperty = async (propertyName: string, value: any) => {
    if (!page) return;

    const existingProperty = properties[propertyName];
    if (!existingProperty) return;

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

    try {
      await pageApi.updatePage(pageId, title, content, updatedProperties);
      // Ne pas appeler onUpdate ici pour éviter le clignotement
      // La base de données sera rechargée à la fermeture du modal
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

  if (!isOpen) return null;

  const propertyEntries = Object.entries(properties).filter(([name]) => name !== 'title');

  return (
    <>
      {/* Backdrop */}
      <div className="page-modal-backdrop" onClick={handleClose} />

      {/* Modal */}
      <div className="page-modal">
        <div className="page-modal-header">
          <div className="page-modal-header-content">
            <input
              type="text"
              className="page-modal-title"
              placeholder="Untitled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
            />
          </div>
          <button className="page-modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="page-modal-content">
          {loading ? (
            <div className="page-modal-loading">Loading...</div>
          ) : (
            <>
              {/* Propriétés */}
              {propertyEntries.length > 0 && (
                <div className="page-modal-properties">
                  {propertyEntries.map(([name, property]) => (
                    <div key={name} className="page-modal-property-row">
                      <label className="page-modal-property-label">{name}</label>
                      <div className="page-modal-property-value">
                        {renderPropertyValue(name, property)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contenu */}
              <div className="page-modal-editor">
                <textarea
                  className="page-modal-textarea"
                  placeholder="Start writing..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={handleSave}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="page-modal-footer">
          <button onClick={handleSave} disabled={saving} className="page-modal-save-btn">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}
