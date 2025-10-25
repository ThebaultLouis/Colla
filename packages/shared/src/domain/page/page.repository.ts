import { Page } from './page.entity';
import { PageId } from './value-objects';

/**
 * Repository Interface - Port (Architecture Hexagonale)
 * Le domaine définit le contrat, l'infrastructure l'implémente
 */
export interface PageRepository {
  save(page: Page): Promise<void>;
  findById(id: PageId): Promise<Page | null>;
  findAll(): Promise<Page[]>;
  findRootPages(): Promise<Page[]>; // Pages sans parent (root pages et databases)
  findByParentId(parentId: PageId): Promise<Page[]>; // Pages enfants d'une database
  delete(id: PageId): Promise<void>;
  exists(id: PageId): Promise<boolean>;
}
