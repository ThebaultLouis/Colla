# Guide de Développement - Colla

## 🎯 Principes Fondamentaux

Ce projet suit la philosophie de Michael Azerad sur:
- **TDD** (Test-Driven Development)
- **DDD** (Domain-Driven Design)
- **Architecture Hexagonale** (Ports & Adapters)
- **SOLID Principles**

## 📝 Workflow de Développement

### 1. Red-Green-Refactor (TDD)

```bash
# 1. RED: Écrire un test qui échoue
npm run test:watch -w @colla/shared

# 2. GREEN: Écrire le code minimal pour passer le test
# 3. REFACTOR: Améliorer le code sans casser les tests
```

### 2. Ajouter une Nouvelle Feature

#### Exemple: Ajouter des tags aux pages

##### Étape 1: Domaine (DDD)

```typescript
// packages/shared/src/domain/page/value-objects.ts
export class Tag {
  private constructor(private readonly value: string) {
    if (!value || value.length > 50) {
      throw new Error('Invalid tag');
    }
  }

  static create(value: string): Tag {
    return new Tag(value.trim().toLowerCase());
  }

  getValue(): string {
    return this.value;
  }
}
```

##### Étape 2: Tests (TDD)

```typescript
// packages/shared/src/domain/page/__tests__/value-objects.test.ts
describe('Tag', () => {
  it('should create a valid tag', () => {
    const tag = Tag.create('typescript');
    expect(tag.getValue()).toBe('typescript');
  });

  it('should normalize tags', () => {
    const tag = Tag.create('  TypeScript  ');
    expect(tag.getValue()).toBe('typescript');
  });
});
```

##### Étape 3: Entity

```typescript
// packages/shared/src/domain/page/page.entity.ts
export class Page {
  private tags: Tag[] = [];

  addTag(tag: Tag): void {
    if (!this.tags.some(t => t.equals(tag))) {
      this.tags.push(tag);
      this.touch();
    }
  }

  removeTag(tag: Tag): void {
    this.tags = this.tags.filter(t => !t.equals(tag));
    this.touch();
  }

  getTags(): Tag[] {
    return [...this.tags]; // Defensive copy
  }
}
```

##### Étape 4: Service (Application)

```typescript
// packages/server/src/application/page.service.ts
async addTagToPage(pageId: string, tagValue: string): Promise<void> {
  const page = await this.pageRepository.findById(PageId.create(pageId));
  if (!page) throw new Error('Page not found');

  const tag = Tag.create(tagValue);
  page.addTag(tag);

  await this.pageRepository.save(page);
}
```

##### Étape 5: Controller (Adapter HTTP)

```typescript
// packages/server/src/presentation/controllers/page.controller.ts
this.router.post('/pages/:id/tags', this.addTag.bind(this));

private async addTag(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { tag } = req.body;

  await this.pageService.addTagToPage(id, tag);
  res.status(200).json({ message: 'Tag added' });
}
```

## 🏗️ Structure des Packages

### `@colla/shared` - Domain Layer

**Règles**:
- ❌ AUCUNE dépendance externe (sauf uuid pour les IDs)
- ✅ Tests unitaires obligatoires
- ✅ Immuabilité des Value Objects
- ✅ Encapsulation stricte

```typescript
// ✅ BON
export class PageTitle {
  private constructor(private readonly value: string) {}
  static create(value: string): PageTitle { ... }
  getValue(): string { return this.value; }
}

// ❌ MAUVAIS
export interface PageTitle {
  value: string;
}
```

### `@colla/server` - Application & Infrastructure

**Règles**:
- ✅ Dépend de `@colla/shared`
- ✅ Adapters implémentent les Ports du domaine
- ✅ Services orchestrent le domaine
- ✅ Controllers sont légers (validation + délégation)

```typescript
// ✅ BON: Service application
export class PageService {
  constructor(private readonly repo: PageRepository) {} // Port

  async createPage(title: string): Promise<Page> {
    const page = Page.create(PageId.create(uuid()), PageTitle.create(title));
    await this.repo.save(page);
    return page;
  }
}

// ❌ MAUVAIS: Logique métier dans le controller
this.router.post('/pages', (req, res) => {
  const page = { id: uuid(), title: req.body.title }; // Anemic model
  fs.writeFileSync(`${page.id}.json`, JSON.stringify(page)); // Couplage
});
```

## 🧪 Tests

### Tests Unitaires (Domain)

```bash
cd packages/shared
npm test -- --coverage
```

Coverage minimum: 80%

### Tests d'Intégration (Adapters)

```typescript
// packages/server/src/infrastructure/__tests__/git-page.repository.test.ts
describe('GitPageRepository', () => {
  let repo: GitPageRepository;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync('/tmp/colla-test-');
    repo = new GitPageRepository(tempDir);
  });

  it('should persist and retrieve a page', async () => {
    const page = Page.create(PageId.create('test'), PageTitle.create('Test'));
    await repo.save(page);

    const retrieved = await repo.findById(PageId.create('test'));
    expect(retrieved?.getTitle().getValue()).toBe('Test');
  });
});
```

## 🎨 Convention de Code

### Naming

- **Entities**: `Page`, `Database`, `Block`
- **Value Objects**: `PageId`, `PageTitle`, `Email`
- **Services**: `PageService`, `AuthService`
- **Repositories**: `PageRepository`, `UserRepository`
- **Controllers**: `PageController`, `AuthController`

### Fichiers

```
domain/
  page/
    page.entity.ts          # Entity
    value-objects.ts        # Value Objects
    page.repository.ts      # Port (interface)
    __tests__/
      page.entity.test.ts
      value-objects.test.ts
```

## 🚀 Commandes Utiles

```bash
# Installation
npm install

# Développement
npm run dev:server      # Backend sur :3000 (build shared auto)
npm run dev:web         # Frontend sur :5173
npm run dev:desktop     # Electron app

# Tests
npm test                # Tous les tests
npm test -w @colla/shared  # Tests du domaine
npm run test:watch -w @colla/shared

# Build
npm run build           # Build tout
npm run build:shared    # Build @colla/shared (après modifications du domaine)
npm run build -w @colla/server

# Lint
npm run lint            # Lint tout
npm run lint -w @colla/web

# Clean
npm run clean           # Supprime node_modules et dist
```

> **💡 Important**: 
> - Le script `dev:server` build automatiquement `@colla/shared` avant de démarrer
> - Le script `postinstall` build `@colla/shared` après `npm install`
> - Si vous modifiez le domaine, relancez `npm run build:shared`

## 📚 Ressources

### Architecture
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [DDD Tactical Patterns](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### TDD
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Growing Object-Oriented Software, Guided by Tests](http://www.growing-object-oriented-software.com/)

## ❓ FAQ

### Q: Pourquoi tant de fichiers pour une simple entité?

**R**: Séparation des responsabilités. Chaque fichier a un rôle précis:
- Value Objects: Validation et encapsulation
- Entity: Logique métier
- Repository: Abstraction de persistence
- Tests: Documentation et garantie de qualité

### Q: Pourquoi ne pas utiliser une base de données classique?

**R**: Git offre:
- Versioning natif
- Historique complet
- Synchronisation décentralisée
- Ownership des données

Pour un système de type Notion, c'est idéal.

### Q: Comment ajouter une nouvelle entité?

1. Créer les Value Objects + tests
2. Créer l'Entity + tests
3. Créer le Port (Repository interface)
4. Créer l'Adapter (implémentation)
5. Créer le Service application
6. Créer le Controller

Toujours dans cet ordre (domain-first).

---

**Happy Coding! 🚀**
