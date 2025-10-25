/**
 * Parent Value Object
 * Représente le parent d'une page dans Notion
 * Le parent peut être : data_source_id, page_id, workspace, database_id, ou block_id
 */

export interface DataSourceParent {
  type: 'data_source_id';
  data_source_id: string;
}

export interface PageParent {
  type: 'page_id';
  page_id: string;
}

export interface WorkspaceParent {
  type: 'workspace';
  workspace: true;
}

export interface DatabaseParent {
  type: 'database_id';
  database_id: string;
}

export interface BlockParent {
  type: 'block_id';
  block_id: string;
}

export type ParentData = DataSourceParent | PageParent | WorkspaceParent | DatabaseParent | BlockParent;

export class Parent {
  private constructor(private readonly value: ParentData) { }

  static workspace(): Parent {
    return new Parent({ type: 'workspace', workspace: true });
  }

  static dataSource(dataSourceId: string): Parent {
    if (!dataSourceId || dataSourceId.trim().length === 0) {
      throw new Error('Data source ID cannot be empty');
    }
    return new Parent({ type: 'data_source_id', data_source_id: dataSourceId });
  }

  static page(pageId: string): Parent {
    if (!pageId || pageId.trim().length === 0) {
      throw new Error('Page ID cannot be empty');
    }
    return new Parent({ type: 'page_id', page_id: pageId });
  }

  static database(databaseId: string): Parent {
    if (!databaseId || databaseId.trim().length === 0) {
      throw new Error('Database ID cannot be empty');
    }
    return new Parent({ type: 'database_id', database_id: databaseId });
  }

  static block(blockId: string): Parent {
    if (!blockId || blockId.trim().length === 0) {
      throw new Error('Block ID cannot be empty');
    }
    return new Parent({ type: 'block_id', block_id: blockId });
  }

  static reconstitute(data: ParentData): Parent {
    return new Parent(data);
  }

  getValue(): ParentData {
    return this.value;
  }

  getType(): string {
    return this.value.type;
  }

  isWorkspace(): boolean {
    return this.value.type === 'workspace';
  }

  isDataSource(): boolean {
    return this.value.type === 'data_source_id';
  }

  isPage(): boolean {
    return this.value.type === 'page_id';
  }

  isDatabase(): boolean {
    return this.value.type === 'database_id';
  }

  isBlock(): boolean {
    return this.value.type === 'block_id';
  }

  toJSON(): ParentData {
    return this.value;
  }

  equals(other: Parent): boolean {
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }
}

export default Parent;
