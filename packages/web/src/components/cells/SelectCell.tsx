import { useState } from 'react';
import './SelectCell.css';

interface SelectOption {
  id: string;
  name: string;
  color: string;
}

interface SelectCellProps {
  value: { select: SelectOption | null } | null;
  options?: SelectOption[];
  onUpdate: (value: { select: SelectOption | null }) => void;
}

export function SelectCell({ value, options = [], onUpdate }: SelectCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const selectedOption = value?.select || null;

  const handleSelect = (option: SelectOption | null) => {
    onUpdate({ select: option });
    setIsEditing(false);
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsEditing(false), 200);
  };

  if (isEditing) {
    return (
      <div className="select-cell-dropdown" onBlur={handleBlur} tabIndex={0}>
        <div className="select-cell-option" onClick={() => handleSelect(null)}>
          <span className="select-cell-empty">Vide</span>
        </div>
        {options.map((option) => (
          <div
            key={option.id}
            className="select-cell-option"
            onClick={() => handleSelect(option)}
          >
            <span className="select-cell-badge" style={{ backgroundColor: option.color }}>
              {option.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="select-cell" onClick={handleClick}>
      {selectedOption ? (
        <span className="select-cell-badge" style={{ backgroundColor: selectedOption.color }}>
          {selectedOption.name}
        </span>
      ) : (
        <span className="select-cell-empty">Vide</span>
      )}
    </div>
  );
}
