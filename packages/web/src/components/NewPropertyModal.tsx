import { useState } from 'react';
import './NewPropertyModal.css';

interface NewPropertyModalProps {
  onClose: () => void;
  onCreate: (name: string, type: string) => void;
}

type PropertyType = 'title' | 'rich_text' | 'number' | 'checkbox' | 'date' | 'select' | 'status' | 'url' | 'email' | 'multi_select';

interface PropertyTypeOption {
  value: PropertyType;
  label: string;
  icon: string;
}

const PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: 'rich_text', label: 'Texte', icon: '📝' },
  { value: 'number', label: 'Nombre', icon: '🔢' },
  { value: 'select', label: 'Sélection', icon: '🏷️' },
  { value: 'multi_select', label: 'Multi-sélection', icon: '🏷️' },
  { value: 'status', label: 'Statut', icon: '🔴' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'checkbox', label: 'Case à cocher', icon: '☑️' },
  { value: 'url', label: 'URL', icon: '🔗' },
  { value: 'email', label: 'Email', icon: '📧' },
];

export function NewPropertyModal({ onClose, onCreate }: NewPropertyModalProps) {
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('rich_text');

  const handleCreate = () => {
    if (propertyName.trim()) {
      onCreate(propertyName.trim(), propertyType);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nouvelle propriété</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Nom de la propriété</label>
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Statut, Priorité, Date limite..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Type de propriété</label>
            <div className="property-type-grid">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`property-type-btn ${propertyType === type.value ? 'selected' : ''}`}
                  onClick={() => setPropertyType(type.value)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn-create"
            onClick={handleCreate}
            disabled={!propertyName.trim()}
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
