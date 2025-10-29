import { useState } from 'react';
import './TitleCell.css';

interface TitleCellProps {
  value: string;
  onUpdate: (value: string) => void;
  onClick?: () => void;
}

export function TitleCell({ value, onUpdate, onClick }: TitleCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onUpdate(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        className="title-cell-input"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <div
      className="title-cell"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className="title-cell-text">{value || 'Sans titre'}</span>
    </div>
  );
}
