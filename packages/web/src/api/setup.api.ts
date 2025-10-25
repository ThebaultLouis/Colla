const API_URL = 'http://localhost:3000/api';

export interface SetupConfig {
  token: string;
  repoUrl: string;
  localPath: string;
  configured: boolean;
}

export const setupApi = {
  async checkStatus(): Promise<{ configured: boolean }> {
    const response = await fetch(`${API_URL}/setup/status`);
    if (!response.ok) throw new Error('Failed to check setup status');
    return response.json() as Promise<{ configured: boolean }>;
  },

  async setupGitHub(token: string, repoUrl: string): Promise<void> {
    const response = await fetch(`${API_URL}/setup/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, repoUrl }),
    });
    if (!response.ok) {
      const data = await response.json() as { message?: string };
      throw new Error(data.message || 'Failed to setup GitHub');
    }
  },

  async getConfig(): Promise<SetupConfig> {
    const response = await fetch(`${API_URL}/setup/config`);
    if (!response.ok) throw new Error('Failed to get config');
    return response.json() as Promise<SetupConfig>;
  },
};
