// DTO défini localement pour éviter les problèmes d'import CommonJS/ESM
// Aligné sur l'API Notion
export interface PageDTO {
  id: string;
  object: 'page' | 'database';
  created_time: string;
  last_edited_time: string;
  created_by: any;
  last_edited_by: any;
  cover: any;
  icon: any;
  parent: any;
  archived: boolean;
  in_trash: boolean;
  properties: Record<string, PropertyValueDTO>;
  url: string | null;
  public_url: string | null;
  // Legacy fields
  title: string;
  content: string;
}

// Notion property value types
export interface TitlePropertyDTO {
  id: string;
  type: 'title';
  title: Array<{
    type: 'text';
    text: {
      content: string;
      link: any;
    };
    annotations: any;
    plain_text: string;
    href: string | null;
  }>;
}

export interface RichTextPropertyDTO {
  id: string;
  type: 'rich_text';
  rich_text: Array<any>;
}

export interface NumberPropertyDTO {
  id: string;
  type: 'number';
  number: number | null;
}

export interface SelectPropertyDTO {
  id: string;
  type: 'select';
  select: {
    id?: string;
    name: string;
    color: string;
  } | null;
}

export interface StatusPropertyDTO {
  id: string;
  type: 'status';
  status: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface DatePropertyDTO {
  id: string;
  type: 'date';
  date: {
    start: string;
    end: string | null;
    time_zone: string | null;
  } | null;
}

export interface CheckboxPropertyDTO {
  id: string;
  type: 'checkbox';
  checkbox: boolean;
}

export interface UrlPropertyDTO {
  id: string;
  type: 'url';
  url: string | null;
}

export interface EmailPropertyDTO {
  id: string;
  type: 'email';
  email: string | null;
}

export interface MultiSelectPropertyDTO {
  id: string;
  type: 'multi_select';
  multi_select: Array<{
    id?: string;
    name: string;
    color: string;
  }>;
}

export type PropertyValueDTO =
  | TitlePropertyDTO
  | RichTextPropertyDTO
  | NumberPropertyDTO
  | SelectPropertyDTO
  | StatusPropertyDTO
  | DatePropertyDTO
  | CheckboxPropertyDTO
  | UrlPropertyDTO
  | EmailPropertyDTO
  | MultiSelectPropertyDTO;

// Legacy property DTO
export interface PropertyDTO {
  name: string;
  type: string;
  value: any;
}

const API_BASE_URL = '/api';

export const pageApi = {
  async listRootPages(): Promise<PageDTO[]> {
    const response = await fetch(`${API_BASE_URL}/pages/root`);
    if (!response.ok) throw new Error('Failed to fetch root pages');
    return response.json() as Promise<PageDTO[]>;
  },

  async listPages(): Promise<PageDTO[]> {
    const response = await fetch(`${API_BASE_URL}/pages`);
    if (!response.ok) throw new Error('Failed to fetch pages');
    return response.json() as Promise<PageDTO[]>;
  },

  async listDatabasePages(databaseId: string): Promise<PageDTO[]> {
    const response = await fetch(`${API_BASE_URL}/pages/${databaseId}/children`);
    if (!response.ok) throw new Error('Failed to fetch database pages');
    return response.json() as Promise<PageDTO[]>;
  },

  async getPage(id: string): Promise<PageDTO> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`);
    if (!response.ok) throw new Error('Failed to fetch page');
    return response.json() as Promise<PageDTO>;
  },

  async createPage(title: string, content = '', objectType: 'page' | 'database' = 'page', parentId?: string): Promise<PageDTO> {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, object: objectType, parentId }),
    });
    if (!response.ok) throw new Error('Failed to create page');
    return response.json() as Promise<PageDTO>;
  },

  async createDatabase(name: string, description = ''): Promise<PageDTO> {
    return this.createPage(name, description, 'database');
  },

  async createPageInDatabase(databaseId: string, title: string, content = ''): Promise<PageDTO> {
    return this.createPage(title, content, 'page', databaseId);
  },

  async updatePage(id: string, title?: string, content?: string, properties?: Record<string, PropertyValueDTO>): Promise<PageDTO> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, properties }),
    });
    if (!response.ok) throw new Error('Failed to update page');
    return response.json() as Promise<PageDTO>;
  },

  async deletePage(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete page');
  },
};
