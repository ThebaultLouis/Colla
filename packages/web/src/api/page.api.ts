// DTO défini localement pour éviter les problèmes d'import CommonJS/ESM
export interface PageDTO {
  id: string;
  title: string;
  content: string;
  properties: Record<string, PropertyDTO>;
  isDatabase: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

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
    return response.json();
  },

  async listPages(): Promise<PageDTO[]> {
    const response = await fetch(`${API_BASE_URL}/pages`);
    if (!response.ok) throw new Error('Failed to fetch pages');
    return response.json();
  },

  async listDatabasePages(databaseId: string): Promise<PageDTO[]> {
    const response = await fetch(`${API_BASE_URL}/pages/${databaseId}/children`);
    if (!response.ok) throw new Error('Failed to fetch database pages');
    return response.json();
  },

  async getPage(id: string): Promise<PageDTO> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`);
    if (!response.ok) throw new Error('Failed to fetch page');
    return response.json();
  },

  async createPage(title: string, content = '', isDatabase = false, parentId?: string): Promise<PageDTO> {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, isDatabase, parentId }),
    });
    if (!response.ok) throw new Error('Failed to create page');
    return response.json();
  },

  async createDatabase(name: string, description = ''): Promise<PageDTO> {
    return this.createPage(name, description, true);
  },

  async updatePage(id: string, title?: string, content?: string, properties?: Record<string, PropertyDTO>): Promise<PageDTO> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, properties }),
    });
    if (!response.ok) throw new Error('Failed to update page');
    return response.json();
  },

  async deletePage(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete page');
  },
};
