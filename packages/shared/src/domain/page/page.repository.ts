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
  delete(id: PageId): Promise<void>;
  exists(id: PageId): Promise<boolean>;
}
