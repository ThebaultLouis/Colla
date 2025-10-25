# Architecture Visuelle - Colla

## Vue d'ensemble du Système

```
┌─────────────────────────────────────────────────────────────────┐
│                         Colla System                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐                              ┌──────────────┐
│   Browser    │                              │   Electron   │
│  (Web App)   │                              │ (Desktop App)│
└──────┬───────┘                              └──────┬───────┘
       │                                             │
       │ HTTP                                        │ HTTP
       │                                             │
       └─────────────────┬───────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   REST API       │
              │  (Express :3000) │
              └────────┬─────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Page    │    │  Future  │    │  Future  │
│Controller│    │Database  │    │  Block   │
└────┬─────┘    │Controller│    │Controller│
     │          └──────────┘    └──────────┘
     │
     ▼
┌──────────────┐
│ PageService  │
│ (Use Cases)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐         ┌─────────────────┐
│ Page Entity  │◄────────┤  PageRepository │
│ (Domain)     │         │    (Port)       │
└──────────────┘         └────────▲────────┘
                                  │
                                  │ implements
                                  │
                         ┌────────┴──────────┐
                         │ GitPageRepository │
                         │    (Adapter)      │
                         └────────┬──────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Git Storage   │
                         │ (.colla-data/)  │
                         └─────────────────┘
```

## Architecture Hexagonale - Layers

```
┌────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PageController│  │  React UI   │  │ Electron Main │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                     APPLICATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PageService  │  │ AuthService  │  │ SyncService  │         │
│  │ (Use Cases)  │  │  (Future)    │  │   (Future)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                        DOMAIN LAYER                            │
│  ┌────────────────────────────────────────────────────┐        │
│  │  Entities:  Page, Database (future), Block (future)│        │
│  └────────────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────────────┐        │
│  │  Value Objects: PageId, PageTitle, PageContent     │        │
│  └────────────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────────────┐        │
│  │  Ports (Interfaces): PageRepository, ...           │        │
│  └────────────────────────────────────────────────────┘        │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                        │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ GitPageRepository│  │  Future adapters │                   │
│  │  (Git Storage)   │  │  (PostgreSQL?)   │                   │
│  └────────┬─────────┘  └──────────────────┘                   │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ isomorphic-git  │                                           │
│  │   File System   │                                           │
│  └─────────────────┘                                           │
└────────────────────────────────────────────────────────────────┘
```

## Flow de Données - Création d'une Page

```
User Action                                     Layers
───────────                                     ──────

1. User clicks                   ┌──────────────────────┐
   "New Page"         ──────────►│  React Component     │  Presentation
                                 │  (PageEditor)        │
                                 └──────────┬───────────┘
                                            │
2. POST /api/pages                          │
   {title, content}              ┌──────────▼───────────┐
                      ──────────►│  PageController      │  Presentation
                                 │  .createPage()       │
                                 └──────────┬───────────┘
                                            │
3. Service validates                        │
   and creates entity            ┌──────────▼───────────┐
                      ──────────►│  PageService         │  Application
                                 │  .createPage()       │
                                 └──────────┬───────────┘
                                            │
4. Domain entity                            │
   created                       ┌──────────▼───────────┐
                      ──────────►│  Page.create()       │  Domain
                                 │  (Entity)            │
                                 └──────────┬───────────┘
                                            │
5. Save via port                            │
                                 ┌──────────▼───────────┐
                      ──────────►│  PageRepository      │  Domain (Port)
                                 │  .save(page)         │
                                 └──────────┬───────────┘
                                            │
6. Adapter persists                         │
   to Git                        ┌──────────▼───────────┐
                      ──────────►│ GitPageRepository    │  Infrastructure
                                 │  .save()             │
                                 └──────────┬───────────┘
                                            │
7. Git operations                           │
                                 ┌──────────▼───────────┐
                      ──────────►│  isomorphic-git      │  Infrastructure
                                 │  fs.writeFile()      │
                                 │  git.add()           │
                                 │  git.commit()        │
                                 └──────────────────────┘
```

## Monorepo Structure

```
colla/
│
├── packages/
│   │
│   ├── shared/              ← DOMAIN LAYER
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   └── page/
│   │   │   │       ├── page.entity.ts
│   │   │   │       ├── value-objects.ts
│   │   │   │       └── page.repository.ts (Port)
│   │   │   └── index.ts
│   │   ├── __tests__/       ← TDD Tests
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.ts
│   │
│   ├── server/              ← APPLICATION + INFRASTRUCTURE
│   │   ├── src/
│   │   │   ├── application/
│   │   │   │   └── page.service.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── repositories/
│   │   │   │       └── git-page.repository.ts (Adapter)
│   │   │   ├── presentation/
│   │   │   │   └── controllers/
│   │   │   │       └── page.controller.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                 ← PRESENTATION LAYER (Web)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── PageList.tsx
│   │   │   │   └── PageEditor.tsx
│   │   │   ├── api/
│   │   │   │   └── page.api.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── desktop/             ← PRESENTATION LAYER (Desktop)
│       ├── src/
│       │   └── main.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
├── package.json             ← Root workspace
├── tsconfig.json
├── README.md
├── ARCHITECTURE.md
├── DEVELOPMENT.md
└── QUICKSTART.md
```

## Dépendances entre Packages

```
┌─────────────┐
│   shared    │ ◄── No dependencies (domain purity)
└──────┬──────┘
       │
       │ depends on
       │
   ┌───▼───────────┬─────────────┐
   │               │             │
┌──▼─────┐  ┌──────▼──┐  ┌───────▼──┐
│ server │  │   web   │  │ desktop  │
└────────┘  └─────────┘  └──────────┘
```

## Git Storage Structure

```
.colla-data/
└── git-repo/                 ← Git repository
    ├── .git/                 ← Git internals
    │   ├── objects/          ← Commit history
    │   ├── refs/
    │   └── ...
    └── pages/                ← Pages storage
        ├── uuid-1.json       ← Page 1
        ├── uuid-2.json       ← Page 2
        └── uuid-3.json       ← Page 3

Each file:
{
  "id": "uuid",
  "title": "...",
  "content": "...",
  "createdAt": "...",
  "updatedAt": "..."
}

Each change → Git commit
```

## DDD Tactical Patterns Applied

```
┌─────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                     │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │         ENTITIES (Identity)              │       │
│  │  ┌───────┐  ┌──────────┐  ┌─────────┐   │       │
│  │  │ Page  │  │ Database │  │  Block  │   │       │
│  │  └───────┘  └──────────┘  └─────────┘   │       │
│  │  (has PageId)  (future)      (future)    │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │      VALUE OBJECTS (No Identity)         │       │
│  │  ┌────────┐  ┌──────────┐  ┌──────────┐ │       │
│  │  │ PageId │  │PageTitle │  │PageContent│ │       │
│  │  └────────┘  └──────────┘  └──────────┘ │       │
│  │  Immutable, Validated, Comparable        │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │         REPOSITORIES (Ports)             │       │
│  │  ┌────────────────┐                      │       │
│  │  │PageRepository  │  (Interface)         │       │
│  │  └────────────────┘                      │       │
│  │  save(), findById(), findAll(), ...      │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │       DOMAIN SERVICES (Future)           │       │
│  │  Business logic spanning multiple        │       │
│  │  entities (e.g., PageCloner)             │       │
│  └─────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

## Clean Architecture Dependency Rule

```
Dependencies point INWARD (toward domain)

┌─────────────────────────────────────────┐
│    External World                       │  ← Frameworks, Drivers
│  (HTTP, Git, File System, UI)           │
└────────────────┬────────────────────────┘
                 │ depends on
                 │
┌────────────────▼────────────────────────┐
│   Infrastructure & Presentation         │  ← Adapters
│  (GitRepo, Controllers, React UI)       │
└────────────────┬────────────────────────┘
                 │ depends on
                 │
┌────────────────▼────────────────────────┐
│      Application Layer                  │  ← Use Cases
│       (Services)                        │
└────────────────┬────────────────────────┘
                 │ depends on
                 │
┌────────────────▼────────────────────────┐
│         Domain Layer                    │  ← Pure Business Logic
│  (Entities, Value Objects, Ports)       │  ← NO DEPENDENCIES
└─────────────────────────────────────────┘

Rule: Inner layers NEVER depend on outer layers!
```

---

**Visualisation créée pour Colla - Architecture Hexagonale + DDD + TDD**
