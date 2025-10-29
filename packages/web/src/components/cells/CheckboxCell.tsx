import './CheckboxCell.css';

interface CheckboxCellProps {
  value: boolean;
  onUpdate: (value: boolean) => void;
}

export function CheckboxCell({ value, onUpdate }: CheckboxCellProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(e.target.checked);
  };

  return (
    <div className="checkbox-cell">
      <input
        type="checkbox"
        className="checkbox-cell-input"
        checked={value}
        onChange={handleChange}
      />
    </div>
  );
}
