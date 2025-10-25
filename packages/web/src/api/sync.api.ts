const API_URL = 'http://localhost:3000/api';

export interface SyncStatus {
  ahead: number;
  behind: number;
  hasChanges: boolean;
}

export const syncApi = {
  async push(): Promise<void> {
    const response = await fetch(`${API_URL}/sync/push`, {
      method: 'POST',
    });
    if (!response.ok) {
      const data = await response.json() as { message?: string };
      throw new Error(data.message || 'Failed to push changes');
    }
  },

  async pull(): Promise<void> {
    const response = await fetch(`${API_URL}/sync/pull`, {
      method: 'POST',
    });
    if (!response.ok) {
      const data = await response.json() as { message?: string };
      throw new Error(data.message || 'Failed to pull changes');
    }
  },

  async sync(): Promise<void> {
    const response = await fetch(`${API_URL}/sync/sync`, {
      method: 'POST',
    });
    if (!response.ok) {
      const data = await response.json() as { message?: string };
      throw new Error(data.message || 'Failed to synchronize');
    }
  },

  async getStatus(): Promise<SyncStatus> {
    const response = await fetch(`${API_URL}/sync/status`);
    if (!response.ok) throw new Error('Failed to get sync status');
    return response.json() as Promise<SyncStatus>;
  },
};
