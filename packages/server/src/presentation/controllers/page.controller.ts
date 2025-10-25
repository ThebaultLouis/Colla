import { Request, Response, Router } from 'express';
import { PageService } from '../../application/page.service';

/**
 * PageController - Adapter HTTP (Architecture Hexagonale)
 * Expose les use cases via une API REST
 */
export class PageController {
  public router: Router;

  constructor(private readonly pageService: PageService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/pages', this.createPage.bind(this));
    this.router.get('/pages', this.listPages.bind(this));
    this.router.get('/pages/root', this.listRootPages.bind(this)); // Nouvelles routes
    this.router.get('/pages/:id', this.getPage.bind(this));
    this.router.get('/pages/:id/children', this.listDatabasePages.bind(this));
    this.router.put('/pages/:id', this.updatePage.bind(this));
    this.router.delete('/pages/:id', this.deletePage.bind(this));
  }

  private async createPage(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, object, parentId } = req.body;

      if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      // object peut être 'page' ou 'database', par défaut 'page'
      const objectType: 'page' | 'database' = object === 'database' ? 'database' : 'page';

      const page = await this.pageService.createPage(title, content, objectType, parentId);
      res.status(201).json(page.toJSON());
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async listPages(_req: Request, res: Response): Promise<void> {
    try {
      const pages = await this.pageService.listPages();
      res.status(200).json(pages.map((p) => p.toJSON()));
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async listRootPages(_req: Request, res: Response): Promise<void> {
    try {
      const pages = await this.pageService.listRootPages();
      res.status(200).json(pages.map((p) => p.toJSON()));
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async listDatabasePages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pages = await this.pageService.listDatabasePages(id);
      res.status(200).json(pages.map((p) => p.toJSON()));
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({ error: (error as Error).message });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  private async getPage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const page = await this.pageService.getPage(id);

      if (!page) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      res.status(200).json(page.toJSON());
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async updatePage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content, properties } = req.body;

      console.log('📝 Updating page:', {
        id,
        title,
        content,
        properties
      });

      const page = await this.pageService.updatePage(id, title, content, properties);
      res.status(200).json(page.toJSON());
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({ error: (error as Error).message });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  private async deletePage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.pageService.deletePage(id);
      res.status(204).send();
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({ error: (error as Error).message });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }
}
