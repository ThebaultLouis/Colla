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
    const pageDir = this.getPageDirectory(page);
    const metadataPath = path.join(pageDir, 'metadata.json');
    const contentPath = path.join(pageDir, 'content.md');

    // Créer le dossier de la page
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    // Séparer le contenu de la métadonnée
    const { content, ...metadata } = pageData;

    // Sauvegarder les métadonnées (sans le contenu)
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Sauvegarder le contenu dans un fichier Markdown séparé
    fs.writeFileSync(contentPath, content || '');

    // Git add
    const pageRelativePath = this.getPageRelativePath(page);
    await git.add({ fs, dir: this.gitDir, filepath: `${pageRelativePath}/metadata.json` });
    await git.add({ fs, dir: this.gitDir, filepath: `${pageRelativePath}/content.md` });

    // Git commit
    await git.commit({
      fs,
      dir: this.gitDir,
      message: `Update page: ${pageData.title || pageData.id}`,
      author: {
        name: 'Colla System',
        email: 'system@colla.dev',
      },
    });
  }

  async findById(id: PageId): Promise<Page | null> {
    // Essayer de trouver le dossier de la page (avec préfixe titre ou sans)
    const pageFolder = this.findPageFolder(id.getValue());

    if (pageFolder) {
      const metadataPath = path.join(pageFolder, 'metadata.json');
      const contentPath = path.join(pageFolder, 'content.md');

      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        const content = fs.existsSync(contentPath) ? fs.readFileSync(contentPath, 'utf-8') : '';

        // Combiner metadata et content
        const data = { ...metadata, content };

        return this.reconstructPageFromFullData(data);
      }
    }

    // Fallback : ancienne structure (fichier JSON unique)
    const oldFilePath = this.getPageFilePath(id);
    if (!fs.existsSync(oldFilePath)) {
      return null;
    }

    const content = fs.readFileSync(oldFilePath, 'utf-8');
    const data = JSON.parse(content);

    return this.reconstructPageFromFullData(data);
  }

  /**
   * Reconstruire une page complète depuis les données JSON
   */
  private reconstructPageFromFullData(data: any): Page {

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

    // Déterminer le type d'objet (page ou database)
    let objectType: 'page' | 'database' = 'page';
    if (data.object === 'database' || data.isDatabase === true) {
      objectType = 'database';
    }

    return Page.reconstitute(
      objectType,
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
      data.order || 0, // order field
    );
  }

  async findAll(): Promise<Page[]> {
    if (!fs.existsSync(this.pagesDir)) {
      return [];
    }

    const pagesMap = new Map<string, Page>(); // Utiliser une Map pour dédupliquer par ID

    // Fonction récursive pour parcourir tous les dossiers
    const scanDirectory = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Vérifier si ce dossier contient une page (metadata.json)
          const metadataPath = path.join(fullPath, 'metadata.json');
          const contentPath = path.join(fullPath, 'content.md');

          if (fs.existsSync(metadataPath)) {
            try {
              const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
              const content = fs.existsSync(contentPath) ? fs.readFileSync(contentPath, 'utf-8') : '';

              const data = { ...metadata, content };
              const page = this.reconstructPageFromFullData(data);

              // Ajouter à la Map (écrase l'ancienne version si elle existe)
              pagesMap.set(page.getId().getValue(), page);
            } catch (error) {
              console.error(`Error loading page from ${metadataPath}:`, error);
            }
          }

          // Continuer à scanner les sous-dossiers (pages enfants)
          scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          // Ancienne structure : fichiers JSON directs
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const data = JSON.parse(content);
            const page = this.reconstructPageFromFullData(data);
            const pageId = page.getId().getValue();

            // N'ajouter que si la page n'existe pas déjà dans le nouveau format
            if (!pagesMap.has(pageId)) {
              pagesMap.set(pageId, page);
            }
          } catch (error) {
            console.error(`Error loading page from ${fullPath}:`, error);
          }
        }
      }
    };

    scanDirectory(this.pagesDir);
    return Array.from(pagesMap.values());
  }

  async findRootPages(): Promise<Page[]> {
    const allPages = await this.findAll();
    const rootPages = allPages.filter(page => page.isRootPage());
    // Trier par ordre
    return rootPages.sort((a, b) => a.getOrder() - b.getOrder());
  }

  async findByParentId(parentId: PageId): Promise<Page[]> {
    const allPages = await this.findAll();
    const children = allPages.filter(page => {
      const pageParentId = page.getParentId();
      return pageParentId !== null && pageParentId.getValue() === parentId.getValue();
    });
    // Trier par ordre
    return children.sort((a, b) => a.getOrder() - b.getOrder());
  }

  async delete(id: PageId): Promise<void> {
    await this.ensureGitInitialized();

    // Essayer d'abord de trouver le dossier (nouvelle structure avec préfixe)
    const pageFolder = this.findPageFolder(id.getValue());

    if (pageFolder && fs.existsSync(pageFolder) && fs.statSync(pageFolder).isDirectory()) {
      // Obtenir le chemin relatif pour git
      const relativePath = path.relative(this.gitDir, pageFolder);

      // Supprimer récursivement le dossier et son contenu
      fs.rmSync(pageFolder, { recursive: true, force: true });

      // Git remove
      await git.remove({ fs, dir: this.gitDir, filepath: relativePath });

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
      return;
    }

    // Fallback : ancienne structure (fichier JSON)
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
    // Chercher le dossier ou le fichier
    const pageFolder = this.findPageFolder(id.getValue());
    if (pageFolder && fs.existsSync(pageFolder)) {
      return true;
    }
    return fs.existsSync(this.getPageFilePath(id));
  }

  private getPageFilePath(id: PageId): string {
    return path.join(this.pagesDir, `${id.getValue()}.json`);
  }

  /**
   * Obtenir le chemin relatif d'une page par rapport au dossier pages/
   * Construit l'arborescence parent/enfant
   */
  private getPageRelativePath(page: Page): string {
    const pathParts: string[] = [];
    let currentPage: Page | null = page;
    const visited = new Set<string>();

    // Remonter la hiérarchie des parents
    while (currentPage) {
      const pageId = currentPage.getId().getValue();

      // Éviter les boucles infinies
      if (visited.has(pageId)) {
        console.warn(`Circular reference detected for page ${pageId}`);
        break;
      }
      visited.add(pageId);

      // Utiliser le nom slugifié au lieu de juste l'ID
      const folderName = this.getPageFolderName(currentPage);
      pathParts.unshift(folderName);

      // Récupérer le parent
      const parent = currentPage.getParent();
      const parentData = parent.getValue();

      if (parent.isPage() && 'page_id' in parentData) {
        try {
          // Charger la page parent de manière synchrone
          const parentId = PageId.create(parentData.page_id);

          // Chercher le dossier parent (peut avoir n'importe quel préfixe)
          const parentFolder = this.findPageFolder(parentId.getValue());

          if (parentFolder) {
            const parentMetadataPath = path.join(parentFolder, 'metadata.json');
            const parentMetadata = JSON.parse(fs.readFileSync(parentMetadataPath, 'utf-8'));
            currentPage = this.reconstructPageFromData(parentMetadata, parentId.getValue());
          } else {
            // Si le parent n'existe pas encore, arrêter
            break;
          }
        } catch (error) {
          console.error(`Error loading parent page:`, error);
          break;
        }
      } else {
        // Parent est workspace ou database, arrêter
        break;
      }
    }

    return path.join('pages', ...pathParts);
  }

  /**
   * Obtenir le chemin absolu du dossier d'une page
   */
  private getPageDirectory(page: Page): string {
    return path.join(this.gitDir, this.getPageRelativePath(page));
  }

  /**
   * Slugifier un titre pour l'utiliser dans un nom de dossier (style Notion)
   * Ex: "Mon Titre!" -> "Mon-Titre"
   */
  private slugifyTitle(title: string): string {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Retirer les caractères spéciaux
      .replace(/\s+/g, '-')      // Remplacer les espaces par des tirets
      .replace(/-+/g, '-')       // Éviter les tirets multiples
      .substring(0, 50);         // Limiter la longueur
  }

  /**
   * Trouver le dossier d'une page par son ID (cherche récursivement)
   * Retourne le chemin absolu du dossier ou null
   */
  private findPageFolder(pageId: string): string | null {
    const searchInDir = (dir: string): string | null => {
      if (!fs.existsSync(dir)) {
        return null;
      }

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dir, entry.name);

          // Vérifier si le nom du dossier se termine par l'ID de la page
          if (entry.name === pageId || entry.name.endsWith(`-${pageId}`)) {
            // Vérifier que c'est bien un dossier de page (contient metadata.json)
            if (fs.existsSync(path.join(fullPath, 'metadata.json'))) {
              return fullPath;
            }
          }

          // Chercher récursivement dans les sous-dossiers
          const found = searchInDir(fullPath);
          if (found) {
            return found;
          }
        }
      }

      return null;
    };

    return searchInDir(this.pagesDir);
  }

  /**
   * Obtenir le nom du dossier d'une page (titre-id)
   * Ex: "Mon-Titre-abc123"
   */
  private getPageFolderName(page: Page): string {
    const pageId = page.getId().getValue();
    const titleValue = page.getTitle().getValue();

    console.log(`🗂️  getPageFolderName for page ${pageId}:`, {
      titleValue,
      titleLength: titleValue.length,
    });

    if (titleValue && titleValue.trim().length > 0) {
      const slug = this.slugifyTitle(titleValue);
      console.log(`🔖 Slugified title: "${slug}"`);
      if (slug.length > 0) {
        const folderName = `${slug}-${pageId}`;
        console.log(`📁 Final folder name: ${folderName}`);
        return folderName;
      }
    }

    // Fallback : juste l'ID si pas de titre ou slug vide
    console.log(`⚠️  Using ID only for folder name`);
    return pageId;
  }

  /**
   * Reconstruire une page depuis les données JSON (helper pour getPageRelativePath)
   */
  private reconstructPageFromData(data: any, pageId: string): Page {
    // Version simplifiée pour la navigation dans la hiérarchie
    let properties: Map<string, PropertyValueObject> = new Map();
    if (data.properties && typeof data.properties === 'object') {
      const firstProp = Object.values(data.properties)[0] as any;
      if (firstProp && firstProp.type) {
        properties = this.reconstructPropertyValues(data.properties);
      } else if (data.title) {
        properties.set('Title', TitleProperty.fromPlainText('title', data.title));
      }
    }

    const parent = data.parent ? Parent.reconstitute(data.parent) : Parent.workspace();
    const objectType: 'page' | 'database' = data.object === 'database' ? 'database' : 'page';

    return Page.reconstitute(
      objectType,
      PageId.create(pageId),
      new Date(data.created_time || Date.now()),
      new Date(data.last_edited_time || Date.now()),
      User.empty(),
      User.empty(),
      Cover.empty(),
      Icon.empty(),
      parent,
      data.archived || false,
      data.in_trash || false,
      properties,
      data.url || null,
      data.public_url || null,
      new Map(),
      PageContent.create(''),
      data.order || 0,
    );
  }
}
