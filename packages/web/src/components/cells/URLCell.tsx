import { useState } from 'react';
import './URLCell.css';

interface URLCellProps {
  value: string | null;
  onUpdate: (value: string | null) => void;
}

export function URLCell({ value, onUpdate }: URLCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing && value) {
      // Allow clicking the link
      return;
    }
    e.preventDefault();
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editValue || null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value || '');
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <input
        type="url"
        className="url-cell-input"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="https://example.com"
        autoFocus
      />
    );
  }

  return (
    <div className="url-cell" onDoubleClick={handleClick}>
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="url-cell-link"
          onClick={(e) => e.stopPropagation()}
        >
          🔗 {value}
        </a>
      ) : (
        <span className="url-cell-empty" onClick={handleClick}>
          Vide
        </span>
      )}
    </div>
  );
}
