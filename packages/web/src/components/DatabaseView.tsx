import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  pageApi,
  PageDTO,
  PropertyValueDTO,
  TitlePropertyDTO,
  NumberPropertyDTO,
  CheckboxPropertyDTO,
  SelectPropertyDTO,
  DatePropertyDTO
} from '../api/page.api';
import './DatabaseView.css';

interface PropertyDefinition {
  id: string;
  name: string;
  type: 'title' | 'rich_text' | 'number' | 'checkbox' | 'date' | 'select' | 'status' | 'url' | 'email' | 'multi_select';
}

// Helper pour extraire le texte d'une TitleProperty
function getTitleText(prop: PropertyValueDTO | undefined): string {
  if (!prop || prop.type !== 'title') return '';
  const titleProp = prop as TitlePropertyDTO;
  return titleProp.title.map(t => t.plain_text).join('');
}

// Helper pour extraire la valeur d'une propriété
function getPropertyDisplayValue(prop: PropertyValueDTO | undefined): string {
  if (!prop) return '';

  switch (prop.type) {
    case 'title':
      return getTitleText(prop);
    case 'rich_text':
      return (prop as any).rich_text?.map((t: any) => t.plain_text).join('') || '';
    case 'number':
      return (prop as NumberPropertyDTO).number?.toString() || '';
    case 'checkbox':
      return (prop as CheckboxPropertyDTO).checkbox ? '✓' : '';
    case 'select':
      return (prop as SelectPropertyDTO).select?.name || '';
    case 'status':
      return (prop as any).status?.name || '';
    case 'date':
      return (prop as DatePropertyDTO).date?.start || '';
    case 'url':
      return (prop as any).url || '';
    case 'email':
      return (prop as any).email || '';
    case 'multi_select':
      return (prop as any).multi_select?.map((s: any) => s.name).join(', ') || '';
    default:
      return '';
  }
}

export function DatabaseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [database, setDatabase] = useState<PageDTO | null>(null);
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [properties, setProperties] = useState<PropertyDefinition[]>([]);
  const [editingCell, setEditingCell] = useState<{ pageId: string; propertyName: string } | null>(null);
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

      if (dbData.object !== 'database') {
        console.error('This is not a database');
        navigate('/');
        return;
      }

      setDatabase(dbData);
      setName(dbData.title);
      setDescription(dbData.content);

      // Initialiser les propriétés de la database
      // Si la database a des propriétés, ce sont les valeurs des propriétés
      const columnDefinitions: PropertyDefinition[] = [];

      // Restaurer les colonnes depuis les propriétés de la première page ou de la database
      if (dbData.properties) {
        Object.entries(dbData.properties).forEach(([propName, propData]) => {
          columnDefinitions.push({
            id: propData.id,
            name: propName,
            type: propData.type
          });
        });
      }

      // Si pas de colonnes, ajouter au moins la colonne Title par défaut
      if (columnDefinitions.length === 0) {
        columnDefinitions.push({
          id: 'title',
          name: 'Title',
          type: 'title'
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
      const newPage = await pageApi.createPageInDatabase(id, 'Sans titre', '');
      setPages([...pages, newPage]);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const handleNameClick = (pageId: string) => {
    navigate(`/page/${pageId}`);
  };

  const handleAddProperty = async (propertyName: string, propertyType: PropertyDefinition['type']) => {
    if (!id || id === 'new') {
      console.error('Veuillez d\'abord enregistrer la base de données');
      return;
    }

    const newProperty: PropertyDefinition = {
      id: `prop_${Date.now()}`,
      name: propertyName,
      type: propertyType,
    };

    const updatedProperties = [...properties, newProperty];
    setProperties(updatedProperties);
    setShowAddProperty(false);

    try {
      // Sauvegarder le schéma dans la database en créant une propriété vide
      if (database) {
        const schemaProperties: Record<string, PropertyValueDTO> = {
          ...(database.properties || {})
        };

        // Créer une propriété vide du bon type pour définir le schéma
        let emptyValue: PropertyValueDTO;
        switch (propertyType) {
          case 'title':
            emptyValue = {
              id: newProperty.id,
              type: 'title',
              title: []
            };
            break;
          case 'rich_text':
            emptyValue = {
              id: newProperty.id,
              type: 'rich_text',
              rich_text: []
            } as any;
            break;
          case 'number':
            emptyValue = {
              id: newProperty.id,
              type: 'number',
              number: null
            };
            break;
          case 'checkbox':
            emptyValue = {
              id: newProperty.id,
              type: 'checkbox',
              checkbox: false
            };
            break;
          case 'select':
            emptyValue = {
              id: newProperty.id,
              type: 'select',
              select: null
            };
            break;
          case 'date':
            emptyValue = {
              id: newProperty.id,
              type: 'date',
              date: null
            };
            break;
          default:
            console.error('Unsupported property type:', propertyType);
            return;
        }

        schemaProperties[propertyName] = emptyValue;

        await pageApi.updatePage(id, database.title, database.content, schemaProperties);
        setDatabase({ ...database, properties: schemaProperties });

        console.log('✅ Property column added and saved:', propertyName, propertyType);
      }
    } catch (error) {
      console.error('❌ Failed to save property schema:', error);
    }
  };

  const handleUpdatePropertyValue = async (pageId: string, propertyName: string, value: string | number | boolean) => {
    try {
      console.log('🔵 handleUpdatePropertyValue called:', { pageId, propertyName, value });

      const page = pages.find(p => p.id === pageId);
      if (!page) {
        console.error('❌ Page not found:', pageId);
        return;
      }

      console.log('✅ Found page:', page.title, 'Properties:', page.properties);

      // Trouver la définition de la propriété
      const propDef = properties.find(p => p.name === propertyName);
      if (!propDef) {
        console.error('❌ Property definition not found:', propertyName);
        console.log('Available properties:', properties);
        return;
      }

      console.log('✅ Found property definition:', propDef);

      // Créer la nouvelle valeur de propriété au format Notion
      let newPropertyValue: PropertyValueDTO;

      console.log('🔧 Creating property value for type:', propDef.type);

      switch (propDef.type) {
        case 'title':
          newPropertyValue = {
            id: propDef.id,
            type: 'title',
            title: [{
              type: 'text',
              text: { content: String(value), link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default'
              },
              plain_text: String(value),
              href: null
            }]
          };
          break;

        case 'rich_text':
          newPropertyValue = {
            id: propDef.id,
            type: 'rich_text',
            rich_text: [{
              type: 'text',
              text: { content: String(value), link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default'
              },
              plain_text: String(value),
              href: null
            }]
          } as any;
          break;

        case 'number':
          newPropertyValue = {
            id: propDef.id,
            type: 'number',
            number: typeof value === 'number' ? value : parseFloat(String(value)) || null
          };
          break;

        case 'checkbox':
          newPropertyValue = {
            id: propDef.id,
            type: 'checkbox',
            checkbox: Boolean(value)
          };
          break;

        case 'select':
          newPropertyValue = {
            id: propDef.id,
            type: 'select',
            select: value ? { name: String(value), color: 'default' } : null
          };
          break;

        case 'date':
          newPropertyValue = {
            id: propDef.id,
            type: 'date',
            date: value ? { start: String(value), end: null, time_zone: null } : null
          };
          break;

        default:
          console.error('Unsupported property type:', propDef.type);
          return;
      }

      // Mettre à jour les propriétés de la page
      const updatedProperties: Record<string, PropertyValueDTO> = {
        ...(page.properties || {}),
        [propertyName]: newPropertyValue,
      };

      console.log('📤 Updating page with properties:', {
        pageId,
        pageTitle: page.title,
        propertyName,
        value,
        newPropertyValue,
        updatedProperties
      });

      await pageApi.updatePage(pageId, page.title, page.content, updatedProperties);

      console.log('✅ Update successful!');

      // Mettre à jour localement
      setPages(pages.map(p =>
        p.id === pageId ? { ...p, properties: updatedProperties } : p
      ));

      setEditingCell(null);
    } catch (error) {
      console.error('❌ Failed to update property:', error);
    }
  };

  const getPropertyValue = (page: PageDTO, propertyName: string): string | number | boolean => {
    const prop = page.properties?.[propertyName];
    if (!prop) return '';
    return getPropertyDisplayValue(prop);
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
                      const isEditing = editingCell?.pageId === page.id && editingCell?.propertyName === prop.name;
                      const value = getPropertyValue(page, prop.name);

                      return (
                        <td
                          key={`${page.id}-${prop.name}`}
                          className={prop.name === 'Title' ? 'name-cell clickable' : 'editable-cell'}
                          onClick={() => {
                            if (prop.name === 'Title') {
                              handleNameClick(page.id);
                            } else {
                              setEditingCell({ pageId: page.id, propertyName: prop.name });
                            }
                          }}
                        >
                          {prop.name === 'Title' ? (
                            <span className="page-name">{page.title || 'Sans titre'}</span>
                          ) : isEditing ? (
                            prop.type === 'checkbox' ? (
                              <input
                                type="checkbox"
                                checked={!!value}
                                onChange={(e) => handleUpdatePropertyValue(page.id, prop.name, e.target.checked)}
                                autoFocus
                              />
                            ) : (
                              <input
                                type={prop.type === 'number' ? 'number' : 'text'}
                                defaultValue={value as string}
                                onBlur={(e) => {
                                  const newValue = prop.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                                  handleUpdatePropertyValue(page.id, prop.name, newValue);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    const newValue = prop.type === 'number' ? parseFloat(target.value) : target.value;
                                    handleUpdatePropertyValue(page.id, prop.name, newValue);
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null);
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
                    const type = formData.get('type') as PropertyDefinition['type'];
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
                        <option value="rich_text">Texte</option>
                        <option value="number">Nombre</option>
                        <option value="checkbox">Case à cocher</option>
                        <option value="date">Date</option>
                        <option value="select">Select</option>
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
