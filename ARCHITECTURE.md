# Architecture Decision Records (ADR)

## ADR 001: Architecture Hexagonale (Ports & Adapters)

**Date**: 2025-10-25  
**Statut**: Accepté

### Contexte

Nous devons concevoir une architecture qui permet de:
- Isoler la logique métier des détails techniques
- Faciliter les tests
- Permettre le changement de technologies sans impact sur le domaine
- Respecter les principes SOLID

### Décision

Adoption de l'**Architecture Hexagonale** avec:

- **Domain Layer** (`@colla/shared`): Logique métier pure, aucune dépendance externe
- **Application Layer**: Use cases et services applicatifs
- **Infrastructure Layer**: Adapters concrets (Git, HTTP, etc.)
- **Presentation Layer**: Controllers, UI

### Conséquences

✅ **Avantages**:
- Testabilité maximale (domain testable sans infrastructure)
- Flexibilité technologique
- Séparation claire des responsabilités
- Indépendance du domaine

❌ **Inconvénients**:
- Plus de fichiers et de structure
- Courbe d'apprentissage
- Overhead initial

---

## ADR 002: Git comme Backend de Stockage

**Date**: 2025-10-25  
**Statut**: Accepté

### Contexte

Nous voulons un système de versioning natif et décentralisé pour les données.

### Décision

Utilisation de **Git comme backend de stockage** via `isomorphic-git`:
- Chaque page est un fichier JSON
- Chaque modification = commit Git
- Le repository Git est le "database"

### Conséquences

✅ **Avantages**:
- Versioning natif et complet
- Historique infini
- Synchronisation via push/pull
- Décentralisation
- Ownership des données par l'utilisateur

❌ **Inconvénients**:
- Performance pour grandes quantités de données
- Requêtes complexes difficiles
- Pas de transactions ACID traditionnelles

---

## ADR 003: Domain-Driven Design (DDD)

**Date**: 2025-10-25  
**Statut**: Accepté

### Contexte

Nous devons modéliser un domaine métier complexe (pages, bases de données, collaboration).

### Décision

Adoption des **tactical patterns de DDD**:

- **Entities**: Objets avec identité (`Page`)
- **Value Objects**: Objets immuables définis par leurs attributs (`PageId`, `PageTitle`, `PageContent`)
- **Repositories**: Abstractions pour la persistence (`PageRepository`)
- **Services**: Logique métier multi-entités (`PageService`)

### Conséquences

✅ **Avantages**:
- Modèle métier expressif
- Encapsulation des règles métier
- Ubiquitous language
- Tests faciles

❌ **Inconvénients**:
- Plus de classes
- Verbosité du code

---

## ADR 004: Test-Driven Development (TDD)

**Date**: 2025-10-25  
**Statut**: Accepté

### Contexte

Nous voulons garantir la qualité et la fiabilité du code.

### Décision

Adoption du **TDD** avec Jest:
- Tests écrits avant le code
- Coverage minimum: 80%
- Tests unitaires pour le domaine
- Tests d'intégration pour les adapters

### Conséquences

✅ **Avantages**:
- Code testable par design
- Regression prevention
- Documentation vivante
- Confiance dans les refactorings

❌ **Inconvénients**:
- Temps initial plus long
- Discipline requise

---

## ADR 005: Monorepo avec npm Workspaces

**Date**: 2025-10-25  
**Statut**: Accepté

### Contexte

Nous avons plusieurs packages interdépendants (shared, server, web, desktop).

### Décision

Utilisation d'un **monorepo avec npm workspaces**:
- Un seul repository Git
- Packages partagés via workspaces
- Build et test centralisés

### Conséquences

✅ **Avantages**:
- Partage de code facile
- Versioning synchronisé
- Single source of truth
- Refactoring cross-package

❌ **Inconvénients**:
- Repository plus gros
- Build time potentiellement plus long

---

## ADR 006: TypeScript Strict Mode

**Date**: 2025-10-25  
**Statut**: Accepté

### Contexte

Nous voulons maximiser la type safety.

### Décision

Activation du **strict mode TypeScript**:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`

### Conséquences

✅ **Avantages**:
- Bugs détectés à la compilation
- Meilleur IDE support
- Auto-documentation via types
- Refactoring sûr

❌ **Inconvénients**:
- Plus verbeux
- Courbe d'apprentissage

---

## ADR 007: React pour le Frontend Web

**Date**: 2025-10-25  
**Statut**: Accepté

### Contexte

Nous avons besoin d'une interface web interactive.

### Décision

Utilisation de **React 18 + Vite**:
- React pour la UI
- Vite comme build tool
- React Router pour le routing

### Conséquences

✅ **Avantages**:
- Écosystème riche
- Performance
- Developer experience
- Fast refresh

❌ **Inconvénients**:
- Bundle size
- Client-side rendering uniquement (pour l'instant)

---

## ADR 008: Electron pour le Desktop

**Date**: 2025-10-25  
**Statut**: Accepté

### Contexte

Nous voulons une application desktop cross-platform.

### Décision

Utilisation d'**Electron**:
- Wrapper autour de l'app web
- Packaging pour Windows, macOS, Linux

### Conséquences

✅ **Avantages**:
- Code partagé avec le web
- Cross-platform
- Accès aux APIs système

❌ **Inconvénients**:
- Bundle size important
- Performance vs native

---

## Futurs ADRs à Considérer

- [ ] ADR 009: Système de synchronisation Git (push/pull)
- [ ] ADR 010: Collaboration temps réel (WebSocket, CRDT?)
- [ ] ADR 011: Système de permissions
- [ ] ADR 012: Stratégie de caching
- [ ] ADR 013: Offline-first strategy
