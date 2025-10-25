# Contributing to Colla

Merci de votre intérêt pour contribuer à Colla ! Ce document vous guide à travers notre processus de contribution.

## 🎯 Philosophie du Projet

Colla suit rigoureusement les principes de:

- **TDD** (Test-Driven Development): Tests avant le code
- **DDD** (Domain-Driven Design): Modélisation du domaine métier
- **Architecture Hexagonale**: Séparation domaine/infrastructure
- **SOLID**: Principes de conception orientée objet
- **Clean Code**: Code lisible et maintenable

## 🚀 Pour Commencer

### 1. Fork et Clone

```bash
# Fork le projet sur GitHub
# Puis clone ton fork
git clone https://github.com/TON-USERNAME/Colla.git
cd Colla

# Ajoute le remote upstream
git remote add upstream https://github.com/ThebaultLouis/Colla.git
```

### 2. Installation

```bash
npm install
npm test  # Vérifie que tous les tests passent
```

### 3. Créer une branche

```bash
git checkout -b feature/ma-super-feature
# ou
git checkout -b fix/correction-bug
```

## 📝 Workflow de Contribution

### Étape 1: Créer une Issue

Avant de coder, crée une issue pour discuter de ta proposition:

- **Feature**: Décris la fonctionnalité, son utilité, comment elle s'intègre
- **Bug**: Décris le bug, comment le reproduire, comportement attendu
- **Refactoring**: Explique pourquoi et quel impact

### Étape 2: TDD - Red-Green-Refactor

#### RED: Écrire le test qui échoue

```typescript
// packages/shared/src/domain/page/__tests__/page.entity.test.ts
describe('Page', () => {
  it('should support markdown content', () => {
    const page = Page.create(
      PageId.create('test'),
      PageTitle.create('Test'),
      PageContent.create('# Markdown')
    );
    
    expect(page.getContent().isMarkdown()).toBe(true);
  });
});
```

Lancer le test:
```bash
npm run test:watch -w @colla/shared
```

❌ Le test échoue (RED) → C'est bon signe!

#### GREEN: Écrire le code minimal

```typescript
// packages/shared/src/domain/page/value-objects.ts
export class PageContent {
  // ... existing code ...
  
  isMarkdown(): boolean {
    return this.value.trimStart().startsWith('#');
  }
}
```

✅ Le test passe (GREEN) → Excellent!

#### REFACTOR: Améliorer le code

```typescript
export class PageContent {
  private static readonly MARKDOWN_INDICATORS = ['#', '-', '*', '```'];
  
  isMarkdown(): boolean {
    const trimmed = this.value.trimStart();
    return PageContent.MARKDOWN_INDICATORS.some(
      indicator => trimmed.startsWith(indicator)
    );
  }
}
```

✅ Les tests passent toujours → Parfait!

### Étape 3: Respecter l'Architecture

#### Pour une nouvelle feature

1. **Domain First** (packages/shared)
   - Créer les Value Objects
   - Créer l'Entity
   - Créer le Port (Repository interface)
   - ✅ Tests unitaires

2. **Application Layer** (packages/server)
   - Créer le Service (use case)
   - ✅ Tests du service

3. **Infrastructure** (packages/server)
   - Créer l'Adapter (implémentation du Port)
   - ✅ Tests d'intégration

4. **Presentation** (packages/server + web)
   - Créer le Controller (API)
   - Créer l'UI (React)
   - ✅ Tests E2E (futur)

#### Exemple: Ajouter des Tags aux Pages

```typescript
// 1. DOMAIN - Value Object
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
  
  equals(other: Tag): boolean {
    return this.value === other.value;
  }
}

// 2. DOMAIN - Update Entity
// packages/shared/src/domain/page/page.entity.ts
export class Page {
  private tags: Set<Tag> = new Set();
  
  addTag(tag: Tag): void {
    this.tags.add(tag);
    this.touch();
  }
  
  getTags(): Tag[] {
    return Array.from(this.tags);
  }
}

// 3. APPLICATION - Service
// packages/server/src/application/page.service.ts
async addTagToPage(pageId: string, tagValue: string): Promise<void> {
  const page = await this.pageRepository.findById(PageId.create(pageId));
  if (!page) throw new Error('Page not found');
  
  page.addTag(Tag.create(tagValue));
  await this.pageRepository.save(page);
}

// 4. PRESENTATION - Controller
// packages/server/src/presentation/controllers/page.controller.ts
private async addTag(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { tag } = req.body;
  
  await this.pageService.addTagToPage(id, tag);
  res.status(200).json({ message: 'Tag added' });
}
```

## ✅ Checklist avant Pull Request

### Code Quality

- [ ] Tous les tests passent (`npm test`)
- [ ] Pas d'erreurs ESLint (`npm run lint`)
- [ ] Code formaté avec Prettier
- [ ] Coverage >= 80% pour le domaine
- [ ] TypeScript strict mode respecté

### Architecture

- [ ] Domain layer sans dépendances externes
- [ ] Tests écrits AVANT le code (TDD)
- [ ] Architecture hexagonale respectée
- [ ] Principes DDD appliqués (Entities, VOs, etc.)
- [ ] Ports & Adapters séparés

### Documentation

- [ ] Commentaires JSDoc pour les APIs publiques
- [ ] README.md mis à jour si nécessaire
- [ ] CHANGELOG.md mis à jour
- [ ] Tests documentent le comportement

### Git

- [ ] Commits atomiques et descriptifs
- [ ] Messages de commit clairs
- [ ] Branche à jour avec main (`git rebase upstream/main`)
- [ ] Pas de merge commits (utiliser rebase)

## 📏 Standards de Code

### Naming Conventions

```typescript
// Entities: PascalCase, nom singulier
class Page { }
class Database { }

// Value Objects: PascalCase, descriptif
class PageId { }
class EmailAddress { }

// Services: PascalCase, suffixe "Service"
class PageService { }
class AuthService { }

// Repositories: PascalCase, suffixe "Repository"
interface PageRepository { }
class GitPageRepository implements PageRepository { }

// Functions: camelCase, verbe
function createPage() { }
async function savePage() { }

// Constants: UPPER_SNAKE_CASE
const MAX_TITLE_LENGTH = 255;
const API_BASE_URL = '/api';
```

### File Organization

```
domain/
  page/
    page.entity.ts           # One entity per file
    value-objects.ts         # Related VOs together
    page.repository.ts       # Port (interface)
    __tests__/
      page.entity.test.ts    # Tests mirror source structure
      value-objects.test.ts
```

### TypeScript

```typescript
// ✅ BON: Explicit types, immutability
export class PageTitle {
  private constructor(private readonly value: string) { }
  
  static create(value: string): PageTitle {
    return new PageTitle(value);
  }
  
  getValue(): string {
    return this.value;
  }
}

// ❌ MAUVAIS: Mutable, any, public fields
export class PageTitle {
  public value: any;
  
  constructor(value: any) {
    this.value = value;
  }
}
```

## 🧪 Tests

### Structure des Tests

```typescript
describe('EntityOrVO', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = ...;
      
      // Assert
      expect(result).toBe(...);
    });
    
    it('should throw when invalid', () => {
      expect(() => ...).toThrow('Error message');
    });
  });
});
```

### Coverage

```bash
# Vérifier le coverage
npm test -- --coverage -w @colla/shared

# Objectifs:
# - Branches: >= 80%
# - Functions: >= 80%
# - Lines: >= 80%
# - Statements: >= 80%
```

## 🔍 Review Process

1. **Self-Review**: Relis ton code avant de soumettre
2. **CI Checks**: Tous les checks doivent passer
3. **Code Review**: Au moins 1 approbation requise
4. **Merge**: Squash and merge (commits atomiques)

## 📦 Types de Contributions

### 🐛 Bug Fixes

1. Créer une issue avec reproduction
2. Écrire un test qui reproduit le bug
3. Corriger le bug
4. Le test passe ✅

### ✨ Nouvelles Features

1. Discuter dans une issue
2. Suivre le workflow TDD
3. Respecter l'architecture
4. Documenter

### 📚 Documentation

- Toujours bienvenue!
- Clarté et exemples
- Fautes de typo, explications

### 🎨 Refactoring

- Expliquer le "pourquoi"
- Tests passent avant/après
- Amélioration mesurable

## ❓ Questions

- **Architecture**: Lire ARCHITECTURE.md et DIAGRAMS.md
- **Développement**: Lire DEVELOPMENT.md
- **Issues**: Créer une issue GitHub
- **Discussion**: GitHub Discussions

## 📜 Code of Conduct

- Respectueux et bienveillant
- Constructif dans les reviews
- Ouvert aux feedbacks
- Pédagogue avec les débutants

## 🙏 Merci!

Chaque contribution compte, qu'elle soit grande ou petite. Merci de faire partie de Colla!

---

**Happy Contributing! 🚀**
