import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  pageApi,
  PageDTO,
  PropertyValueDTO
} from '../api/page.api';
import { PageModal } from './PageModal';
import { ResizeHandle } from './ResizeHandle';
import { PropertyCell } from './cells/PropertyCell';
import './DatabaseView.css';

interface PropertyDefinition {
  id: string;
  name: string;
  type: 'title' | 'rich_text' | 'number' | 'checkbox' | 'date' | 'select' | 'status' | 'url' | 'email' | 'multi_select';
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
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyType, setNewPropertyType] = useState<string>('rich_text');
  const [addPropertyPosition, setAddPropertyPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [filterText, setFilterText] = useState('');

  // Advanced filter and sort dropdowns
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Column editing state
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [editingColumnType, setEditingColumnType] = useState<string>('');
  const [dialogPosition, setDialogPosition] = useState<{ top: number; left: number } | null>(null);

  const getColumnWidth = (propertyId: string, propertyName: string): number => {
    if (columnWidths[propertyId]) {
      return columnWidths[propertyId];
    }
    return propertyName === 'Title' ? 280 : 150;
  };

  const handleColumnResize = (propertyId: string, width: number) => {
    const newWidths = { ...columnWidths, [propertyId]: width };
    setColumnWidths(newWidths);

    // Persist to localStorage
    if (id) {
      localStorage.setItem(`database-columns-${id}`, JSON.stringify(newWidths));
    }
  };

  // Load column widths from localStorage on mount
  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(`database-columns-${id}`);
      if (saved) {
        try {
          setColumnWidths(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to parse saved column widths:', error);
        }
      }
    }
  }, [id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to add a new page
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAddPage();
      }

      // Escape to clear filter
      if (e.key === 'Escape' && filterText) {
        setFilterText('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filterText]);

  const getPropertyIcon = (type: string): string => {
    switch (type) {
      case 'title':
        return '📄';
      case 'rich_text':
        return '📝';
      case 'number':
        return '🔢';
      case 'checkbox':
        return '✅';
      case 'date':
        return '📅';
      case 'select':
        return '🏷️';
      case 'multi_select':
        return '🏷️';
      case 'status':
        return '🔵';
      case 'url':
        return '🔗';
      case 'email':
        return '✉️';
      default:
        return '📄';
    }
  };

  const convertPropertyValue = (value: PropertyValueDTO, fromType: string, toType: string): PropertyValueDTO => {
    if (fromType === toType) return value;

    // Extract the raw value
    let rawValue: any = null;

    switch (fromType) {
      case 'title':
        rawValue = (value as any).title?.[0]?.plain_text || '';
        break;
      case 'rich_text':
        rawValue = (value as any).rich_text?.[0]?.plain_text || '';
        break;
      case 'number':
        rawValue = (value as any).number;
        break;
      case 'checkbox':
        rawValue = (value as any).checkbox;
        break;
      case 'date':
        rawValue = (value as any).date?.start;
        break;
      case 'select':
        rawValue = (value as any).select?.name;
        break;
      case 'multi_select':
        rawValue = (value as any).multi_select?.map((opt: any) => opt.name).join(', ');
        break;
      case 'status':
        rawValue = (value as any).status?.name;
        break;
      case 'url':
        rawValue = (value as any).url;
        break;
      case 'email':
        rawValue = (value as any).email;
        break;
    }

    // Convert to new type
    const newValue: any = { id: value.id, type: toType };

    switch (toType) {
      case 'rich_text':
        newValue.rich_text = rawValue ? [{ type: 'text', text: { content: String(rawValue) }, plain_text: String(rawValue) }] : [];
        break;
      case 'number':
        const num = parseFloat(String(rawValue));
        newValue.number = isNaN(num) ? null : num;
        break;
      case 'checkbox':
        newValue.checkbox = Boolean(rawValue);
        break;
      case 'date':
        newValue.date = rawValue ? { start: String(rawValue), end: null, time_zone: null } : null;
        break;
      case 'select':
        newValue.select = rawValue ? { id: 'temp', name: String(rawValue), color: 'default' } : null;
        break;
      case 'multi_select':
        newValue.multi_select = rawValue ? [{ id: 'temp', name: String(rawValue), color: 'default' }] : [];
        break;
      case 'status':
        newValue.status = rawValue ? { id: 'temp', name: String(rawValue), color: 'default' } : null;
        break;
      case 'url':
        newValue.url = rawValue ? String(rawValue) : null;
        break;
      case 'email':
        newValue.email = rawValue ? String(rawValue) : null;
        break;
    }

    return newValue;
  };

  const handleUpdateColumn = async (
    propertyId: string,
    oldName: string,
    newName: string,
    oldType: string,
    newType: string
  ) => {
    if (!newName.trim()) {
      return;
    }

    const nameChanged = newName !== oldName;
    const typeChanged = newType !== oldType;

    if (!nameChanged && !typeChanged) {
      return;
    }

    try {
      if (!database) return;

      // Update property in schema
      const updatedProperties = { ...database.properties };

      // Get the property value and update it
      Object.keys(updatedProperties).forEach(key => {
        if (key === oldName) {
          let propertyValue = updatedProperties[key];

          // Update type if needed
          if (typeChanged) {
            propertyValue = { ...propertyValue, type: newType } as any;
          }

          // Update name if needed
          if (nameChanged) {
            delete updatedProperties[key];
            updatedProperties[newName] = propertyValue;
          } else {
            updatedProperties[key] = propertyValue;
          }
        }
      });

      // Update all pages
      const updatedPages = pages.map(page => {
        if (!page.properties) return page;

        const updatedPageProps = { ...page.properties };
        const oldPropertyValue = updatedPageProps[oldName];

        if (oldPropertyValue) {
          // Convert the value if type changed
          let newPropertyValue = oldPropertyValue;
          if (typeChanged) {
            newPropertyValue = convertPropertyValue(oldPropertyValue, oldType, newType);
          }

          // Rename if needed
          if (nameChanged) {
            delete updatedPageProps[oldName];
            updatedPageProps[newName] = newPropertyValue;
          } else {
            updatedPageProps[oldName] = newPropertyValue;
          }
        }

        return { ...page, properties: updatedPageProps };
      });

      // Save database schema
      await pageApi.updatePage(id!, database.title, database.content, updatedProperties);

      // Update each page
      for (const page of updatedPages) {
        await pageApi.updatePage(page.id, page.title, page.content, page.properties || {});
      }

      // Update local state
      setDatabase({ ...database, properties: updatedProperties });
      setPages(updatedPages);
      setProperties(properties.map(p =>
        p.id === propertyId
          ? { ...p, name: newName, type: newType as any }
          : p
      ));

      console.log('✅ Column updated:', { oldName, newName, oldType, newType });
    } catch (error) {
      console.error('❌ Failed to update column:', error);
    }
  };

  const handleSort = (propertyName: string) => {
    if (sortColumn === propertyName) {
      // Toggle direction or clear
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        // Clear sort
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      // New column
      setSortColumn(propertyName);
      setSortDirection('asc');
    }
  };

  const getSortedPages = (): PageDTO[] => {
    if (!sortColumn) return pages;

    const sorted = [...pages].sort((a, b) => {
      const propA = a.properties?.[sortColumn];
      const propB = b.properties?.[sortColumn];

      // Handle null/undefined values
      if (!propA && !propB) return 0;
      if (!propA) return 1;
      if (!propB) return -1;

      // Compare based on type
      let valueA: any;
      let valueB: any;

      switch (propA.type) {
        case 'title':
          valueA = (propA as any).title?.[0]?.plain_text || '';
          valueB = (propB as any).title?.[0]?.plain_text || '';
          break;
        case 'rich_text':
          valueA = (propA as any).rich_text?.[0]?.plain_text || '';
          valueB = (propB as any).rich_text?.[0]?.plain_text || '';
          break;
        case 'number':
          valueA = (propA as any).number ?? -Infinity;
          valueB = (propB as any).number ?? -Infinity;
          break;
        case 'checkbox':
          valueA = (propA as any).checkbox ? 1 : 0;
          valueB = (propB as any).checkbox ? 1 : 0;
          break;
        case 'date':
          valueA = (propA as any).date?.start || '';
          valueB = (propB as any).date?.start || '';
          break;
        case 'select':
        case 'status':
          valueA = (propA as any).select?.name || (propA as any).status?.name || '';
          valueB = (propB as any).select?.name || (propB as any).status?.name || '';
          break;
        case 'url':
          valueA = (propA as any).url || '';
          valueB = (propB as any).url || '';
          break;
        case 'email':
          valueA = (propA as any).email || '';
          valueB = (propB as any).email || '';
          break;
        default:
          valueA = '';
          valueB = '';
      }

      // Compare values
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const getFilteredPages = (pagesToFilter: PageDTO[]): PageDTO[] => {
    if (!filterText.trim()) return pagesToFilter;

    const lowerFilter = filterText.toLowerCase();

    return pagesToFilter.filter((page) => {
      // Search in all text-based properties
      return Object.entries(page.properties || {}).some(([_, value]) => {
        if (!value) return false;

        switch (value.type) {
          case 'title':
            return (value as any).title?.[0]?.plain_text?.toLowerCase().includes(lowerFilter);
          case 'rich_text':
            return (value as any).rich_text?.[0]?.plain_text?.toLowerCase().includes(lowerFilter);
          case 'url':
            return (value as any).url?.toLowerCase().includes(lowerFilter);
          case 'email':
            return (value as any).email?.toLowerCase().includes(lowerFilter);
          case 'select':
          case 'status':
            return (value as any).select?.name?.toLowerCase().includes(lowerFilter) ||
              (value as any).status?.name?.toLowerCase().includes(lowerFilter);
          default:
            return false;
        }
      });
    });
  };

  const getDisplayPages = (): PageDTO[] => {
    const sorted = getSortedPages();
    return getFilteredPages(sorted);
  };

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
    setSelectedPageId(pageId);
    setIsPageModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPageId(null);
    setIsPageModalOpen(false);
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
    setNewPropertyName('');
    setNewPropertyType('rich_text');

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
    } catch (error) {
      console.error('❌ Failed to update property:', error);
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
          <div className="database-filter">
            <input
              type="text"
              className="filter-input"
              placeholder="🔍 Filtrer..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            {filterText && (
              <button
                className="clear-filter-btn"
                onClick={() => setFilterText('')}
                title="Effacer le filtre"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Advanced toolbar for filters and sorts */}
        <div className="database-advanced-toolbar">
          <div className="toolbar-dropdown-wrapper">
            <button
              className="toolbar-action-btn"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <span>🔽</span>
              <span>Filtrer</span>
            </button>
            {showFilterDropdown && (
              <div className="toolbar-dropdown">
                <div className="dropdown-header">Ajouter un filtre</div>
                <div className="dropdown-content">
                  {properties.map((prop) => (
                    <div
                      key={prop.id}
                      className="dropdown-item"
                      onClick={() => {
                        console.log('Filter by', prop.name);
                        setShowFilterDropdown(false);
                      }}
                    >
                      <span>{getPropertyIcon(prop.type)}</span>
                      <span>{prop.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="toolbar-dropdown-wrapper">
            <button
              className="toolbar-action-btn"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <span>↕️</span>
              <span>Trier</span>
            </button>
            {showSortDropdown && (
              <div className="toolbar-dropdown">
                <div className="dropdown-header">Trier par</div>
                <div className="dropdown-content">
                  {properties.map((prop) => (
                    <div
                      key={prop.id}
                      className="dropdown-item"
                      onClick={() => {
                        handleSort(prop.name);
                        setShowSortDropdown(false);
                      }}
                    >
                      <span>{getPropertyIcon(prop.type)}</span>
                      <span>{prop.name}</span>
                      {sortColumn === prop.name && (
                        <span className="sort-badge">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active filters and sorts badges */}
        {(sortColumn) && (
          <div className="active-filters-sorts">
            {sortColumn && (
              <div className="filter-badge">
                <span className="badge-label">
                  Tri: {getPropertyIcon(properties.find(p => p.name === sortColumn)?.type || 'title')} {sortColumn}
                </span>
                <span className="badge-direction">
                  {sortDirection === 'asc' ? '↑ Croissant' : '↓ Décroissant'}
                </span>
                <button
                  className="badge-remove"
                  onClick={() => {
                    setSortColumn(null);
                    setSortDirection('asc');
                  }}
                  title="Supprimer le tri"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

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
                    <th
                      key={prop.id}
                      style={{
                        width: getColumnWidth(prop.id, prop.name),
                        position: 'relative'
                      }}
                    >
                      <div
                        className={`column-header ${prop.name !== 'Title' ? 'editable' : ''}`}
                        onClick={(e) => {
                          if (prop.name !== 'Title') {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDialogPosition({
                              top: rect.bottom + window.scrollY,
                              left: rect.left + window.scrollX
                            });
                            setEditingColumnId(prop.id);
                            setEditingColumnName(prop.name);
                            setEditingColumnType(prop.type);
                          }
                        }}
                      >
                        <span>
                          {getPropertyIcon(prop.type)} {prop.name}
                        </span>
                        <ResizeHandle
                          propertyId={prop.id}
                          onResize={handleColumnResize}
                        />
                      </div>
                    </th>
                  ))}
                  <th className="add-property-header">
                    <button
                      className="add-property-btn"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setAddPropertyPosition({
                          top: rect.bottom + window.scrollY,
                          left: rect.left + window.scrollX
                        });
                        setShowAddProperty(true);
                      }}
                      title="Ajouter une propriété"
                    >
                      +
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {getDisplayPages().map((page) => (
                  <tr key={page.id} className="database-row">
                    {properties.map((prop) => {
                      const propertyValue = page.properties?.[prop.name];

                      return (
                        <td key={`${page.id}-${prop.name}`}>
                          <PropertyCell
                            type={prop.type}
                            value={propertyValue}
                            onUpdate={(value) => handleUpdatePropertyValue(page.id, prop.name, value)}
                            onTitleClick={prop.name === 'Title' ? () => handleNameClick(page.id) : undefined}
                          />
                        </td>
                      );
                    })}
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Dialog pour ajouter une propriété */}
            {showAddProperty && addPropertyPosition && (
              <div
                className="column-edit-dialog"
                style={{
                  top: `${addPropertyPosition.top}px`,
                  left: `${addPropertyPosition.left}px`
                }}
              >
                <div className="dialog-field">
                  <label className="dialog-label">Nom</label>
                  <input
                    type="text"
                    className="column-name-input"
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newPropertyName.trim()) {
                          handleAddProperty(newPropertyName, newPropertyType as PropertyDefinition['type']);
                        }
                      } else if (e.key === 'Escape') {
                        setShowAddProperty(false);
                        setNewPropertyName('');
                        setNewPropertyType('rich_text');
                      }
                    }}
                    autoFocus
                  />
                </div>

                <div className="dialog-field">
                  <label className="dialog-label">Type de propriété</label>
                  <select
                    className="column-type-select"
                    value={newPropertyType}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      setNewPropertyType(selectedType);
                      // Si le nom est vide, utiliser le nom du type
                      if (!newPropertyName.trim()) {
                        const typeNames: Record<string, string> = {
                          'rich_text': 'Texte',
                          'number': 'Nombre',
                          'checkbox': 'Case à cocher',
                          'date': 'Date',
                          'select': 'Sélection',
                          'multi_select': 'Multi-sélection',
                          'status': 'Statut',
                          'url': 'URL',
                          'email': 'Email'
                        };
                        setNewPropertyName(typeNames[selectedType] || selectedType);
                      }
                    }}
                  >
                    <option value="rich_text">📝 Texte</option>
                    <option value="number">🔢 Nombre</option>
                    <option value="checkbox">✅ Case à cocher</option>
                    <option value="date">📅 Date</option>
                    <option value="select">🏷️ Sélection</option>
                    <option value="multi_select">🏷️ Multi-sélection</option>
                    <option value="status">🔵 Statut</option>
                    <option value="url">🔗 URL</option>
                    <option value="email">✉️ Email</option>
                  </select>
                </div>

                <div className="dialog-actions">
                  <button
                    className="dialog-btn dialog-btn-cancel"
                    onClick={() => {
                      setShowAddProperty(false);
                      setNewPropertyName('');
                      setNewPropertyType('rich_text');
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    className="dialog-btn dialog-btn-save"
                    onClick={() => {
                      if (newPropertyName.trim()) {
                        handleAddProperty(newPropertyName, newPropertyType as PropertyDefinition['type']);
                      }
                    }}
                  >
                    Créer
                  </button>
                </div>
              </div>
            )}

            {/* Dialog positionné en fixed */}
            {editingColumnId && dialogPosition && (
              <div
                className="column-edit-dialog"
                style={{
                  top: `${dialogPosition.top}px`,
                  left: `${dialogPosition.left}px`
                }}
              >
                <div className="dialog-field">
                  <label className="dialog-label">Nom</label>
                  <input
                    type="text"
                    className="column-name-input"
                    value={editingColumnName}
                    onChange={(e) => setEditingColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const prop = properties.find(p => p.id === editingColumnId);
                        if (prop) {
                          handleUpdateColumn(
                            prop.id,
                            prop.name,
                            editingColumnName,
                            prop.type,
                            editingColumnType
                          );
                        }
                        setEditingColumnId(null);
                      } else if (e.key === 'Escape') {
                        setEditingColumnId(null);
                      }
                    }}
                    autoFocus
                  />
                </div>

                <div className="dialog-field">
                  <label className="dialog-label">Type de propriété</label>
                  <select
                    className="column-type-select"
                    value={editingColumnType}
                    onChange={(e) => setEditingColumnType(e.target.value)}
                  >
                    <option value="rich_text">📝 Texte</option>
                    <option value="number">🔢 Nombre</option>
                    <option value="checkbox">✅ Case à cocher</option>
                    <option value="date">📅 Date</option>
                    <option value="select">🏷️ Sélection</option>
                    <option value="multi_select">🏷️ Multi-sélection</option>
                    <option value="status">🔵 Statut</option>
                    <option value="url">🔗 URL</option>
                    <option value="email">✉️ Email</option>
                  </select>
                </div>

                <div className="dialog-actions">
                  <button
                    className="dialog-btn dialog-btn-cancel"
                    onClick={() => setEditingColumnId(null)}
                  >
                    Annuler
                  </button>
                  <button
                    className="dialog-btn dialog-btn-save"
                    onClick={() => {
                      const prop = properties.find(p => p.id === editingColumnId);
                      if (prop) {
                        handleUpdateColumn(
                          prop.id,
                          prop.name,
                          editingColumnName,
                          prop.type,
                          editingColumnType
                        );
                      }
                      setEditingColumnId(null);
                    }}
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPageId && (
        <PageModal
          pageId={selectedPageId}
          isOpen={isPageModalOpen}
          onClose={handleCloseModal}
          onUpdate={() => id && loadDatabase(id)}
        />
      )}
    </div>
  );
}
