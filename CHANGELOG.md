# Changelog

All notable changes to Colla will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Core domain model with DDD patterns (Entities, Value Objects, Repositories)
- Page entity with PageId, PageTitle, and PageContent value objects
- Git-based storage adapter using isomorphic-git
- REST API with Express for page management (CRUD operations)
- React web application with page editor and list view
- Electron desktop application wrapper
- Comprehensive test suite with Jest (80% coverage target)
- TypeScript strict mode configuration
- ESLint and Prettier for code quality
- Monorepo structure with npm workspaces
- Architecture documentation (ARCHITECTURE.md, DIAGRAMS.md)
- Development guide (DEVELOPMENT.md)
- Quick start guide (QUICKSTART.md)
- Contributing guide (CONTRIBUTING.md)

### Architecture Decisions
- [ADR-001] Architecture Hexagonale (Ports & Adapters)
- [ADR-002] Git comme Backend de Stockage
- [ADR-003] Domain-Driven Design (DDD)
- [ADR-004] Test-Driven Development (TDD)
- [ADR-005] Monorepo avec npm Workspaces
- [ADR-006] TypeScript Strict Mode
- [ADR-007] React pour le Frontend Web
- [ADR-008] Electron pour le Desktop

## [0.1.0] - 2025-10-25

### Project Initialization
- Initial project setup following TDD, DDD, and Hexagonal Architecture principles
- Basic page management functionality
- Git versioning for all content
- Web and desktop applications

---

## Upcoming Features (Roadmap)

### v0.2.0 - Database System
- [ ] Table/Database entities
- [ ] Columns and rows
- [ ] Views and filters
- [ ] Sorting and grouping

### v0.3.0 - Rich Content
- [ ] Block-based content system
- [ ] Image blocks
- [ ] Embed blocks
- [ ] Code blocks with syntax highlighting

### v0.4.0 - Collaboration
- [ ] Git remote synchronization (push/pull)
- [ ] Multi-user support
- [ ] Conflict resolution
- [ ] Real-time collaboration (WebSocket)

### v0.5.0 - Advanced Features
- [ ] Permissions and sharing
- [ ] Import/Export (Markdown, PDF, Notion)
- [ ] Search and indexing
- [ ] Templates

### v1.0.0 - Production Ready
- [ ] Performance optimizations
- [ ] Offline-first support
- [ ] Mobile applications
- [ ] Plugin system
- [ ] Full documentation
- [ ] Production deployment guide

---

**Note**: This is a living document. Check GitHub releases for detailed release notes.
