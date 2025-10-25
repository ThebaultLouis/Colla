import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as path from 'path';
import {
  Page,
  PageId,
  PageRepository,
  PageContent,
  Property,
  PropertyValueObject,
  TitleProperty,
  RichTextProperty,
  NumberProperty,
  SelectProperty,
  StatusProperty,
  DateProperty,
  CheckboxProperty,
  UrlProperty,
  EmailProperty,
  MultiSelectProperty,
  Icon,
  Cover,
  User,
  Parent,
} from '@colla/shared';

/**
 * GitPageRepository - Adapter (Architecture Hexagonale)
 * Implémentation du port PageRepository utilisant Git comme storage
 */
export class GitPageRepository implements PageRepository {
  private readonly pagesDir: string;
  private gitInitialized: boolean = false;

  constructor(private readonly gitDir: string) {
    this.pagesDir = path.join(gitDir, 'pages');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.gitDir)) {
      fs.mkdirSync(this.gitDir, { recursive: true });
    }
    if (!fs.existsSync(this.pagesDir)) {
      fs.mkdirSync(this.pagesDir, { recursive: true });
    }
  }

  private async ensureGitInitialized(): Promise<void> {
    if (this.gitInitialized) {
      return;
    }

    const gitDirPath = path.join(this.gitDir, '.git');
    if (!fs.existsSync(gitDirPath)) {
      await git.init({ fs, dir: this.gitDir, defaultBranch: 'main' });
    }

    this.gitInitialized = true;
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

  private reconstructPropertyValues(propertiesData: Record<string, any>): Map<string, PropertyValueObject> {
    const properties = new Map<string, PropertyValueObject>();

    if (!propertiesData) {
      return properties;
    }

    for (const [propertyName, propData] of Object.entries(propertiesData)) {
      try {
        if (!propData || !propData.type) {
          continue;
        }

        let propertyValue: PropertyValueObject;

        switch (propData.type) {
          case 'title':
            propertyValue = TitleProperty.reconstitute(propData);
            break;
          case 'rich_text':
            propertyValue = RichTextProperty.reconstitute(propData);
            break;
          case 'number':
            propertyValue = NumberProperty.reconstitute(propData);
            break;
          case 'select':
            propertyValue = SelectProperty.reconstitute(propData);
            break;
          case 'status':
            propertyValue = StatusProperty.reconstitute(propData);
            break;
          case 'date':
            propertyValue = DateProperty.reconstitute(propData);
            break;
          case 'checkbox':
            propertyValue = CheckboxProperty.reconstitute(propData);
            break;
          case 'url':
            propertyValue = UrlProperty.reconstitute(propData);
            break;
          case 'email':
            propertyValue = EmailProperty.reconstitute(propData);
            break;
          case 'multi_select':
            propertyValue = MultiSelectProperty.reconstitute(propData);
            break;
          default:
            console.warn(`Unknown property type: ${propData.type} for property ${propertyName}`);
            continue;
        }

        properties.set(propertyName, propertyValue);
      } catch (error) {
        console.error(`Failed to reconstruct property ${propertyName}:`, error);
      }
    }

    return properties;
  }

  async save(page: Page): Promise<void> {
    await this.ensureGitInitialized();

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

    // Reconstruire les propriétés (nouveau format Notion ou ancien format legacy)
    let properties: Map<string, PropertyValueObject>;
    let legacyProperties: Map<string, Property>;

    if (data.properties && typeof data.properties === 'object') {
      // Vérifier si c'est le nouveau format (avec type)
      const firstProp = Object.values(data.properties)[0] as any;
      if (firstProp && firstProp.type) {
        // Nouveau format Notion
        properties = this.reconstructPropertyValues(data.properties);
        legacyProperties = new Map();
      } else {
        // Ancien format legacy
        legacyProperties = this.reconstructProperties(data.properties);
        properties = new Map();
        // Créer une TitleProperty depuis l'ancien titre
        if (data.title) {
          properties.set('Title', TitleProperty.fromPlainText('title', data.title));
        }
      }
    } else {
      properties = new Map();
      legacyProperties = new Map();
      // Créer une TitleProperty depuis l'ancien titre
      if (data.title) {
        properties.set('Title', TitleProperty.fromPlainText('title', data.title));
      }
    }

    // Reconstituer icon et cover depuis Notion format
    const icon = data.icon ? Icon.reconstitute(data.icon) : Icon.empty();
    const cover = data.cover ? Cover.reconstitute(data.cover) : Cover.empty();

    // Reconstituer user (created_by, last_edited_by)
    const created_by = data.created_by ? User.reconstitute(data.created_by) : User.empty();
    const last_edited_by = data.last_edited_by ? User.reconstitute(data.last_edited_by) : User.empty();

    // Reconstituer parent (nouveau format Notion ou ancien format legacy)
    let parent: Parent;
    if (data.parent) {
      parent = Parent.reconstitute(data.parent);
    } else if (data.parentId) {
      // Legacy support: si on a un parentId (ancien format), créer un parent data_source
      parent = Parent.dataSource(data.parentId);
    } else {
      parent = Parent.workspace();
    }

    return Page.reconstitute(
      PageId.create(data.id),
      new Date(data.created_time || data.createdAt || Date.now()),
      new Date(data.last_edited_time || data.updatedAt || Date.now()),
      created_by,
      last_edited_by,
      cover,
      icon,
      parent,
      data.archived || false,
      data.in_trash || data.inTrash || false,
      properties,
      data.url || null,
      data.public_url || null,
      // Legacy fields
      legacyProperties,
      PageContent.create(data.content || ''),
      data.isDatabase || false,
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

        // Reconstruire les propriétés (nouveau format Notion ou ancien format legacy)
        let properties: Map<string, PropertyValueObject>;
        let legacyProperties: Map<string, Property>;

        if (data.properties && typeof data.properties === 'object') {
          const firstProp = Object.values(data.properties)[0] as any;
          if (firstProp && firstProp.type) {
            // Nouveau format Notion
            properties = this.reconstructPropertyValues(data.properties);
            legacyProperties = new Map();
          } else {
            // Ancien format legacy
            legacyProperties = this.reconstructProperties(data.properties);
            properties = new Map();
            if (data.title) {
              properties.set('Title', TitleProperty.fromPlainText('title', data.title));
            }
          }
        } else {
          properties = new Map();
          legacyProperties = new Map();
          if (data.title) {
            properties.set('Title', TitleProperty.fromPlainText('title', data.title));
          }
        }

        const icon = data.icon ? Icon.reconstitute(data.icon) : Icon.empty();
        const cover = data.cover ? Cover.reconstitute(data.cover) : Cover.empty();

        // Reconstituer user (created_by, last_edited_by)
        const created_by = data.created_by ? User.reconstitute(data.created_by) : User.empty();
        const last_edited_by = data.last_edited_by ? User.reconstitute(data.last_edited_by) : User.empty();

        // Reconstituer parent (nouveau format Notion ou ancien format legacy)
        let parent: Parent;
        if (data.parent) {
          parent = Parent.reconstitute(data.parent);
        } else if (data.parentId) {
          parent = Parent.dataSource(data.parentId);
        } else {
          parent = Parent.workspace();
        }

        pages.push(
          Page.reconstitute(
            PageId.create(data.id),
            new Date(data.created_time || data.createdAt || Date.now()),
            new Date(data.last_edited_time || data.updatedAt || Date.now()),
            created_by,
            last_edited_by,
            cover,
            icon,
            parent,
            data.archived || false,
            data.in_trash || data.inTrash || false,
            properties,
            data.url || null,
            data.public_url || null,
            // Legacy fields
            legacyProperties,
            PageContent.create(data.content || ''),
            data.isDatabase || false,
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
    await this.ensureGitInitialized();

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
