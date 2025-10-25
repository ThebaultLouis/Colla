import { Request, Response } from 'express';
import { SetupService } from '../application/setup.service';

export class SetupController {
  constructor(private setupService: SetupService) { }

  async checkSetup(req: Request, res: Response): Promise<void> {
    try {
      const isConfigured = await this.setupService.isConfigured();
      res.json({ configured: isConfigured });
    } catch (error) {
      console.error('Check setup error:', error);
      res.status(500).json({
        message: 'Failed to check setup status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async setupGitHub(req: Request, res: Response): Promise<void> {
    try {
      const { token, repoUrl } = req.body;

      if (!token || !repoUrl) {
        res.status(400).json({ message: 'Token and repository URL are required' });
        return;
      }

      await this.setupService.setupGitHub(token, repoUrl);
      res.json({ message: 'GitHub repository configured successfully' });
    } catch (error) {
      console.error('GitHub setup error:', error);
      res.status(500).json({
        message: 'Failed to setup GitHub repository',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.setupService.getConfig();
      res.json(config);
    } catch (error) {
      console.error('Get config error:', error);
      res.status(500).json({
        message: 'Failed to get configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
