import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageApi, PageDTO, PropertyDTO } from '../api/page.api';
import './DatabaseView.css';

interface PropertyDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'date' | 'select';
}

export function DatabaseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // @ts-expect-error - database will be used in future features
  const [database, setDatabase] = useState<PageDTO | null>(null);
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [properties, setProperties] = useState<PropertyDefinition[]>([]);
  const [editingCell, setEditingCell] = useState<{ pageId: string; propertyId: string } | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);

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

      // Initialiser les propriétés de la database
      // Si la database a des propriétés, ce sont les définitions de colonnes
      const columnDefinitions: PropertyDefinition[] = [
        { id: 'name', name: 'Nom', type: 'text' }
      ];

      // Restaurer les colonnes personnalisées depuis les propriétés de la database
      if (dbData.properties) {
        Object.entries(dbData.properties).forEach(([propId, propData]) => {
          columnDefinitions.push({
            id: propId,
            name: propData.name,
            type: propData.type as 'text' | 'number' | 'checkbox' | 'date' | 'select'
          });
        });
      }

      setProperties(columnDefinitions);

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
      console.error('Veuillez d\'abord enregistrer la base de données');
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

  const handleNameClick = (pageId: string) => {
    navigate(`/page/${pageId}`);
  };

  const handleAddProperty = async (propertyName: string, propertyType: 'text' | 'number' | 'checkbox' | 'date' | 'select') => {
    const newProperty: PropertyDefinition = {
      id: `prop_${Date.now()}`,
      name: propertyName,
      type: propertyType,
    };
    
    const updatedProperties = [...properties, newProperty];
    setProperties(updatedProperties);
    setShowAddProperty(false);

    // Sauvegarder la définition de la colonne dans la database
    if (id && id !== 'new') {
      try {
        // Construire les propriétés de la database (définitions de colonnes)
        const dbProperties: Record<string, PropertyDTO> = {};
        
        // Ajouter toutes les colonnes sauf 'name' qui est la colonne par défaut
        updatedProperties.forEach(prop => {
          if (prop.id !== 'name') {
            dbProperties[prop.id] = {
              name: prop.name,
              type: prop.type,
              value: '' // Les colonnes n'ont pas de valeur, juste une définition
            };
          }
        });

        await pageApi.updatePage(id, name, description, dbProperties);
        console.log('✅ Column definition saved to database');
      } catch (error) {
        console.error('Failed to save column definition:', error);
      }
    }
  };

  const handleUpdatePropertyValue = async (pageId: string, propertyId: string, value: string | number | boolean) => {
    try {
      const page = pages.find(p => p.id === pageId);
      if (!page) {
        console.error('Page not found:', pageId);
        return;
      }

      // Trouver le type de la propriété
      const propDef = properties.find(p => p.id === propertyId);
      if (!propDef) {
        console.error('Property definition not found:', propertyId);
        return;
      }

      // Mettre à jour les propriétés de la page
      const updatedProperties: Record<string, PropertyDTO> = {
        ...(page.properties || {}),
        [propertyId]: {
          name: propDef.name,
          type: propDef.type,
          value: value,
        },
      };

      console.log('Updating page properties:', {
        pageId,
        propertyId,
        value,
        updatedProperties
      });

      await pageApi.updatePage(pageId, page.title, page.content, updatedProperties);

      // Mettre à jour localement
      setPages(pages.map(p =>
        p.id === pageId ? { ...p, properties: updatedProperties } : p
      ));

      setEditingCell(null);
    } catch (error) {
      console.error('Failed to update property:', error);
    }
  };

  const getPropertyValue = (page: PageDTO, propertyId: string): string | number | boolean => {
    const prop = page.properties?.[propertyId];
    if (!prop) return '';
    return prop.value || '';
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
                  {properties.map((prop) => (
                    <th key={prop.id}>📄 {prop.name}</th>
                  ))}
                  <th className="add-property-header">
                    <button
                      className="add-property-btn"
                      onClick={() => setShowAddProperty(true)}
                      title="Ajouter une propriété"
                    >
                      +
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="database-row">
                    {properties.map((prop) => {
                      const isEditing = editingCell?.pageId === page.id && editingCell?.propertyId === prop.id;
                      const value = getPropertyValue(page, prop.id);

                      return (
                        <td
                          key={`${page.id}-${prop.id}`}
                          className={prop.id === 'name' ? 'name-cell clickable' : 'editable-cell'}
                          onClick={() => {
                            if (prop.id === 'name') {
                              handleNameClick(page.id);
                            } else {
                              setEditingCell({ pageId: page.id, propertyId: prop.id });
                            }
                          }}
                        >
                          {prop.id === 'name' ? (
                            <span className="page-name">{page.title || 'Sans titre'}</span>
                          ) : isEditing ? (
                            prop.type === 'checkbox' ? (
                              <input
                                type="checkbox"
                                checked={!!value}
                                onChange={(e) => handleUpdatePropertyValue(page.id, prop.id, e.target.checked)}
                                autoFocus
                              />
                            ) : (
                              <input
                                type={prop.type === 'number' ? 'number' : 'text'}
                                defaultValue={value as string}
                                onBlur={(e) => {
                                  const newValue = prop.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                                  handleUpdatePropertyValue(page.id, prop.id, newValue);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    const newValue = prop.type === 'number' ? parseFloat(target.value) : target.value;
                                    handleUpdatePropertyValue(page.id, prop.id, newValue);
                                  }
                                }}
                                autoFocus
                              />
                            )
                          ) : (
                            <span>{value || '-'}</span>
                          )}
                        </td>
                      );
                    })}
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showAddProperty && (
              <div className="add-property-modal">
                <div className="modal-content">
                  <h3>Ajouter une propriété</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get('name') as string;
                    const type = formData.get('type') as 'text' | 'number' | 'checkbox' | 'date' | 'select';
                    if (name) {
                      handleAddProperty(name, type);
                    }
                  }}>
                    <div className="form-group">
                      <label>Nom de la propriété</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Nom..."
                        required
                        autoFocus
                      />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select name="type">
                        <option value="text">Texte</option>
                        <option value="number">Nombre</option>
                        <option value="checkbox">Case à cocher</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="button" onClick={() => setShowAddProperty(false)}>Annuler</button>
                      <button type="submit" className="primary">Ajouter</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
