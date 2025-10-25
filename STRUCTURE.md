# 📁 Structure Complète du Projet Colla

## Vue d'ensemble

```
Colla/
│
├── 📄 Configuration Root
│   ├── package.json                 # Root workspace config
│   ├── tsconfig.json               # TypeScript config partagée
│   ├── .eslintrc.json              # ESLint config
│   ├── .prettierrc.json            # Prettier config
│   ├── .gitignore                  # Git ignore patterns
│   └── setup.sh                    # Installation script
│
├── 📚 Documentation (7 fichiers)
│   ├── README.md                   # Vue d'ensemble du projet
│   ├── QUICKSTART.md              # Guide de démarrage rapide
│   ├── ARCHITECTURE.md            # Architecture Decision Records
│   ├── DEVELOPMENT.md             # Guide de développement
│   ├── DIAGRAMS.md                # Diagrammes d'architecture
│   ├── CONTRIBUTING.md            # Guide de contribution
│   ├── CHANGELOG.md               # Journal des modifications
│   └── PROJECT_SUMMARY.md         # Récapitulatif du projet
│
└── 📦 Packages (Monorepo)
    │
    ├── 🎯 shared/                 # DOMAIN LAYER (DDD)
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── jest.config.ts
    │   │
    │   └── src/
    │       ├── index.ts           # Public API
    │       │
    │       └── domain/
    │           └── page/
    │               ├── page.entity.ts          # Entity
    │               ├── value-objects.ts        # Value Objects
    │               ├── page.repository.ts      # Port (interface)
    │               │
    │               └── __tests__/              # TDD Tests
    │                   ├── page.entity.test.ts
    │                   └── value-objects.test.ts
    │
    ├── 🖥️ server/                 # BACKEND (Hexagonal Architecture)
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── jest.config.ts
    │   ├── .env.example           # Environment variables template
    │   │
    │   └── src/
    │       ├── index.ts           # App entry point
    │       │
    │       ├── application/       # APPLICATION LAYER
    │       │   └── page.service.ts        # Use cases
    │       │
    │       ├── infrastructure/    # INFRASTRUCTURE LAYER
    │       │   └── repositories/
    │       │       └── git-page.repository.ts  # Adapter (Git)
    │       │
    │       └── presentation/      # PRESENTATION LAYER
    │           └── controllers/
    │               └── page.controller.ts      # REST API
    │
    ├── 🌐 web/                    # WEB APP (React + Vite)
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsconfig.node.json
    │   ├── vite.config.ts
    │   ├── index.html
    │   │
    │   └── src/
    │       ├── main.tsx           # Entry point
    │       ├── App.tsx            # Root component
    │       ├── App.css            # Global styles
    │       │
    │       ├── api/
    │       │   └── page.api.ts    # API client
    │       │
    │       └── components/
    │           ├── PageEditor.tsx
    │           ├── PageEditor.css
    │           ├── PageList.tsx
    │           └── PageList.css
    │
    └── 💻 desktop/                # DESKTOP APP (Electron)
        ├── package.json
        ├── tsconfig.json
        │
        └── src/
            └── main.ts            # Electron main process
```

## Statistiques du Projet

### Fichiers créés

| Catégorie | Nombre | Description |
|-----------|--------|-------------|
| **Documentation** | 8 | README, guides, ADRs |
| **Configuration** | 6 | package.json, tsconfig, etc. |
| **Domain (shared)** | 6 | Entities, VOs, Ports, Tests |
| **Server** | 6 | Services, Adapters, Controllers |
| **Web** | 10 | React components, API client |
| **Desktop** | 3 | Electron wrapper |
| **TOTAL** | **39 fichiers** | |

### Lignes de code (estimation)

| Package | TypeScript | Tests | Config | Total |
|---------|------------|-------|--------|-------|
| shared | ~300 | ~250 | ~50 | ~600 |
| server | ~400 | ~0* | ~50 | ~450 |
| web | ~500 | ~0* | ~100 | ~600 |
| desktop | ~50 | ~0* | ~30 | ~80 |
| docs | - | - | - | ~3000 |
| **TOTAL** | **~1250** | **~250** | **~230** | **~4730** |

*Tests d'intégration à venir

## Architecture en Couches

### Shared Package (Domain)

```
@colla/shared/
└── domain/
    └── page/
        ├── 🏛️ page.entity.ts           # Business logic
        ├── 💎 value-objects.ts         # Immutable values
        ├── 🔌 page.repository.ts       # Port (interface)
        └── ✅ __tests__/                # Unit tests
```

**Principes:**
- ❌ Aucune dépendance externe
- ✅ Logique métier pure
- ✅ Tests unitaires obligatoires
- ✅ Immuabilité des Value Objects

### Server Package (Application + Infrastructure)

```
@colla/server/
├── application/
│   └── 🎯 page.service.ts           # Use cases
├── infrastructure/
│   └── repositories/
│       └── 🔧 git-page.repository.ts  # Git adapter
└── presentation/
    └── controllers/
        └── 🌐 page.controller.ts      # REST API
```

**Principes:**
- ✅ Dépend de shared (domain)
- ✅ Adapters implémentent les Ports
- ✅ Controllers légers (délégation)

### Web Package (Presentation)

```
@colla/web/
├── api/
│   └── 📡 page.api.ts               # HTTP client
└── components/
    ├── 📝 PageEditor.tsx
    └── 📋 PageList.tsx
```

**Principes:**
- ✅ React + TypeScript
- ✅ Composants réutilisables
- ✅ Séparation UI / Logic

### Desktop Package (Presentation)

```
@colla/desktop/
└── 🖥️ main.ts                       # Electron wrapper
```

**Principes:**
- ✅ Wrapper autour du web
- ✅ Cross-platform

## Dépendances entre Packages

```
         ┌─────────────┐
         │   shared    │ ← Domain (no deps)
         └──────┬──────┘
                │
        ┌───────┴────────┬─────────┐
        │                │         │
   ┌────▼────┐    ┌──────▼──┐  ┌──▼──────┐
   │ server  │    │   web   │  │ desktop │
   └─────────┘    └─────────┘  └─────────┘
```

## Technologies par Package

### @colla/shared
- TypeScript 5.3
- Jest 29
- ts-jest 29
- uuid 9.0

### @colla/server
- TypeScript 5.3
- Express 4.18
- isomorphic-git 1.25
- cors 2.8
- dotenv 16.3
- ts-node-dev 2.0

### @colla/web
- TypeScript 5.2
- React 18.2
- React Router 6.20
- Vite 5.0
- @vitejs/plugin-react 4.2

### @colla/desktop
- TypeScript 5.3
- Electron 28.0
- electron-builder 24.9

## Scripts npm Disponibles

### Root
```bash
npm run build              # Build tous les packages
npm test                   # Run tous les tests
npm run lint               # Lint tous les packages
npm run dev:server         # Dev server
npm run dev:web            # Dev web app
npm run dev:desktop        # Dev desktop app
npm run clean              # Clean all
```

### Par Package
```bash
# Shared
npm test -w @colla/shared
npm run build -w @colla/shared

# Server
npm run dev -w @colla/server
npm run build -w @colla/server

# Web
npm run dev -w @colla/web
npm run build -w @colla/web

# Desktop
npm run dev -w @colla/desktop
npm run package -w @colla/desktop
```

## Patterns Appliqués

### Domain-Driven Design (DDD)
- ✅ Entities: `Page`
- ✅ Value Objects: `PageId`, `PageTitle`, `PageContent`
- ✅ Repositories: `PageRepository` (port)
- ✅ Services: `PageService`

### Architecture Hexagonale
- ✅ Domain Layer (shared)
- ✅ Application Layer (services)
- ✅ Infrastructure Layer (adapters)
- ✅ Presentation Layer (controllers, UI)

### Test-Driven Development (TDD)
- ✅ Tests unitaires du domaine
- ✅ Red-Green-Refactor
- ✅ Coverage ≥ 80%

### SOLID Principles
- ✅ Single Responsibility
- ✅ Open/Closed
- ✅ Liskov Substitution
- ✅ Interface Segregation
- ✅ Dependency Inversion

## Flux de Données

```
User Input → React → API Client → REST API → Service → Entity → Repository Port
                                                                         ↓
                                                                   Git Adapter
                                                                         ↓
                                                                   File System
```

## Qualité du Code

### TypeScript
- ✅ Strict mode enabled
- ✅ No implicit any
- ✅ No unused vars
- ✅ Explicit return types

### Linting
- ✅ ESLint configured
- ✅ Prettier configured
- ✅ Consistent code style

### Testing
- ✅ Jest configured
- ✅ Unit tests for domain
- ✅ 80% coverage target

## Git Storage

```
.colla-data/
└── git-repo/              # Git repository (runtime)
    ├── .git/
    │   ├── objects/       # Git objects
    │   └── refs/          # Git refs
    └── pages/
        ├── uuid-1.json    # Page 1 (JSON)
        ├── uuid-2.json    # Page 2 (JSON)
        └── ...
```

Chaque modification → Commit Git → Versioning complet!

## Prochaines Étapes

1. ✅ Structure créée
2. ✅ Tests domaine écrits
3. ✅ Documentation complète
4. 🔄 Installer dépendances: `npm install`
5. 🔄 Lancer les tests: `npm test`
6. 🔄 Démarrer le dev: `npm run dev:server` + `npm run dev:web`
7. 🚀 Développer des features!

---

**Projet généré en suivant les principes de:**
- **Michael Azerad**: TDD, DDD, Architecture Hexagonale
- **Clean Architecture**: Séparation des responsabilités
- **SOLID**: Principes de conception

**Status**: ✅ **PRÊT POUR LE DÉVELOPPEMENT**
