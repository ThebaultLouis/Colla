import { PageId, PageTitle, PageContent } from './value-objects';
import { Property } from '../database/property-legacy';
import {
  PropertyValueObject,
  TitleProperty
} from '../database/property-values';
import { Icon } from './icon';
import { Cover } from './cover';
import { User } from './user';
import { Parent } from './parent';

/**
 * Page Entity - DDD
 * Une entité est définie par son identité qui persiste dans le temps
 * 
 * Structure alignée sur l'API Notion (https://developers.notion.com/reference/page)
 * Une page peut être :
 * - Une page dans un workspace (parent: {type: 'workspace'})
 * - Une page dans une database/data source (parent: {type: 'data_source_id', data_source_id: '...'})
 * - Une page imbriquée (parent: {type: 'page_id', page_id: '...'})
 * 
 * Le champ 'object' détermine si c'est une page ('page') ou une database ('database')
 * 
 * IMPORTANT: Le titre est stocké dans properties['Title'] comme TitleProperty, pas comme champ séparé
 */
export class Page {
  private constructor(
    private readonly object: 'page' | 'database',
    private readonly id: PageId,
    private readonly created_time: Date,
    private readonly last_edited_time: Date,
    private readonly created_by: User,
    private readonly last_edited_by: User,
    private cover: Cover,
    private icon: Icon,
    private parent: Parent,
    private archived: boolean,
    private in_trash: boolean,
    private readonly properties: Map<string, PropertyValueObject>, // Notion property values
    private url: string | null,
    private public_url: string | null,
    // Legacy fields for backward compatibility
    private readonly legacyProperties: Map<string, Property>,
    private content: PageContent,
  ) { }

  static create(id: PageId, title: PageTitle, content?: PageContent, objectType: 'page' | 'database' = 'page', createdBy?: User): Page {
    const now = new Date();
    const user = createdBy || User.empty();

    // Créer la propriété Title comme TitleProperty
    const properties = new Map<string, PropertyValueObject>();
    properties.set('Title', TitleProperty.fromPlainText('title', title.getValue()));

    return new Page(
      objectType,
      id,
      now, // created_time
      now, // last_edited_time
      user, // created_by
      user, // last_edited_by
      Cover.empty(),
      Icon.empty(),
      Parent.workspace(), // Par défaut, page dans workspace
      false, // archived
      false, // in_trash
      properties,
      null, // url
      null, // public_url
      new Map<string, Property>(), // legacyProperties
      content || PageContent.empty(),
    );
  }

  static reconstitute(
    object: 'page' | 'database',
    id: PageId,
    created_time: Date,
    last_edited_time: Date,
    created_by: User,
    last_edited_by: User,
    cover: Cover,
    icon: Icon,
    parent: Parent,
    archived: boolean,
    in_trash: boolean,
    properties: Map<string, PropertyValueObject>,
    url: string | null,
    public_url: string | null,
    // Legacy fields for backward compatibility
    legacyProperties: Map<string, Property>,
    content: PageContent,
  ): Page {
    return new Page(
      object,
      id,
      created_time,
      last_edited_time,
      created_by,
      last_edited_by,
      cover,
      icon,
      parent,
      archived,
      in_trash,
      properties,
      url,
      public_url,
      legacyProperties,
      content,
    );
  }

  // Getters
  getObject(): 'page' | 'database' {
    return this.object;
  }

  getId(): PageId {
    return this.id;
  }

  getTitle(): PageTitle {
    // Extraire le titre depuis les propriétés
    const titleProp = this.properties.get('Title') as TitleProperty | undefined;
    if (titleProp) {
      // Si c'est une vraie instance avec getPlainText(), l'utiliser
      if (typeof (titleProp as any).getPlainText === 'function') {
        return PageTitle.create((titleProp as any).getPlainText());
      }
      // Sinon, c'est un objet DTO simple, extraire le texte manuellement
      if ((titleProp as any).title && Array.isArray((titleProp as any).title)) {
        const plainText = (titleProp as any).title
          .map((t: any) => t.plain_text || '')
          .join('');
        return PageTitle.create(plainText);
      }
    }
    return PageTitle.create('');
  }

  getContent(): PageContent {
    return this.content;
  }

  getProperties(): Map<string, PropertyValueObject> {
    return new Map(this.properties);
  }

  getProperty(propertyId: string): PropertyValueObject | undefined {
    return this.properties.get(propertyId);
  }

  // Legacy support
  getLegacyProperties(): Map<string, Property> {
    return new Map(this.legacyProperties);
  }

  getLegacyProperty(propertyId: string): Property | undefined {
    return this.legacyProperties.get(propertyId);
  }

  getCreatedAt(): Date {
    return this.created_time;
  }

  getUpdatedAt(): Date {
    return this.last_edited_time;
  }

  isADatabase(): boolean {
    return this.object === 'database';
  }

  getParent(): Parent {
    return this.parent;
  }

  getParentId(): PageId | null {
    // Legacy support
    if (this.parent.isDataSource()) {
      const parentData = this.parent.getValue();
      if ('data_source_id' in parentData) {
        return PageId.create(parentData.data_source_id);
      }
    }
    if (this.parent.isPage()) {
      const parentData = this.parent.getValue();
      if ('page_id' in parentData) {
        return PageId.create(parentData.page_id);
      }
    }
    return null;
  }

  isRootPage(): boolean {
    return this.parent.isWorkspace();
  }

  getIcon(): Icon {
    return this.icon;
  }

  getCover(): Cover {
    return this.cover;
  }

  isArchived(): boolean {
    return this.archived;
  }

  isInTrash(): boolean {
    return this.in_trash;
  }

  getUrl(): string | null {
    return this.url;
  }

  getPublicUrl(): string | null {
    return this.public_url;
  }

  getCreatedBy(): User {
    return this.created_by;
  }

  getLastEditedBy(): User {
    return this.last_edited_by;
  }

  // Business methods
  setParent(parent: Parent): void {
    this.parent = parent;
    this.touch();
  }

  // Legacy support
  setParentId(parentId: PageId | null): void {
    if (parentId) {
      this.parent = Parent.dataSource(parentId.getValue());
    } else {
      this.parent = Parent.workspace();
    }
    this.touch();
  }

  setIcon(icon: Icon): void {
    this.icon = icon;
    this.touch();
  }

  setCover(cover: Cover): void {
    this.cover = cover;
    this.touch();
  }

  archive(): void {
    this.archived = true;
    this.touch();
  }

  unarchive(): void {
    this.archived = false;
    this.touch();
  }

  moveToTrash(): void {
    this.in_trash = true;
    this.touch();
  }

  restoreFromTrash(): void {
    this.in_trash = false;
    this.touch();
  }

  updateTitle(newTitle: PageTitle): void {
    const currentTitle = this.getTitle();
    if (currentTitle.equals(newTitle)) {
      return;
    }
    // Mettre à jour la propriété Title
    this.properties.set('Title', TitleProperty.fromPlainText('title', newTitle.getValue()));
    this.touch();
  }

  updateContent(newContent: PageContent): void {
    if (this.content.equals(newContent)) {
      return;
    }
    this.content = newContent;
    this.touch();
  }

  setProperty(propertyId: string, property: PropertyValueObject): void {
    this.properties.set(propertyId, property);
    this.touch();
  }

  // Legacy support
  setLegacyProperty(propertyId: string, property: Property): void {
    this.legacyProperties.set(propertyId, property);
    this.touch();
  }

  removeProperty(propertyId: string): void {
    const removed = this.properties.delete(propertyId);
    if (removed) {
      this.touch();
    }
  }

  hasProperty(propertyId: string): boolean {
    return this.properties.has(propertyId);
  }

  private touch(): void {
    // Note: In Notion API, last_edited_time is readonly
    // We can't actually update it here, but keeping for compatibility
    // This would need to be handled at the repository level
  }

  // Pour la sérialisation - Format Notion API
  toJSON() {
    const propertiesObj: Record<string, any> = {};
    this.properties.forEach((property, name) => {
      // PropertyValueObject peut être un objet simple (depuis l'API)
      // ou un objet avec toJSON() (depuis le domaine)
      propertiesObj[name] = typeof property.toJSON === 'function'
        ? property.toJSON()
        : property;
    });

    return {
      object: this.object,
      id: this.id.getValue(),
      created_time: this.created_time.toISOString(),
      last_edited_time: this.last_edited_time.toISOString(),
      created_by: this.created_by.toJSON(),
      last_edited_by: this.last_edited_by.toJSON(),
      cover: this.cover.toJSON(),
      icon: this.icon.toJSON(),
      parent: this.parent.toJSON(),
      archived: this.archived,
      in_trash: this.in_trash,
      properties: propertiesObj,
      url: this.url,
      public_url: this.public_url,
      // Legacy fields for backward compatibility
      title: this.getTitle().getValue(),
      content: this.content.getValue(),
    };
  }
}
