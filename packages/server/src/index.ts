import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { GitPageRepository } from './infrastructure/repositories/git-page.repository';
import { PageService } from './application/page-service';
import { PageController } from './presentation/controllers/page.controller';
import { SetupService } from './application/setup-service';
import { SetupController } from './presentation/controllers/setup.controller';
import { GitSyncService } from './application/git-sync-service';
import { SyncController } from './presentation/controllers/sync.controller';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
// Utiliser un chemin absolu pour éviter les problèmes de chemin relatif
const GIT_STORAGE_PATH = process.env.GIT_STORAGE_PATH || path.join(process.cwd(), '.colla-data', 'git-repo');

/**
 * Dependency Injection / Composition Root
 * Assemble les dépendances selon l'architecture hexagonale
 */
function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Infrastructure layer
  const pageRepository = new GitPageRepository(GIT_STORAGE_PATH);

  // Application layer
  const pageService = new PageService(pageRepository);
  const setupService = new SetupService();
  const gitSyncService = new GitSyncService(
    GIT_STORAGE_PATH,
    () => setupService.getConfig()
  );

  // Presentation layer
  const pageController = new PageController(pageService);
  const setupController = new SetupController(setupService);
  const syncController = new SyncController(gitSyncService);

  // Routes
  app.get('/api/setup/status', (req, res) => setupController.checkSetup(req, res));
  app.post('/api/setup/github', (req, res) => setupController.setupGitHub(req, res));
  app.get('/api/setup/config', (req, res) => setupController.getConfig(req, res));

  // Git sync routes
  app.post('/api/sync/push', (req, res) => syncController.push(req, res));
  app.post('/api/sync/pull', (req, res) => syncController.pull(req, res));
  app.post('/api/sync/sync', (req, res) => syncController.sync(req, res));
  app.get('/api/sync/status', (req, res) => syncController.getStatus(req, res));

  app.use('/api', pageController.router);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`🚀 Colla server running on http://localhost:${PORT}`);
    console.log(`📂 Git storage: ${GIT_STORAGE_PATH}`);
  });
}

export { createApp };
