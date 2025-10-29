import { useState } from 'react';
import './MultiSelectCell.css';

interface SelectOption {
  id: string;
  name: string;
  color: string;
}

interface MultiSelectCellProps {
  value: { multi_select: SelectOption[] } | null;
  options?: SelectOption[];
  onUpdate: (value: { multi_select: SelectOption[] }) => void;
}

export function MultiSelectCell({ value, options = [], onUpdate }: MultiSelectCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const selectedOptions = value?.multi_select || [];

  const isSelected = (option: SelectOption): boolean => {
    return selectedOptions.some((selected) => selected.id === option.id);
  };

  const toggleOption = (option: SelectOption) => {
    const newSelection = isSelected(option)
      ? selectedOptions.filter((selected) => selected.id !== option.id)
      : [...selectedOptions, option];

    onUpdate({ multi_select: newSelection });
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsEditing(false), 200);
  };

  if (isEditing) {
    return (
      <div className="multi-select-cell-dropdown" onBlur={handleBlur} tabIndex={0}>
        {options.map((option) => (
          <div
            key={option.id}
            className={`multi-select-cell-option ${isSelected(option) ? 'selected' : ''}`}
            onClick={() => toggleOption(option)}
          >
            <input
              type="checkbox"
              checked={isSelected(option)}
              onChange={() => { }}
              className="multi-select-checkbox"
            />
            <span className="multi-select-badge" style={{ backgroundColor: option.color }}>
              {option.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="multi-select-cell" onClick={handleClick}>
      {selectedOptions.length > 0 ? (
        <div className="multi-select-badges">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="multi-select-badge"
              style={{ backgroundColor: option.color }}
            >
              {option.name}
            </span>
          ))}
        </div>
      ) : (
        <span className="multi-select-empty">Vide</span>
      )}
    </div>
  );
}
