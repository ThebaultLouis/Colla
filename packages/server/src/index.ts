import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GitPageRepository } from './infrastructure/repositories/git-page.repository';
import { PageService } from './application/page.service';
import { PageController } from './presentation/controllers/page.controller';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const GIT_STORAGE_PATH = process.env.GIT_STORAGE_PATH || './.colla-data/git-repo';

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

  // Presentation layer
  const pageController = new PageController(pageService);

  // Routes
  app.use('/api', pageController.router);

  // Health check
  app.get('/health', (req, res) => {
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
