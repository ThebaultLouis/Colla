import { useState } from 'react';
import './StatusCell.css';

interface StatusOption {
  id: string;
  name: string;
  color: string;
}

interface StatusCellProps {
  value: { status: StatusOption | null } | null;
  options?: StatusOption[];
  onUpdate: (value: { status: StatusOption | null }) => void;
}

export function StatusCell({ value, options = [], onUpdate }: StatusCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const selectedStatus = value?.status || null;

  const handleSelect = (status: StatusOption | null) => {
    onUpdate({ status });
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
      <div className="status-cell-dropdown" onBlur={handleBlur} tabIndex={0}>
        <div className="status-cell-option" onClick={() => handleSelect(null)}>
          <span className="status-cell-empty">Vide</span>
        </div>
        {options.map((status) => (
          <div
            key={status.id}
            className="status-cell-option"
            onClick={() => handleSelect(status)}
          >
            <span className="status-cell-badge" style={{ backgroundColor: status.color }}>
              ● {status.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="status-cell" onClick={handleClick}>
      {selectedStatus ? (
        <span className="status-cell-badge" style={{ backgroundColor: selectedStatus.color }}>
          ● {selectedStatus.name}
        </span>
      ) : (
        <span className="status-cell-empty">Vide</span>
      )}
    </div>
  );
}
