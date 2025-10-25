import { PageId, PageTitle, PageContent } from './value-objects';
import { Property } from '../database/property';

/**
 * Page Entity - DDD
 * Une entité est définie par son identité qui persiste dans le temps
 * 
 * Comme Notion, une page peut être :
 * - Une page simple (isDatabase=false, parentId=null) : page root
 * - Une database (isDatabase=true, parentId=null) : database root qui contient des pages
 * - Une page dans une database (isDatabase=false, parentId=databaseId)
 */
export class Page {
  private constructor(
    private readonly id: PageId,
    private title: PageTitle,
    private content: PageContent,
    private readonly properties: Map<string, Property>, // propertyId -> Property
    private readonly isDatabase: boolean, // true si c'est une database
    private parentId: PageId | null, // null si page root, sinon ID de la database parente
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) { }

  static create(id: PageId, title: PageTitle, content?: PageContent, isDatabase = false): Page {
    const now = new Date();
    return new Page(
      id,
      title,
      content || PageContent.empty(),
      new Map<string, Property>(),
      isDatabase,
      null, // Par défaut, page root
      now,
      now,
    );
  }

  static reconstitute(
    id: PageId,
    title: PageTitle,
    content: PageContent,
    properties: Map<string, Property>,
    isDatabase: boolean,
    parentId: PageId | null,
    createdAt: Date,
    updatedAt: Date,
  ): Page {
    return new Page(id, title, content, properties, isDatabase, parentId, createdAt, updatedAt);
  }

  // Getters
  getId(): PageId {
    return this.id;
  }

  getTitle(): PageTitle {
    return this.title;
  }

  getContent(): PageContent {
    return this.content;
  }

  getProperties(): Map<string, Property> {
    return new Map(this.properties);
  }

  getProperty(propertyId: string): Property | undefined {
    return this.properties.get(propertyId);
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  isADatabase(): boolean {
    return this.isDatabase;
  }

  getParentId(): PageId | null {
    return this.parentId;
  }

  isRootPage(): boolean {
    return this.parentId === null;
  }

  // Business methods
  setParent(parentId: PageId | null): void {
    this.parentId = parentId;
    this.touch();
  }

  updateTitle(newTitle: PageTitle): void {
    if (this.title.equals(newTitle)) {
      return;
    }
    this.title = newTitle;
    this.touch();
  }

  updateContent(newContent: PageContent): void {
    if (this.content.equals(newContent)) {
      return;
    }
    this.content = newContent;
    this.touch();
  }

  setProperty(propertyId: string, property: Property): void {
    this.properties.set(propertyId, property);
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
    this.updatedAt = new Date();
  }

  // Pour la sérialisation
  toJSON() {
    const propertiesObj: Record<string, any> = {};
    this.properties.forEach((property, id) => {
      propertiesObj[id] = property.toJSON();
    });

    return {
      id: this.id.getValue(),
      title: this.title.getValue(),
      content: this.content.getValue(),
      properties: propertiesObj,
      isDatabase: this.isDatabase,
      parentId: this.parentId?.getValue() || null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
