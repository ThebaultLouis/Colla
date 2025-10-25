/**
 * Property Value Types - Notion API compatible
 * https://developers.notion.com/reference/property-value-object
 * 
 * Dans Notion, chaque propriété d'une page contient :
 * - id: identifiant de la propriété
 * - type: le type de la propriété
 * - [type]: la valeur spécifique au type
 */

import { RichText } from './rich-text';

export { RichText };

// ============================================
// Title Property
// ============================================
export interface TitlePropertyValue {
  id: string;
  type: 'title';
  title: any[]; // RichTextData[] in JSON
}

export class TitleProperty {
  private constructor(
    private readonly id: string,
    private value: RichText[],
  ) { }

  static create(id: string, value: RichText[]): TitleProperty {
    return new TitleProperty(id, value);
  }

  static empty(id: string = 'title'): TitleProperty {
    return new TitleProperty(id, []);
  }

  static fromPlainText(id: string, text: string): TitleProperty {
    return new TitleProperty(id, RichText.fromPlainText(text));
  }

  static reconstitute(data: TitlePropertyValue): TitleProperty {
    const richTexts = data.title.map((rtData: any) => RichText.reconstitute(rtData));
    return new TitleProperty(data.id, richTexts);
  }

  getId(): string {
    return this.id;
  }

  getValue(): RichText[] {
    return this.value;
  }

  getPlainText(): string {
    return RichText.toPlainText(this.value);
  }

  setValue(value: RichText[]): void {
    this.value = value;
  }

  toJSON(): TitlePropertyValue {
    return {
      id: this.id,
      type: 'title',
      title: this.value.map((rt) => rt.toJSON()) as any[],
    };
  }
}

// ============================================
// Rich Text Property
// ============================================
export interface RichTextPropertyValue {
  id: string;
  type: 'rich_text';
  rich_text: any[]; // RichTextData[] in JSON
}

export class RichTextProperty {
  private constructor(
    private readonly id: string,
    private value: RichText[],
  ) { }

  static create(id: string, value: RichText[]): RichTextProperty {
    return new RichTextProperty(id, value);
  }

  static empty(id: string): RichTextProperty {
    return new RichTextProperty(id, []);
  }

  static fromPlainText(id: string, text: string): RichTextProperty {
    return new RichTextProperty(id, RichText.fromPlainText(text));
  }

  static reconstitute(data: RichTextPropertyValue): RichTextProperty {
    const richTexts = data.rich_text.map((rtData: any) => RichText.reconstitute(rtData));
    return new RichTextProperty(data.id, richTexts);
  }

  getId(): string {
    return this.id;
  }

  getValue(): RichText[] {
    return this.value;
  }

  getPlainText(): string {
    return RichText.toPlainText(this.value);
  }

  setValue(value: RichText[]): void {
    this.value = value;
  }

  toJSON(): RichTextPropertyValue {
    return {
      id: this.id,
      type: 'rich_text',
      rich_text: this.value.map((rt) => rt.toJSON()) as any[],
    };
  }
}

// ============================================
// Number Property
// ============================================
export interface NumberPropertyValue {
  id: string;
  type: 'number';
  number: number | null;
}

export class NumberProperty {
  private constructor(
    private readonly id: string,
    private value: number | null,
  ) { }

  static create(id: string, value: number | null): NumberProperty {
    return new NumberProperty(id, value);
  }

  static empty(id: string): NumberProperty {
    return new NumberProperty(id, null);
  }

  static reconstitute(data: NumberPropertyValue): NumberProperty {
    return new NumberProperty(data.id, data.number);
  }

  getId(): string {
    return this.id;
  }

  getValue(): number | null {
    return this.value;
  }

  setValue(value: number | null): void {
    this.value = value;
  }

  toJSON(): NumberPropertyValue {
    return {
      id: this.id,
      type: 'number',
      number: this.value,
    };
  }
}

// ============================================
// Select Property
// ============================================
export interface SelectOption {
  id?: string;
  name: string;
  color: string;
}

export interface SelectPropertyValue {
  id: string;
  type: 'select';
  select: SelectOption | null;
}

export class SelectProperty {
  private constructor(
    private readonly id: string,
    private value: SelectOption | null,
  ) { }

  static create(id: string, value: SelectOption | null): SelectProperty {
    return new SelectProperty(id, value);
  }

  static empty(id: string): SelectProperty {
    return new SelectProperty(id, null);
  }

  static reconstitute(data: SelectPropertyValue): SelectProperty {
    return new SelectProperty(data.id, data.select);
  }

  getId(): string {
    return this.id;
  }

  getValue(): SelectOption | null {
    return this.value;
  }

  setValue(value: SelectOption | null): void {
    this.value = value;
  }

  toJSON(): SelectPropertyValue {
    return {
      id: this.id,
      type: 'select',
      select: this.value,
    };
  }
}

// ============================================
// Status Property
// ============================================
export interface StatusOption {
  id: string;
  name: string;
  color: string;
}

export interface StatusPropertyValue {
  id: string;
  type: 'status';
  status: StatusOption | null;
}

export class StatusProperty {
  private constructor(
    private readonly id: string,
    private value: StatusOption | null,
  ) { }

  static create(id: string, value: StatusOption | null): StatusProperty {
    return new StatusProperty(id, value);
  }

  static empty(id: string): StatusProperty {
    return new StatusProperty(id, null);
  }

  static reconstitute(data: StatusPropertyValue): StatusProperty {
    return new StatusProperty(data.id, data.status);
  }

  getId(): string {
    return this.id;
  }

  getValue(): StatusOption | null {
    return this.value;
  }

  setValue(value: StatusOption | null): void {
    this.value = value;
  }

  toJSON(): StatusPropertyValue {
    return {
      id: this.id,
      type: 'status',
      status: this.value,
    };
  }
}

// ============================================
// Date Property
// ============================================
export interface DateValue {
  start: string; // ISO 8601 format
  end: string | null;
  time_zone: string | null;
}

export interface DatePropertyValue {
  id: string;
  type: 'date';
  date: DateValue | null;
}

export class DateProperty {
  private constructor(
    private readonly id: string,
    private value: DateValue | null,
  ) { }

  static create(id: string, value: DateValue | null): DateProperty {
    return new DateProperty(id, value);
  }

  static empty(id: string): DateProperty {
    return new DateProperty(id, null);
  }

  static fromDate(id: string, start: Date, end?: Date, timeZone?: string): DateProperty {
    return new DateProperty(id, {
      start: start.toISOString().split('T')[0], // YYYY-MM-DD
      end: end ? end.toISOString().split('T')[0] : null,
      time_zone: timeZone || null,
    });
  }

  static reconstitute(data: DatePropertyValue): DateProperty {
    return new DateProperty(data.id, data.date);
  }

  getId(): string {
    return this.id;
  }

  getValue(): DateValue | null {
    return this.value;
  }

  setValue(value: DateValue | null): void {
    this.value = value;
  }

  toJSON(): DatePropertyValue {
    return {
      id: this.id,
      type: 'date',
      date: this.value,
    };
  }
}

// ============================================
// Checkbox Property
// ============================================
export interface CheckboxPropertyValue {
  id: string;
  type: 'checkbox';
  checkbox: boolean;
}

export class CheckboxProperty {
  private constructor(
    private readonly id: string,
    private value: boolean,
  ) { }

  static create(id: string, value: boolean): CheckboxProperty {
    return new CheckboxProperty(id, value);
  }

  static empty(id: string): CheckboxProperty {
    return new CheckboxProperty(id, false);
  }

  static reconstitute(data: CheckboxPropertyValue): CheckboxProperty {
    return new CheckboxProperty(data.id, data.checkbox);
  }

  getId(): string {
    return this.id;
  }

  getValue(): boolean {
    return this.value;
  }

  setValue(value: boolean): void {
    this.value = value;
  }

  toJSON(): CheckboxPropertyValue {
    return {
      id: this.id,
      type: 'checkbox',
      checkbox: this.value,
    };
  }
}

// ============================================
// URL Property
// ============================================
export interface UrlPropertyValue {
  id: string;
  type: 'url';
  url: string | null;
}

export class UrlProperty {
  private constructor(
    private readonly id: string,
    private value: string | null,
  ) { }

  static create(id: string, value: string | null): UrlProperty {
    if (value !== null && !value.match(/^https?:\/\/.+/)) {
      throw new Error('Invalid URL format');
    }
    return new UrlProperty(id, value);
  }

  static empty(id: string): UrlProperty {
    return new UrlProperty(id, null);
  }

  static reconstitute(data: UrlPropertyValue): UrlProperty {
    return new UrlProperty(data.id, data.url);
  }

  getId(): string {
    return this.id;
  }

  getValue(): string | null {
    return this.value;
  }

  setValue(value: string | null): void {
    if (value !== null && !value.match(/^https?:\/\/.+/)) {
      throw new Error('Invalid URL format');
    }
    this.value = value;
  }

  toJSON(): UrlPropertyValue {
    return {
      id: this.id,
      type: 'url',
      url: this.value,
    };
  }
}

// ============================================
// Email Property
// ============================================
export interface EmailPropertyValue {
  id: string;
  type: 'email';
  email: string | null;
}

export class EmailProperty {
  private constructor(
    private readonly id: string,
    private value: string | null,
  ) { }

  static create(id: string, value: string | null): EmailProperty {
    if (value !== null && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }
    return new EmailProperty(id, value);
  }

  static empty(id: string): EmailProperty {
    return new EmailProperty(id, null);
  }

  static reconstitute(data: EmailPropertyValue): EmailProperty {
    return new EmailProperty(data.id, data.email);
  }

  getId(): string {
    return this.id;
  }

  getValue(): string | null {
    return this.value;
  }

  setValue(value: string | null): void {
    if (value !== null && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }
    this.value = value;
  }

  toJSON(): EmailPropertyValue {
    return {
      id: this.id,
      type: 'email',
      email: this.value,
    };
  }
}

// ============================================
// Multi-select Property
// ============================================
export interface MultiSelectPropertyValue {
  id: string;
  type: 'multi_select';
  multi_select: SelectOption[];
}

export class MultiSelectProperty {
  private constructor(
    private readonly id: string,
    private value: SelectOption[],
  ) { }

  static create(id: string, value: SelectOption[]): MultiSelectProperty {
    return new MultiSelectProperty(id, value);
  }

  static empty(id: string): MultiSelectProperty {
    return new MultiSelectProperty(id, []);
  }

  static reconstitute(data: MultiSelectPropertyValue): MultiSelectProperty {
    return new MultiSelectProperty(data.id, data.multi_select);
  }

  getId(): string {
    return this.id;
  }

  getValue(): SelectOption[] {
    return this.value;
  }

  setValue(value: SelectOption[]): void {
    this.value = value;
  }

  toJSON(): MultiSelectPropertyValue {
    return {
      id: this.id,
      type: 'multi_select',
      multi_select: this.value,
    };
  }
}

// ============================================
// Union Type for All Properties
// ============================================
export type PropertyValue =
  | TitlePropertyValue
  | RichTextPropertyValue
  | NumberPropertyValue
  | SelectPropertyValue
  | StatusPropertyValue
  | DatePropertyValue
  | CheckboxPropertyValue
  | UrlPropertyValue
  | EmailPropertyValue
  | MultiSelectPropertyValue;

export type PropertyValueObject =
  | TitleProperty
  | RichTextProperty
  | NumberProperty
  | SelectProperty
  | StatusProperty
  | DateProperty
  | CheckboxProperty
  | UrlProperty
  | EmailProperty
  | MultiSelectProperty;
