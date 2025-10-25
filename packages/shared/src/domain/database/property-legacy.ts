/**
 * Property Value Objects - DDD
 * Les propriétés permettent d'organiser les pages dans une database (comme Notion)
 */

export enum PropertyType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  CHECKBOX = 'checkbox',
  URL = 'url',
  EMAIL = 'email',
}

export class PropertyName {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('PropertyName cannot be empty');
    }
    if (value.length > 100) {
      throw new Error('PropertyName cannot exceed 100 characters');
    }
  }

  static create(name: string): PropertyName {
    return new PropertyName(name.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PropertyName): boolean {
    return this.value === other.value;
  }
}

export class LegacyPropertyValue {
  private constructor(
    private readonly type: PropertyType,
    private readonly value: string | number | boolean | Date | string[],
  ) {
    this.validate();
  }

  static text(value: string): LegacyPropertyValue {
    return new LegacyPropertyValue(PropertyType.TEXT, value);
  }

  static number(value: number): LegacyPropertyValue {
    return new LegacyPropertyValue(PropertyType.NUMBER, value);
  }

  static select(value: string): LegacyPropertyValue {
    return new LegacyPropertyValue(PropertyType.SELECT, value);
  }

  static multiSelect(values: string[]): LegacyPropertyValue {
    return new LegacyPropertyValue(PropertyType.MULTI_SELECT, values);
  }

  static date(value: Date): LegacyPropertyValue {
    return new LegacyPropertyValue(PropertyType.DATE, value);
  }

  static checkbox(value: boolean): LegacyPropertyValue {
    return new LegacyPropertyValue(PropertyType.CHECKBOX, value);
  }

  static url(value: string): LegacyPropertyValue {
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(value)) {
      throw new Error('Invalid URL format');
    }
    return new LegacyPropertyValue(PropertyType.URL, value);
  }

  static email(value: string): LegacyPropertyValue {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      throw new Error('Invalid email format');
    }
    return new LegacyPropertyValue(PropertyType.EMAIL, value);
  }

  static fromJSON(data: { type: PropertyType; value: any }): LegacyPropertyValue {
    switch (data.type) {
      case PropertyType.TEXT:
        return LegacyPropertyValue.text(data.value);
      case PropertyType.NUMBER:
        return LegacyPropertyValue.number(data.value);
      case PropertyType.SELECT:
        return LegacyPropertyValue.select(data.value);
      case PropertyType.MULTI_SELECT:
        return LegacyPropertyValue.multiSelect(data.value);
      case PropertyType.DATE:
        return LegacyPropertyValue.date(new Date(data.value));
      case PropertyType.CHECKBOX:
        return LegacyPropertyValue.checkbox(data.value);
      case PropertyType.URL:
        return LegacyPropertyValue.url(data.value);
      case PropertyType.EMAIL:
        return LegacyPropertyValue.email(data.value);
      default:
        throw new Error(`Unknown property type: ${data.type}`);
    }
  }

  private validate(): void {
    switch (this.type) {
      case PropertyType.TEXT:
      case PropertyType.SELECT:
        if (typeof this.value !== 'string') {
          throw new Error(`${this.type} must be a string`);
        }
        break;
      case PropertyType.NUMBER:
        if (typeof this.value !== 'number') {
          throw new Error('Number property must be a number');
        }
        break;
      case PropertyType.CHECKBOX:
        if (typeof this.value !== 'boolean') {
          throw new Error('Checkbox property must be a boolean');
        }
        break;
      case PropertyType.DATE:
        if (!(this.value instanceof Date)) {
          throw new Error('Date property must be a Date');
        }
        break;
      case PropertyType.MULTI_SELECT:
        if (!Array.isArray(this.value)) {
          throw new Error('MultiSelect property must be an array');
        }
        break;
    }
  }

  getType(): PropertyType {
    return this.type;
  }

  getValue(): string | number | boolean | Date | string[] {
    return this.value;
  }

  equals(other: LegacyPropertyValue): boolean {
    if (this.type !== other.type) return false;

    if (Array.isArray(this.value) && Array.isArray(other.value)) {
      return JSON.stringify(this.value.sort()) === JSON.stringify(other.value.sort());
    }

    return this.value === other.value;
  }

  toJSON() {
    return {
      type: this.type,
      value: this.value instanceof Date ? this.value.toISOString() : this.value,
    };
  }
}

export class Property {
  private constructor(
    private readonly name: PropertyName,
    private value: LegacyPropertyValue,
  ) { }

  static create(name: PropertyName, value: LegacyPropertyValue): Property {
    return new Property(name, value);
  }

  static reconstitute(data: { name: string; type: PropertyType; value: any }): Property {
    const name = PropertyName.create(data.name);
    const value = LegacyPropertyValue.fromJSON({ type: data.type, value: data.value });
    return new Property(name, value);
  }

  getName(): PropertyName {
    return this.name;
  }

  getValue(): LegacyPropertyValue {
    return this.value;
  }

  updateValue(newValue: LegacyPropertyValue): void {
    if (newValue.getType() !== this.value.getType()) {
      throw new Error('Cannot change property type');
    }
    this.value = newValue;
  }

  toJSON() {
    return {
      name: this.name.getValue(),
      ...this.value.toJSON(),
    };
  }
}
