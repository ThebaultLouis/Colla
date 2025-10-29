import { useState } from 'react';
import './EmailCell.css';

interface EmailCellProps {
  value: string | null;
  onUpdate: (value: string | null) => void;
}

export function EmailCell({ value, onUpdate }: EmailCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing && value) {
      // Allow clicking the mailto link
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
        type="email"
        className="email-cell-input"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="example@domain.com"
        autoFocus
      />
    );
  }

  return (
    <div className="email-cell" onDoubleClick={handleClick}>
      {value ? (
        <a
          href={`mailto:${value}`}
          className="email-cell-link"
          onClick={(e) => e.stopPropagation()}
        >
          ✉️ {value}
        </a>
      ) : (
        <span className="email-cell-empty" onClick={handleClick}>
          Vide
        </span>
      )}
    </div>
  );
}
