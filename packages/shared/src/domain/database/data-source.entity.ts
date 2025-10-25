import { User } from '../page/user';
import { Parent } from '../page/parent';
import { Icon } from '../page/icon';
import { RichText } from './rich-text';
import { PropertySchemaObject } from './property-schema';

/**
 * DataSource ID - Value Object
 */
export class DataSourceId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('DataSource ID cannot be empty');
    }
  }

  static create(value: string): DataSourceId {
    return new DataSourceId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: DataSourceId): boolean {
    return this.value === other.value;
  }
}

/**
 * DataSource Entity - Notion API 2025-09-03
 * A data source is the actual table/collection within a database
 * It contains the property schema (column definitions) and references to pages
 */
export class DataSource {
  private constructor(
    private readonly object: 'data_source',
    private readonly id: DataSourceId,
    private readonly properties: Map<string, PropertySchemaObject>, // propertyName -> PropertySchema
    private readonly parent: Parent, // Parent database
    private readonly databaseParent: Parent, // Grandparent (database's parent)
    private readonly createdTime: Date,
    private readonly createdBy: User,
    private lastEditedTime: Date,
    private lastEditedBy: User,
    private title: RichText[],
    private description: RichText[],
    private icon: Icon | null,
    private archived: boolean,
    private inTrash: boolean,
  ) { }

  /**
   * Create a new DataSource
   */
  static create(
    id: DataSourceId,
    parentDatabaseId: string,
    databaseParent: Parent,
    title: string,
    createdBy: User,
  ): DataSource {
    const now = new Date();
    return new DataSource(
      'data_source',
      id,
      new Map(),
      Parent.database(parentDatabaseId),
      databaseParent,
      now,
      createdBy,
      now,
      createdBy,
      RichText.fromPlainText(title),
      [],
      null,
      false,
      false,
    );
  }

  /**
   * Reconstitute from persistence
   */
  static reconstitute(
    id: DataSourceId,
    properties: Map<string, PropertySchemaObject>,
    parent: Parent,
    databaseParent: Parent,
    createdTime: Date,
    createdBy: User,
    lastEditedTime: Date,
    lastEditedBy: User,
    title: RichText[],
    description: RichText[],
    icon: Icon | null,
    archived: boolean,
    inTrash: boolean,
  ): DataSource {
    return new DataSource(
      'data_source',
      id,
      properties,
      parent,
      databaseParent,
      createdTime,
      createdBy,
      lastEditedTime,
      lastEditedBy,
      title,
      description,
      icon,
      archived,
      inTrash,
    );
  }

  // Getters
  getObject(): string {
    return this.object;
  }

  getId(): DataSourceId {
    return this.id;
  }

  getProperties(): Map<string, PropertySchemaObject> {
    return new Map(this.properties);
  }

  getParent(): Parent {
    return this.parent;
  }

  getDatabaseParent(): Parent {
    return this.databaseParent;
  }

  getCreatedTime(): Date {
    return this.createdTime;
  }

  getCreatedBy(): User {
    return this.createdBy;
  }

  getLastEditedTime(): Date {
    return this.lastEditedTime;
  }

  getLastEditedBy(): User {
    return this.lastEditedBy;
  }

  getTitle(): RichText[] {
    return [...this.title];
  }

  getTitleText(): string {
    return RichText.toPlainText(this.title);
  }

  getDescription(): RichText[] {
    return [...this.description];
  }

  getDescriptionText(): string {
    return RichText.toPlainText(this.description);
  }

  getIcon(): Icon | null {
    return this.icon;
  }

  isArchived(): boolean {
    return this.archived;
  }

  isInTrash(): boolean {
    return this.inTrash;
  }

  // Business methods
  updateTitle(title: string, lastEditedBy: User): void {
    this.title = RichText.fromPlainText(title);
    this.touch(lastEditedBy);
  }

  updateDescription(description: string, lastEditedBy: User): void {
    this.description = RichText.fromPlainText(description);
    this.touch(lastEditedBy);
  }

  updateIcon(icon: Icon | null, lastEditedBy: User): void {
    this.icon = icon;
    this.touch(lastEditedBy);
  }

  addProperty(propertyName: string, propertySchema: PropertySchemaObject, lastEditedBy: User): void {
    if (this.properties.has(propertyName)) {
      throw new Error(`Property ${propertyName} already exists`);
    }
    this.properties.set(propertyName, propertySchema);
    this.touch(lastEditedBy);
  }

  removeProperty(propertyName: string, lastEditedBy: User): void {
    const removed = this.properties.delete(propertyName);
    if (removed) {
      this.touch(lastEditedBy);
    }
  }

  renameProperty(oldName: string, newName: string, lastEditedBy: User): void {
    const schema = this.properties.get(oldName);
    if (!schema) {
      throw new Error(`Property ${oldName} does not exist`);
    }
    if (this.properties.has(newName)) {
      throw new Error(`Property ${newName} already exists`);
    }
    this.properties.delete(oldName);
    this.properties.set(newName, schema);
    this.touch(lastEditedBy);
  }

  updatePropertySchema(propertyName: string, propertySchema: PropertySchemaObject, lastEditedBy: User): void {
    if (!this.properties.has(propertyName)) {
      throw new Error(`Property ${propertyName} does not exist`);
    }
    this.properties.set(propertyName, propertySchema);
    this.touch(lastEditedBy);
  }

  archive(lastEditedBy: User): void {
    this.archived = true;
    this.touch(lastEditedBy);
  }

  restore(lastEditedBy: User): void {
    this.archived = false;
    this.touch(lastEditedBy);
  }

  moveToTrash(lastEditedBy: User): void {
    this.inTrash = true;
    this.touch(lastEditedBy);
  }

  restoreFromTrash(lastEditedBy: User): void {
    this.inTrash = false;
    this.touch(lastEditedBy);
  }

  private touch(lastEditedBy: User): void {
    this.lastEditedTime = new Date();
    this.lastEditedBy = lastEditedBy;
  }

  /**
   * Serialize to Notion API format
   */
  toJSON() {
    const propertiesObj: Record<string, any> = {};
    this.properties.forEach((schema, name) => {
      propertiesObj[name] = schema.toJSON();
    });

    return {
      object: this.object,
      id: this.id.getValue(),
      properties: propertiesObj,
      parent: this.parent.toJSON(),
      database_parent: this.databaseParent.toJSON(),
      created_time: this.createdTime.toISOString(),
      created_by: this.createdBy.toJSON(),
      last_edited_time: this.lastEditedTime.toISOString(),
      last_edited_by: this.lastEditedBy.toJSON(),
      title: this.title.map((rt) => rt.toJSON()),
      description: this.description.map((rt) => rt.toJSON()),
      icon: this.icon ? this.icon.toJSON() : null,
      archived: this.archived,
      in_trash: this.inTrash,
    };
  }
}
