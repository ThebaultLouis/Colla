const API_BASE_URL = '/api';

export interface PageDTO {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const pageApi = {
  async listPages(): Promise<PageDTO[]> {
    const response = await fetch(`${API_BASE_URL}/pages`);
    if (!response.ok) throw new Error('Failed to fetch pages');
    return response.json();
  },

  async getPage(id: string): Promise<PageDTO> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`);
    if (!response.ok) throw new Error('Failed to fetch page');
    return response.json();
  },

  async createPage(title: string, content: string = ''): Promise<PageDTO> {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (!response.ok) throw new Error('Failed to create page');
    return response.json();
  },

  async updatePage(id: string, title?: string, content?: string): Promise<PageDTO> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
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
