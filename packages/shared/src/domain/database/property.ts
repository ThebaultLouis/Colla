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

export class PropertyValue {
  private constructor(
    private readonly type: PropertyType,
    private readonly value: string | number | boolean | Date | string[],
  ) {
    this.validate();
  }

  static text(value: string): PropertyValue {
    return new PropertyValue(PropertyType.TEXT, value);
  }

  static number(value: number): PropertyValue {
    return new PropertyValue(PropertyType.NUMBER, value);
  }

  static select(value: string): PropertyValue {
    return new PropertyValue(PropertyType.SELECT, value);
  }

  static multiSelect(values: string[]): PropertyValue {
    return new PropertyValue(PropertyType.MULTI_SELECT, values);
  }

  static date(value: Date): PropertyValue {
    return new PropertyValue(PropertyType.DATE, value);
  }

  static checkbox(value: boolean): PropertyValue {
    return new PropertyValue(PropertyType.CHECKBOX, value);
  }

  static url(value: string): PropertyValue {
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(value)) {
      throw new Error('Invalid URL format');
    }
    return new PropertyValue(PropertyType.URL, value);
  }

  static email(value: string): PropertyValue {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      throw new Error('Invalid email format');
    }
    return new PropertyValue(PropertyType.EMAIL, value);
  }

  static fromJSON(data: { type: PropertyType; value: any }): PropertyValue {
    switch (data.type) {
      case PropertyType.TEXT:
        return PropertyValue.text(data.value);
      case PropertyType.NUMBER:
        return PropertyValue.number(data.value);
      case PropertyType.SELECT:
        return PropertyValue.select(data.value);
      case PropertyType.MULTI_SELECT:
        return PropertyValue.multiSelect(data.value);
      case PropertyType.DATE:
        return PropertyValue.date(new Date(data.value));
      case PropertyType.CHECKBOX:
        return PropertyValue.checkbox(data.value);
      case PropertyType.URL:
        return PropertyValue.url(data.value);
      case PropertyType.EMAIL:
        return PropertyValue.email(data.value);
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

  equals(other: PropertyValue): boolean {
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
    private value: PropertyValue,
  ) { }

  static create(name: PropertyName, value: PropertyValue): Property {
    return new Property(name, value);
  }

  static reconstitute(data: { name: string; type: PropertyType; value: any }): Property {
    const name = PropertyName.create(data.name);
    const value = PropertyValue.fromJSON({ type: data.type, value: data.value });
    return new Property(name, value);
  }

  getName(): PropertyName {
    return this.name;
  }

  getValue(): PropertyValue {
    return this.value;
  }

  updateValue(newValue: PropertyValue): void {
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
