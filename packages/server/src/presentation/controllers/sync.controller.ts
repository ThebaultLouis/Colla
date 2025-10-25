import { Request, Response } from 'express';
import { GitSyncService } from '../application/git-sync.service';

export class SyncController {
  constructor(private syncService: GitSyncService) { }

  async push(_req: Request, res: Response): Promise<void> {
    try {
      await this.syncService.push();
      res.json({ message: 'Successfully pushed changes to GitHub' });
    } catch (error) {
      console.error('Push error:', error);
      res.status(500).json({
        message: 'Failed to push changes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async pull(_req: Request, res: Response): Promise<void> {
    try {
      await this.syncService.pull();
      res.json({ message: 'Successfully pulled changes from GitHub' });
    } catch (error) {
      console.error('Pull error:', error);
      res.status(500).json({
        message: 'Failed to pull changes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async sync(_req: Request, res: Response): Promise<void> {
    try {
      await this.syncService.sync();
      res.json({ message: 'Successfully synchronized with GitHub' });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({
        message: 'Failed to synchronize',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await this.syncService.getStatus();
      res.json(status);
    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json({
        message: 'Failed to get sync status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
