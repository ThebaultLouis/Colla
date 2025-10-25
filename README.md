# Colla 🚀

Un espace de travail collaboratif inspiré de Notion, utilisant **Git comme backend** pour le versioning et la synchronisation.

## 🎯 Vision

Colla est une application collaborative de type Notion qui stocke toutes les données dans un repository Git. Cette approche offre:

- ✅ Versioning natif de tout le contenu
- ✅ Collaboration via Git (push/pull/merge)
- ✅ Historique complet et traçabilité
- ✅ Décentralisation et ownership des données
- ✅ Backup et synchronisation via n'importe quel service Git

## 🏗️ Architecture

Le projet suit les principes de **Domain-Driven Design (DDD)**, **Test-Driven Development (TDD)** et **Architecture Hexagonale** (Ports & Adapters), inspirés de la philosophie de Michael Azerad.

### Structure du Monorepo

```
colla/
├── packages/
│   ├── shared/          # Domain layer (DDD)
│   │   ├── domain/
│   │   │   └── page/
│   │   │       ├── page.entity.ts       # Entity
│   │   │       ├── value-objects.ts     # Value Objects
│   │   │       └── page.repository.ts   # Port (interface)
│   │   └── __tests__/   # Tests unitaires (TDD)
│   │
│   ├── server/          # Backend API
│   │   ├── domain/           # Logique métier
│   │   ├── application/      # Use cases / Services
│   │   ├── infrastructure/   # Adapters (Git, DB, etc.)
│   │   └── presentation/     # Controllers HTTP
│   │
│   ├── web/             # Application web (React + Vite)
│   │   └── src/
│   │       ├── components/   # UI Components
│   │       └── api/          # API client
│   │
│   └── desktop/         # Application desktop (Electron)
│       └── src/
│           └── main.ts       # Electron main process
│
├── package.json         # Root workspace config
└── tsconfig.json        # TypeScript config partagée
```

### Couches de l'Architecture Hexagonale

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (HTTP Controllers, Web UI)           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Application Layer                │
│     (Use Cases, Services)               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Domain Layer                   │
│  (Entities, Value Objects, Ports)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Infrastructure Layer               │
│  (Git Repository, Database, External)   │
└─────────────────────────────────────────┘
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Cloner le repository
git clone https://github.com/ThebaultLouis/Colla.git
cd Colla

# Installer toutes les dépendances
npm install
# ✅ Le package @colla/shared est automatiquement buildé
```

> **💡 Note**: Le build de `@colla/shared` est automatique. Voir [BUILD_GUIDE.md](./BUILD_GUIDE.md) pour plus de détails.

### Développement

#### Lancer le serveur backend

```bash
npm run dev:server
# ✅ Build @colla/shared automatiquement
# 🚀 Server running on http://localhost:3000
```

#### Lancer l'application web

```bash
npm run dev:web
# Web app running on http://localhost:5173
```

#### Lancer l'application desktop

```bash
# Dans un terminal, lancer le serveur et le web
npm run dev:server
npm run dev:web

# Dans un autre terminal, lancer Electron
npm run dev:desktop
```

### Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch -w @colla/shared
```

### Build

```bash
# Build de tous les packages
npm run build

# Build spécifique
npm run build -w @colla/server
npm run build -w @colla/web
npm run build -w @colla/desktop
```

## 📦 Packages

### `@colla/shared`

Contient le **domaine métier** (DDD) partagé entre tous les packages:

- **Entities**: `Page`
- **Value Objects**: `PageId`, `PageTitle`, `PageContent`
- **Ports**: `PageRepository` (interface)
- **Tests**: Tests unitaires complets (TDD)

### `@colla/server`

Backend API avec architecture hexagonale:

- **Application**: `PageService` (use cases)
- **Infrastructure**: `GitPageRepository` (adapter Git)
- **Presentation**: `PageController` (REST API)
- **Stack**: Express, TypeScript, isomorphic-git

#### API Endpoints

```
GET    /api/pages          # Liste toutes les pages
GET    /api/pages/:id      # Récupère une page
POST   /api/pages          # Crée une nouvelle page
PUT    /api/pages/:id      # Met à jour une page
DELETE /api/pages/:id      # Supprime une page
GET    /health             # Health check
```

### `@colla/web`

Application web React:

- **Framework**: React 18 + Vite
- **Routing**: React Router
- **UI**: Éditeur de pages, liste de pages
- **API Client**: Fetch API

### `@colla/desktop`

Application desktop Electron:

- Wrapper Electron autour de l'app web
- Packaging pour Windows, macOS, Linux

## 🧪 Approche TDD

Le projet suit le **Test-Driven Development**:

1. ✅ Tests unitaires pour le domaine (`packages/shared/__tests__`)
2. ✅ Tests des value objects et entities
3. ✅ Coverage minimum: 80%

```bash
cd packages/shared
npm test -- --coverage
```

## 🎨 Principes DDD Appliqués

### Entities
- `Page`: Identité unique, état mutable dans le temps

### Value Objects
- `PageId`, `PageTitle`, `PageContent`: Immuables, égalité par valeur

### Repositories (Ports)
- `PageRepository`: Interface définissant le contrat de persistence

### Adapters
- `GitPageRepository`: Implémentation utilisant Git comme storage

### Services (Application Layer)
- `PageService`: Orchestre les use cases métier

## 🔄 Stockage Git

Toutes les pages sont stockées dans un repository Git local (`.colla-data/git-repo`):

```
.colla-data/git-repo/
└── pages/
    ├── page-uuid-1.json
    ├── page-uuid-2.json
    └── page-uuid-3.json
```

Chaque modification crée un commit Git, permettant:
- Historique complet des modifications
- Rollback vers n'importe quelle version
- Synchronisation future via push/pull Git

## 🛠️ Technologies

### Backend
- **TypeScript**: Type safety
- **Express**: API REST
- **isomorphic-git**: Git operations in Node.js

### Frontend Web
- **React 18**: UI library
- **Vite**: Build tool
- **React Router**: Routing

### Desktop
- **Electron**: Cross-platform desktop apps

### Testing
- **Jest**: Test framework
- **ts-jest**: TypeScript support

### Quality
- **ESLint**: Linting
- **Prettier**: Code formatting
- **TypeScript**: Static typing

## 📝 Prochaines Étapes

### Features
- [ ] Système de base de données (tables, vues)
- [ ] Blocs de contenu riches (images, embeds, etc.)
- [ ] Synchronisation Git distante (GitHub, GitLab)
- [ ] Collaboration temps réel
- [ ] Permissions et partage
- [ ] Import/Export (Markdown, PDF)

### Architecture
- [ ] Tests d'intégration
- [ ] Tests E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Docker compose
- [ ] GraphQL API (alternative à REST)

### Performance
- [ ] Optimistic UI updates
- [ ] Virtual scrolling pour grandes listes
- [ ] Service Worker pour offline
- [ ] IndexedDB cache

## 🤝 Contribution

Le projet suit les principes de:

- **Clean Architecture**: Séparation des responsabilités
- **SOLID**: Principes de conception orientée objet
- **TDD**: Tests avant le code
- **DDD**: Modélisation du domaine métier

### Guidelines

1. Écrire les tests d'abord
2. Respecter l'architecture hexagonale
3. Maintenir la séparation domaine/infrastructure
4. Documenter les décisions architecturales

## 📄 License

MIT

---

**Built with ❤️ following DDD, TDD, and Hexagonal Architecture principles**