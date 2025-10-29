import { useState } from 'react';
import './DateCell.css';

interface DateCellProps {
  value: string | null;
  onUpdate: (value: string | null) => void;
}

export function DateCell({ value, onUpdate }: DateCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value || '');
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
        type="date"
        className="date-cell-input"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
      />
    );
  }

  return (
    <div className="date-cell" onClick={handleClick}>
      {value ? (
        <span className="date-cell-value">📅 {formatDate(value)}</span>
      ) : (
        <span className="date-cell-empty">Vide</span>
      )}
    </div>
  );
}
