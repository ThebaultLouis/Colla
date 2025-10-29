import { TitleCell } from './TitleCell';
import { NumberCell } from './NumberCell';
import { CheckboxCell } from './CheckboxCell';
import { RichTextCell } from './RichTextCell';
import { DateCell } from './DateCell';
import { SelectCell } from './SelectCell';
import { MultiSelectCell } from './MultiSelectCell';
import { StatusCell } from './StatusCell';
import { URLCell } from './URLCell';
import { EmailCell } from './EmailCell';
import { PropertyValueDTO, TitlePropertyDTO, NumberPropertyDTO, CheckboxPropertyDTO } from '../../api/page.api';

interface PropertyCellProps {
  type: 'title' | 'rich_text' | 'number' | 'checkbox' | 'date' | 'select' | 'status' | 'url' | 'email' | 'multi_select';
  value: PropertyValueDTO | undefined;
  onUpdate: (value: any) => void;
  onTitleClick?: () => void;
}

// Helper pour extraire le texte d'une TitleProperty
function getTitleText(prop: PropertyValueDTO | undefined): string {
  if (!prop || prop.type !== 'title') return '';
  const titleProp = prop as TitlePropertyDTO;
  return titleProp.title.map(t => t.plain_text).join('');
}

// Helper pour extraire le texte d'une RichTextProperty
function getRichText(prop: PropertyValueDTO | undefined): string {
  if (!prop || prop.type !== 'rich_text') return '';
  return (prop as any).rich_text?.map((t: any) => t.plain_text).join('') || '';
}

export function PropertyCell({ type, value, onUpdate, onTitleClick }: PropertyCellProps) {
  switch (type) {
    case 'title':
      return (
        <TitleCell
          value={getTitleText(value)}
          onUpdate={onUpdate}
          onClick={onTitleClick}
        />
      );

    case 'number':
      return (
        <NumberCell
          value={(value as NumberPropertyDTO)?.number ?? null}
          onUpdate={onUpdate}
        />
      );

    case 'checkbox':
      return (
        <CheckboxCell
          value={(value as CheckboxPropertyDTO)?.checkbox ?? false}
          onUpdate={onUpdate}
        />
      );

    case 'rich_text':
      return (
        <RichTextCell
          value={getRichText(value)}
          onUpdate={onUpdate}
        />
      );

    case 'date':
      return (
        <DateCell
          value={(value as any)?.date?.start ?? null}
          onUpdate={(dateValue) => onUpdate({ date: { start: dateValue, end: null } })}
        />
      );

    case 'select':
      return (
        <SelectCell
          value={value as any}
          options={(value as any)?.select?.options || []}
          onUpdate={onUpdate}
        />
      );

    case 'multi_select':
      return (
        <MultiSelectCell
          value={value as any}
          options={(value as any)?.multi_select?.options || []}
          onUpdate={onUpdate}
        />
      );

    case 'status':
      return (
        <StatusCell
          value={value as any}
          options={(value as any)?.status?.options || []}
          onUpdate={onUpdate}
        />
      );

    case 'url':
      return (
        <URLCell
          value={(value as any)?.url ?? null}
          onUpdate={(urlValue) => onUpdate({ url: urlValue })}
        />
      );

    case 'email':
      return (
        <EmailCell
          value={(value as any)?.email ?? null}
          onUpdate={(emailValue) => onUpdate({ email: emailValue })}
        />
      );

    default:
      return <div style={{ color: 'rgba(55, 53, 47, 0.45)', fontSize: '13px' }}>-</div>;
  }
}
