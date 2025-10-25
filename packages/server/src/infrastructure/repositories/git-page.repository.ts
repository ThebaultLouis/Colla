import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as path from 'path';
import {
  Page,
  PageId,
  PageRepository,
  PageTitle,
  PageContent,
  Property
} from '@colla/shared';

/**
 * GitPageRepository - Adapter (Architecture Hexagonale)
 * Implémentation du port PageRepository utilisant Git comme storage
 */
export class GitPageRepository implements PageRepository {
  private readonly pagesDir: string;

  constructor(private readonly gitDir: string) {
    this.pagesDir = path.join(gitDir, 'pages');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.gitDir)) {
      fs.mkdirSync(this.gitDir, { recursive: true });
      this.initGitRepo();
    }
    if (!fs.existsSync(this.pagesDir)) {
      fs.mkdirSync(this.pagesDir, { recursive: true });
    }
  }

  private async initGitRepo(): Promise<void> {
    await git.init({ fs, dir: this.gitDir, defaultBranch: 'main' });
  }

  private reconstructProperties(propertiesData: Record<string, any>): Map<string, Property> {
    const properties = new Map<string, Property>();

    if (!propertiesData) {
      return properties;
    }

    for (const [propertyId, propData] of Object.entries(propertiesData)) {
      try {
        const property = Property.reconstitute(propData);
        properties.set(propertyId, property);
      } catch (error) {
        console.error(`Failed to reconstruct property ${propertyId}:`, error);
      }
    }

    return properties;
  }

  async save(page: Page): Promise<void> {
    const pageData = page.toJSON();
    const filePath = this.getPageFilePath(page.getId());

    // Write file
    fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));

    // Git add
    await git.add({ fs, dir: this.gitDir, filepath: `pages/${page.getId().getValue()}.json` });

    // Git commit
    await git.commit({
      fs,
      dir: this.gitDir,
      message: `Update page: ${pageData.title}`,
      author: {
        name: 'Colla System',
        email: 'system@colla.dev',
      },
    });
  }

  async findById(id: PageId): Promise<Page | null> {
    const filePath = this.getPageFilePath(id);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    const properties = this.reconstructProperties(data.properties || {});
    const parentId = data.parentId ? PageId.create(data.parentId) : null;

    return Page.reconstitute(
      PageId.create(data.id),
      PageTitle.create(data.title),
      PageContent.create(data.content),
      properties,
      data.isDatabase || false,
      parentId,
      new Date(data.createdAt),
      new Date(data.updatedAt),
    );
  }

  async findAll(): Promise<Page[]> {
    if (!fs.existsSync(this.pagesDir)) {
      return [];
    }

    const files = fs.readdirSync(this.pagesDir);
    const pages: Page[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = fs.readFileSync(path.join(this.pagesDir, file), 'utf-8');
        const data = JSON.parse(content);
        const properties = this.reconstructProperties(data.properties || {});
        const parentId = data.parentId ? PageId.create(data.parentId) : null;

        pages.push(
          Page.reconstitute(
            PageId.create(data.id),
            PageTitle.create(data.title),
            PageContent.create(data.content),
            properties,
            data.isDatabase || false,
            parentId,
            new Date(data.createdAt),
            new Date(data.updatedAt),
          ),
        );
      }
    }

    return pages;
  }

  async findRootPages(): Promise<Page[]> {
    const allPages = await this.findAll();
    return allPages.filter(page => page.isRootPage());
  }

  async findByParentId(parentId: PageId): Promise<Page[]> {
    const allPages = await this.findAll();
    return allPages.filter(page => {
      const pageParentId = page.getParentId();
      return pageParentId !== null && pageParentId.getValue() === parentId.getValue();
    });
  }

  async delete(id: PageId): Promise<void> {
    const filePath = this.getPageFilePath(id);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      // Git remove
      await git.remove({ fs, dir: this.gitDir, filepath: `pages/${id.getValue()}.json` });

      // Git commit
      await git.commit({
        fs,
        dir: this.gitDir,
        message: `Delete page: ${id.getValue()}`,
        author: {
          name: 'Colla System',
          email: 'system@colla.dev',
        },
      });
    }
  }

  async exists(id: PageId): Promise<boolean> {
    return fs.existsSync(this.getPageFilePath(id));
  }

  private getPageFilePath(id: PageId): string {
    return path.join(this.pagesDir, `${id.getValue()}.json`);
  }
}
