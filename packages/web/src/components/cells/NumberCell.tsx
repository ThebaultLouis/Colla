import { useState } from 'react';
import './NumberCell.css';

interface NumberCellProps {
  value: number | null;
  onUpdate: (value: number | null) => void;
}

export function NumberCell({ value, onUpdate }: NumberCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');

  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '';
    return num.toLocaleString('fr-FR');
  };

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value?.toString() || '');
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numValue = editValue.trim() === '' ? null : parseFloat(editValue);
    if (!isNaN(numValue as number) || numValue === null) {
      onUpdate(numValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value?.toString() || '');
    }
  };

  if (isEditing) {
    return (
      <input
        type="number"
        className="number-cell-input"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <div className="number-cell" onClick={handleClick}>
      <span className="number-cell-text">{formatNumber(value)}</span>
    </div>
  );
}
