import { Page, PageId, PageTitle, PageContent, PageRepository } from '@colla/shared';
import { v4 as uuidv4 } from 'uuid';

/**
 * Application Service - Application Layer
 * Orchestre les use cases métier
 */
export class PageService {
  constructor(private readonly pageRepository: PageRepository) { }

  async createPage(title: string, content?: string, isDatabase = false, parentId?: string): Promise<Page> {
    const id = PageId.create(uuidv4());
    const pageTitle = PageTitle.create(title);
    const pageContent = content ? PageContent.create(content) : PageContent.empty();

    const page = Page.create(id, pageTitle, pageContent, isDatabase);

    // Si un parentId est fourni, définir le parent
    if (parentId) {
      const parent = await this.pageRepository.findById(PageId.create(parentId));
      if (!parent) {
        throw new Error(`Parent page with id ${parentId} not found`);
      }
      if (!parent.isADatabase()) {
        throw new Error(`Parent must be a database`);
      }
      page.setParent(PageId.create(parentId));
    }

    await this.pageRepository.save(page);
    return page;
  }

  async createDatabase(name: string, description?: string): Promise<Page> {
    return this.createPage(name, description, true);
  }

  async getPage(id: string): Promise<Page | null> {
    const pageId = PageId.create(id);
    return await this.pageRepository.findById(pageId);
  }

  async listPages(): Promise<Page[]> {
    return await this.pageRepository.findAll();
  }

  async listRootPages(): Promise<Page[]> {
    return await this.pageRepository.findRootPages();
  }

  async listDatabasePages(databaseId: string): Promise<Page[]> {
    const dbId = PageId.create(databaseId);
    const database = await this.pageRepository.findById(dbId);

    if (!database) {
      throw new Error(`Database with id ${databaseId} not found`);
    }

    if (!database.isADatabase()) {
      throw new Error(`Page with id ${databaseId} is not a database`);
    }

    return await this.pageRepository.findByParentId(dbId);
  }

  async updatePage(id: string, title?: string, content?: string): Promise<Page> {
    const pageId = PageId.create(id);
    const page = await this.pageRepository.findById(pageId);

    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    if (title !== undefined) {
      page.updateTitle(PageTitle.create(title));
    }

    if (content !== undefined) {
      page.updateContent(PageContent.create(content));
    }

    await this.pageRepository.save(page);
    return page;
  }

  async deletePage(id: string): Promise<void> {
    const pageId = PageId.create(id);
    const exists = await this.pageRepository.exists(pageId);

    if (!exists) {
      throw new Error(`Page with id ${id} not found`);
    }

    await this.pageRepository.delete(pageId);
  }
}
