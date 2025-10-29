import { useState } from 'react';
import './RichTextCell.css';

interface RichTextCellProps {
  value: string;
  onUpdate: (value: string) => void;
}

export function RichTextCell({ value, onUpdate }: RichTextCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleClick = () => {
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
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
    }
    // Allow Enter for new lines in textarea
  };

  if (isEditing) {
    return (
      <textarea
        className="richtext-cell-input"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        rows={3}
      />
    );
  }

  return (
    <div className="richtext-cell" onClick={handleClick}>
      <span className="richtext-cell-text">{value || ''}</span>
    </div>
  );
}
