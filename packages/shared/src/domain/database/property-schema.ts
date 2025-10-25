/**
 * Property Schema - Notion API 2025-09-03
 * Defines the structure and metadata of a property (column) in a data source
 * This is the DEFINITION (schema), not the value.
 */

export type PropertyType =
  | 'checkbox'
  | 'created_by'
  | 'created_time'
  | 'date'
  | 'email'
  | 'files'
  | 'formula'
  | 'last_edited_by'
  | 'last_edited_time'
  | 'multi_select'
  | 'number'
  | 'people'
  | 'phone_number'
  | 'relation'
  | 'rich_text'
  | 'rollup'
  | 'select'
  | 'status'
  | 'title'
  | 'url';

/**
 * Base interface for all property schemas
 */
export interface PropertySchema {
  id: string;
  name: string;
  description: string;
  type: PropertyType;
}

/**
 * Title property schema
 */
export class TitlePropertySchema implements PropertySchema {
  readonly type = 'title' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(name: string, description = ''): TitlePropertySchema {
    return new TitlePropertySchema('title', name, description);
  }

  static reconstitute(id: string, name: string, description: string): TitlePropertySchema {
    return new TitlePropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      title: {},
    };
  }
}

/**
 * Rich Text property schema
 */
export class RichTextPropertySchema implements PropertySchema {
  readonly type = 'rich_text' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): RichTextPropertySchema {
    return new RichTextPropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): RichTextPropertySchema {
    return new RichTextPropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      rich_text: {},
    };
  }
}

/**
 * Number property schema
 */
export type NumberFormat = 'number' | 'number_with_commas' | 'percent' | 'dollar' | 'canadian_dollar' | 'euro' | 'pound' | 'yen' | 'ruble' | 'rupee' | 'won' | 'yuan' | 'real' | 'lira' | 'rupiah' | 'franc' | 'hong_kong_dollar' | 'new_zealand_dollar' | 'krona' | 'norwegian_krone' | 'mexican_peso' | 'rand' | 'new_taiwan_dollar' | 'danish_krone' | 'zloty' | 'baht' | 'forint' | 'koruna' | 'shekel' | 'chilean_peso' | 'philippine_peso' | 'dirham' | 'colombian_peso' | 'riyal' | 'ringgit' | 'leu' | 'argentine_peso' | 'uruguayan_peso' | 'singapore_dollar';

export class NumberPropertySchema implements PropertySchema {
  readonly type = 'number' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly format: NumberFormat,
  ) { }

  static create(id: string, name: string, format: NumberFormat = 'number', description = ''): NumberPropertySchema {
    return new NumberPropertySchema(id, name, description, format);
  }

  static reconstitute(id: string, name: string, description: string, format: NumberFormat): NumberPropertySchema {
    return new NumberPropertySchema(id, name, description, format);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      number: {
        format: this.format,
      },
    };
  }
}

/**
 * Select property schema
 */
export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export class SelectPropertySchema implements PropertySchema {
  readonly type = 'select' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly options: SelectOption[],
  ) { }

  static create(id: string, name: string, options: SelectOption[] = [], description = ''): SelectPropertySchema {
    return new SelectPropertySchema(id, name, description, options);
  }

  static reconstitute(id: string, name: string, description: string, options: SelectOption[]): SelectPropertySchema {
    return new SelectPropertySchema(id, name, description, options);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      select: {
        options: this.options,
      },
    };
  }
}

/**
 * Multi-Select property schema
 */
export class MultiSelectPropertySchema implements PropertySchema {
  readonly type = 'multi_select' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly options: SelectOption[],
  ) { }

  static create(id: string, name: string, options: SelectOption[] = [], description = ''): MultiSelectPropertySchema {
    return new MultiSelectPropertySchema(id, name, description, options);
  }

  static reconstitute(id: string, name: string, description: string, options: SelectOption[]): MultiSelectPropertySchema {
    return new MultiSelectPropertySchema(id, name, description, options);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      multi_select: {
        options: this.options,
      },
    };
  }
}

/**
 * Status property schema
 */
export interface StatusOption {
  id: string;
  name: string;
  color: string;
}

export interface StatusGroup {
  id: string;
  name: string;
  color: string;
  option_ids: string[];
}

export class StatusPropertySchema implements PropertySchema {
  readonly type = 'status' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly options: StatusOption[],
    public readonly groups: StatusGroup[],
  ) { }

  static create(id: string, name: string, options: StatusOption[] = [], groups: StatusGroup[] = [], description = ''): StatusPropertySchema {
    return new StatusPropertySchema(id, name, description, options, groups);
  }

  static reconstitute(id: string, name: string, description: string, options: StatusOption[], groups: StatusGroup[]): StatusPropertySchema {
    return new StatusPropertySchema(id, name, description, options, groups);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      status: {
        options: this.options,
        groups: this.groups,
      },
    };
  }
}

/**
 * Date property schema
 */
export class DatePropertySchema implements PropertySchema {
  readonly type = 'date' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): DatePropertySchema {
    return new DatePropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): DatePropertySchema {
    return new DatePropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      date: {},
    };
  }
}

/**
 * Checkbox property schema
 */
export class CheckboxPropertySchema implements PropertySchema {
  readonly type = 'checkbox' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): CheckboxPropertySchema {
    return new CheckboxPropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): CheckboxPropertySchema {
    return new CheckboxPropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      checkbox: {},
    };
  }
}

/**
 * URL property schema
 */
export class UrlPropertySchema implements PropertySchema {
  readonly type = 'url' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): UrlPropertySchema {
    return new UrlPropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): UrlPropertySchema {
    return new UrlPropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      url: {},
    };
  }
}

/**
 * Email property schema
 */
export class EmailPropertySchema implements PropertySchema {
  readonly type = 'email' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): EmailPropertySchema {
    return new EmailPropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): EmailPropertySchema {
    return new EmailPropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      email: {},
    };
  }
}

/**
 * Phone Number property schema
 */
export class PhoneNumberPropertySchema implements PropertySchema {
  readonly type = 'phone_number' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): PhoneNumberPropertySchema {
    return new PhoneNumberPropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): PhoneNumberPropertySchema {
    return new PhoneNumberPropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      phone_number: {},
    };
  }
}

/**
 * Created Time property schema
 */
export class CreatedTimePropertySchema implements PropertySchema {
  readonly type = 'created_time' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): CreatedTimePropertySchema {
    return new CreatedTimePropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): CreatedTimePropertySchema {
    return new CreatedTimePropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      created_time: {},
    };
  }
}

/**
 * Created By property schema
 */
export class CreatedByPropertySchema implements PropertySchema {
  readonly type = 'created_by' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): CreatedByPropertySchema {
    return new CreatedByPropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): CreatedByPropertySchema {
    return new CreatedByPropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      created_by: {},
    };
  }
}

/**
 * Last Edited Time property schema
 */
export class LastEditedTimePropertySchema implements PropertySchema {
  readonly type = 'last_edited_time' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): LastEditedTimePropertySchema {
    return new LastEditedTimePropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): LastEditedTimePropertySchema {
    return new LastEditedTimePropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      last_edited_time: {},
    };
  }
}

/**
 * Last Edited By property schema
 */
export class LastEditedByPropertySchema implements PropertySchema {
  readonly type = 'last_edited_by' as const;

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) { }

  static create(id: string, name: string, description = ''): LastEditedByPropertySchema {
    return new LastEditedByPropertySchema(id, name, description);
  }

  static reconstitute(id: string, name: string, description: string): LastEditedByPropertySchema {
    return new LastEditedByPropertySchema(id, name, description);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      last_edited_by: {},
    };
  }
}

/**
 * Type guard to determine property schema type
 */
export type PropertySchemaObject =
  | TitlePropertySchema
  | RichTextPropertySchema
  | NumberPropertySchema
  | SelectPropertySchema
  | MultiSelectPropertySchema
  | StatusPropertySchema
  | DatePropertySchema
  | CheckboxPropertySchema
  | UrlPropertySchema
  | EmailPropertySchema
  | PhoneNumberPropertySchema
  | CreatedTimePropertySchema
  | CreatedByPropertySchema
  | LastEditedTimePropertySchema
  | LastEditedByPropertySchema;
