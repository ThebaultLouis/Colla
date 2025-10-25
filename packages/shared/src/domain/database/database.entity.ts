import { PageId } from '../page/value-objects';
import { DatabaseId, DatabaseName, DatabaseDescription } from './value-objects';
import { PropertyName } from './property-legacy';

/**
 * Database Entity - DDD
 * Une database est une collection de pages avec des propriétés communes (comme Notion)
 */
export class Database {
  private constructor(
    private readonly id: DatabaseId,
    private name: DatabaseName,
    private description: DatabaseDescription,
    private readonly pageIds: Set<PageId>,
    private readonly properties: Map<string, PropertyName>, // propertyId -> PropertyName
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) { }

  static create(
    id: DatabaseId,
    name: DatabaseName,
    description?: DatabaseDescription,
  ): Database {
    const now = new Date();
    return new Database(
      id,
      name,
      description || DatabaseDescription.empty(),
      new Set<PageId>(),
      new Map<string, PropertyName>(),
      now,
      now,
    );
  }

  static reconstitute(
    id: DatabaseId,
    name: DatabaseName,
    description: DatabaseDescription,
    pageIds: PageId[],
    properties: Map<string, PropertyName>,
    createdAt: Date,
    updatedAt: Date,
  ): Database {
    return new Database(
      id,
      name,
      description,
      new Set(pageIds),
      properties,
      createdAt,
      updatedAt,
    );
  }

  // Getters
  getId(): DatabaseId {
    return this.id;
  }

  getName(): DatabaseName {
    return this.name;
  }

  getDescription(): DatabaseDescription {
    return this.description;
  }

  getPageIds(): PageId[] {
    return Array.from(this.pageIds);
  }

  getProperties(): Map<string, PropertyName> {
    return new Map(this.properties);
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  updateName(newName: DatabaseName): void {
    if (this.name.equals(newName)) {
      return;
    }
    this.name = newName;
    this.touch();
  }

  updateDescription(newDescription: DatabaseDescription): void {
    if (this.description.equals(newDescription)) {
      return;
    }
    this.description = newDescription;
    this.touch();
  }

  addPage(pageId: PageId): void {
    this.pageIds.add(pageId);
    this.touch();
  }

  removePage(pageId: PageId): void {
    const removed = this.pageIds.delete(pageId);
    if (removed) {
      this.touch();
    }
  }

  hasPage(pageId: PageId): boolean {
    return Array.from(this.pageIds).some((id) => id.equals(pageId));
  }

  addProperty(propertyId: string, propertyName: PropertyName): void {
    if (this.properties.has(propertyId)) {
      throw new Error(`Property ${propertyId} already exists`);
    }
    this.properties.set(propertyId, propertyName);
    this.touch();
  }

  removeProperty(propertyId: string): void {
    const removed = this.properties.delete(propertyId);
    if (removed) {
      this.touch();
    }
  }

  renameProperty(propertyId: string, newName: PropertyName): void {
    if (!this.properties.has(propertyId)) {
      throw new Error(`Property ${propertyId} does not exist`);
    }
    this.properties.set(propertyId, newName);
    this.touch();
  }

  getPageCount(): number {
    return this.pageIds.size;
  }

  getPropertyCount(): number {
    return this.properties.size;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  toJSON() {
    const propertiesObj: Record<string, string> = {};
    this.properties.forEach((name, id) => {
      propertiesObj[id] = name.getValue();
    });

    return {
      id: this.id.getValue(),
      name: this.name.getValue(),
      description: this.description.getValue(),
      pageIds: Array.from(this.pageIds).map((id) => id.getValue()),
      properties: propertiesObj,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
