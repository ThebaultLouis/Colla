import { User } from '../page/user';
import { Parent } from '../page/parent';
import { Icon } from '../page/icon';
import { Cover } from '../page/cover';
import { RichText } from './rich-text';

/**
 * Database ID - Value Object
 */
export class DatabaseId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Database ID cannot be empty');
    }
  }

  static create(value: string): DatabaseId {
    return new DatabaseId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: DatabaseId): boolean {
    return this.value === other.value;
  }
}

/**
 * DataSource reference - Simple object with id and name
 */
export interface DataSourceReference {
  id: string;
  name: string;
}

/**
 * Database Entity - Notion API 2025-09-03
 * A database is a permission container that holds data sources
 */
export class Database {
  private constructor(
    private readonly object: 'database',
    private readonly id: DatabaseId,
    private dataSources: DataSourceReference[],
    private readonly createdTime: Date,
    private readonly createdBy: User,
    private lastEditedTime: Date,
    private lastEditedBy: User,
    private title: RichText[],
    private description: RichText[],
    private icon: Icon | null,
    private cover: Cover | null,
    private readonly parent: Parent,
    private url: string,
    private archived: boolean,
    private inTrash: boolean,
    private isInline: boolean,
    private publicUrl: string | null,
    private order: number = 0,
  ) { }

  /**
   * Create a new Database
   */
  static create(
    id: DatabaseId,
    parentId: string,
    parentType: 'workspace' | 'page_id',
    title: string,
    createdBy: User,
  ): Database {
    const now = new Date();
    const parent = parentType === 'workspace' ? Parent.workspace() : Parent.page(parentId);

    return new Database(
      'database',
      id,
      [],
      now,
      createdBy,
      now,
      createdBy,
      RichText.fromPlainText(title),
      [],
      null,
      null,
      parent,
      '', // URL will be set when saved
      false,
      false,
      false,
      null,
      0, // order
    );
  }

  /**
   * Reconstitute from persistence
   */
  static reconstitute(
    id: DatabaseId,
    dataSources: DataSourceReference[],
    createdTime: Date,
    createdBy: User,
    lastEditedTime: Date,
    lastEditedBy: User,
    title: RichText[],
    description: RichText[],
    icon: Icon | null,
    cover: Cover | null,
    parent: Parent,
    url: string,
    archived: boolean,
    inTrash: boolean,
    isInline: boolean,
    publicUrl: string | null,
    order: number = 0,
  ): Database {
    return new Database(
      'database',
      id,
      dataSources,
      createdTime,
      createdBy,
      lastEditedTime,
      lastEditedBy,
      title,
      description,
      icon,
      cover,
      parent,
      url,
      archived,
      inTrash,
      isInline,
      publicUrl,
      order,
    );
  }

  // Getters
  getObject(): string {
    return this.object;
  }

  getId(): DatabaseId {
    return this.id;
  }

  getDataSources(): DataSourceReference[] {
    return [...this.dataSources];
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

  getCover(): Cover | null {
    return this.cover;
  }

  getParent(): Parent {
    return this.parent;
  }

  getUrl(): string {
    return this.url;
  }

  isArchived(): boolean {
    return this.archived;
  }

  isInTrash(): boolean {
    return this.inTrash;
  }

  getIsInline(): boolean {
    return this.isInline;
  }

  getPublicUrl(): string | null {
    return this.publicUrl;
  }

  getOrder(): number {
    return this.order;
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

  updateCover(cover: Cover | null, lastEditedBy: User): void {
    this.cover = cover;
    this.touch(lastEditedBy);
  }

  setUrl(url: string): void {
    this.url = url;
  }

  setPublicUrl(publicUrl: string | null): void {
    this.publicUrl = publicUrl;
  }

  addDataSource(dataSource: DataSourceReference, lastEditedBy: User): void {
    const exists = this.dataSources.some((ds) => ds.id === dataSource.id);
    if (exists) {
      throw new Error(`DataSource ${dataSource.id} already exists`);
    }
    this.dataSources.push(dataSource);
    this.touch(lastEditedBy);
  }

  removeDataSource(dataSourceId: string, lastEditedBy: User): void {
    const initialLength = this.dataSources.length;
    this.dataSources = this.dataSources.filter((ds) => ds.id !== dataSourceId);
    if (this.dataSources.length < initialLength) {
      this.touch(lastEditedBy);
    }
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

  setInline(isInline: boolean): void {
    this.isInline = isInline;
  }

  setOrder(order: number): void {
    this.order = order;
    this.touch(this.lastEditedBy);
  }

  private touch(lastEditedBy: User): void {
    this.lastEditedTime = new Date();
    this.lastEditedBy = lastEditedBy;
  }

  /**
   * Serialize to Notion API format
   */
  toJSON() {
    return {
      object: this.object,
      id: this.id.getValue(),
      data_sources: this.dataSources,
      created_time: this.createdTime.toISOString(),
      created_by: this.createdBy.toJSON(),
      last_edited_time: this.lastEditedTime.toISOString(),
      last_edited_by: this.lastEditedBy.toJSON(),
      title: this.title.map((rt) => rt.toJSON()),
      description: this.description.map((rt) => rt.toJSON()),
      icon: this.icon ? this.icon.toJSON() : null,
      cover: this.cover ? this.cover.toJSON() : null,
      parent: this.parent.toJSON(),
      url: this.url,
      archived: this.archived,
      in_trash: this.inTrash,
      is_inline: this.isInline,
      public_url: this.publicUrl,
      order: this.order,
    };
  }
}
