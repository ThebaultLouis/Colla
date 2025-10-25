# @colla/shared

Package contenant le **Domain Layer** de Colla suivant les principes de **Domain-Driven Design (DDD)**.

## 🎯 Responsabilité

Ce package contient la logique métier pure, indépendante de toute infrastructure :

- **Entities**: Objets avec identité (`Page`)
- **Value Objects**: Objets immuables (`PageId`, `PageTitle`, `PageContent`)
- **Repository Ports**: Interfaces pour la persistence (`PageRepository`)

## 🏗️ Architecture

```
src/
├── domain/
│   └── page/
│       ├── page.entity.ts          # Entity
│       ├── value-objects.ts        # Value Objects
│       ├── page.repository.ts      # Port (interface)
│       └── __tests__/              # Tests unitaires
└── index.ts                        # Public API
```

## 📦 Build

Le package doit être compilé TypeScript → JavaScript pour être utilisé par les autres packages.

### Build automatique

- ✅ **Après `npm install`** (root): Hook `postinstall` build automatiquement
- ✅ **Avant `npm run dev:server`**: Build automatique avant démarrage

### Build manuel

```bash
# Depuis la racine
npm run build:shared

# Ou depuis ce package
npm run build
```

## 🧪 Tests

```bash
# Depuis la racine
npm test -w @colla/shared

# Mode watch
npm run test:watch -w @colla/shared

# Avec coverage
npm test -- --coverage -w @colla/shared
```

**Coverage minimum**: 80%

## 📋 Règles

### ❌ Interdictions

- **Aucune dépendance externe** (sauf `uuid` pour les IDs)
- Pas d'import de `express`, `fs`, `isomorphic-git`, etc.
- Pas de logique d'infrastructure

### ✅ Bonnes pratiques

- Value Objects **immuables**
- Validation dans les constructeurs
- Factory methods statiques (`create()`)
- Tests unitaires complets

## 🔄 Quand rebuild ?

Vous devez rebuild `@colla/shared` quand vous modifiez :

- ✅ Entities
- ✅ Value Objects
- ✅ Repository interfaces
- ✅ Tout fichier TypeScript dans ce package

```bash
npm run build:shared
```

Le serveur ne verra pas vos changements tant que vous n'avez pas rebuild !

## 📚 Usage

```typescript
// Dans @colla/server
import { Page, PageId, PageTitle, PageContent, PageRepository } from '@colla/shared';

// Créer une page
const page = Page.create(
  PageId.create('uuid'),
  PageTitle.create('Mon titre'),
  PageContent.create('Mon contenu')
);
```

## 🎓 Concepts DDD appliqués

### Entity (Page)

- Identité unique (`PageId`)
- État mutable dans le temps
- Logique métier encapsulée

```typescript
const page = Page.create(id, title, content);
page.updateTitle(PageTitle.create('Nouveau titre')); // Modifie l'état
```

### Value Objects

- Pas d'identité, égalité par valeur
- Immuables
- Auto-validation

```typescript
const title1 = PageTitle.create('Test');
const title2 = PageTitle.create('Test');
title1.equals(title2); // true

// ❌ Impossible de modifier
title1.value = 'autre'; // Error: value is private
```

### Repository (Port)

- Interface définissant le contrat
- Implémentation dans Infrastructure Layer

```typescript
interface PageRepository {
  save(page: Page): Promise<void>;
  findById(id: PageId): Promise<Page | null>;
  // ...
}
```

---

**Ce package est le cœur métier de Colla. Gardez-le pur et bien testé !** ✨
