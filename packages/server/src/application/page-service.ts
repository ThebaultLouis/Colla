import { Page, PageId, PageTitle, PageContent, PageRepository, Parent } from '@colla/shared';
import { v4 as uuidv4 } from 'uuid';

/**
 * Application Service - Application Layer
 * Orchestre les use cases métier
 */
export class PageService {
  constructor(private readonly pageRepository: PageRepository) { }

  async createPage(title: string, content?: string, objectType: 'page' | 'database' = 'page', parentId?: string): Promise<Page> {
    const id = PageId.create(uuidv4());
    const pageTitle = PageTitle.create(title);
    const pageContent = content ? PageContent.create(content) : PageContent.empty();

    const page = Page.create(id, pageTitle, pageContent, objectType);

    // Si un parentId est fourni, définir le parent
    if (parentId) {
      const parent = await this.pageRepository.findById(PageId.create(parentId));
      if (!parent) {
        throw new Error(`Parent page with id ${parentId} not found`);
      }

      // Si le parent est une database, utiliser Parent.dataSource
      // Sinon, utiliser Parent.page
      if (parent.isADatabase()) {
        page.setParent(Parent.dataSource(parentId));
      } else {
        page.setParent(Parent.page(parentId));
      }
    }

    await this.pageRepository.save(page);
    return page;
  }

  async createDatabase(name: string, description?: string): Promise<Page> {
    return this.createPage(name, description, 'database');
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

  async listPageChildren(pageId: string): Promise<Page[]> {
    const id = PageId.create(pageId);
    const page = await this.pageRepository.findById(id);

    if (!page) {
      throw new Error(`Page with id ${pageId} not found`);
    }

    // Retourner toutes les pages qui ont ce pageId comme parent
    return await this.pageRepository.findByParentId(id);
  }

  async updatePage(id: string, title?: string, content?: string, properties?: Record<string, any>): Promise<Page> {
    const pageId = PageId.create(id);
    const page = await this.pageRepository.findById(pageId);

    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    console.log('📝 PageService.updatePage called with:', {
      id,
      title,
      titleType: typeof title,
      titleUndefined: title === undefined,
      content: content?.substring(0, 50),
      properties: Object.keys(properties || {})
    });

    if (title !== undefined) {
      console.log('✏️ Updating title to:', title);
      page.updateTitle(PageTitle.create(title));
    }

    if (content !== undefined) {
      page.updateContent(PageContent.create(content));
    }

    if (properties !== undefined) {
      // Mettre à jour les propriétés (format PropertyValueObject)
      console.log('🔧 Processing properties:', properties);
      for (const [propName, propData] of Object.entries(properties)) {
        console.log('  Setting property:', propName, propData);
        // Les propriétés viennent déjà au format PropertyValueDTO depuis l'UI
        page.setProperty(propName, propData as any);
      }
    }

    await this.pageRepository.save(page);
    console.log('✅ Page saved with title:', page.getTitle().getValue());
    return page;
  }

  async reorderPages(pageIds: string[]): Promise<void> {
    // Met à jour l'ordre de plusieurs pages en une seule opération
    for (let i = 0; i < pageIds.length; i++) {
      const pageId = PageId.create(pageIds[i]);
      const page = await this.pageRepository.findById(pageId);
      if (page) {
        page.setOrder(i);
        await this.pageRepository.save(page);
      }
    }
  }

  async deletePage(id: string): Promise<void> {
    const pageId = PageId.create(id);
    const page = await this.pageRepository.findById(pageId);

    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // Supprimer récursivement tous les enfants
    const children = await this.pageRepository.findByParentId(pageId);
    for (const child of children) {
      await this.deletePage(child.getId().getValue());
    }

    // Supprimer la page elle-même
    await this.pageRepository.delete(pageId);
  }
}
