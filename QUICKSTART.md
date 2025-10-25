# Colla - Quick Start

## Installation Rapide

```bash
# 1. Cloner le projet
git clone https://github.com/ThebaultLouis/Colla.git
cd Colla

# 2. Installer les dépendances
npm install
# Note: Le package @colla/shared sera automatiquement buildé après l'installation

# 3. Créer le fichier .env du serveur
cp packages/server/.env.example packages/server/.env
```

> **💡 Tip**: Le script `postinstall` build automatiquement le package `@colla/shared` après `npm install`. Si vous modifiez le domaine, relancez `npm run build:shared`.

## Lancer l'Application

### Option 1: Web App (Développement)

**Terminal 1 - Backend:**
```bash
npm run dev:server
# 🚀 Server: http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev:web
# 🌐 Web App: http://localhost:5173
```

Ouvrir http://localhost:5173 dans le navigateur.

### Option 2: Desktop App

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev:web
```

**Terminal 3 - Electron:**
```bash
npm run dev:desktop
```

## Vérifier que tout fonctionne

### 1. Tests du domaine
```bash
npm test -w @colla/shared
```

Tous les tests doivent passer ✅

### 2. Build
```bash
npm run build
```

Aucune erreur TypeScript ✅

### 3. API Health Check
```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2025-10-25T..."}
```

### 4. Créer une page

**Via l'interface web:**
1. Aller sur http://localhost:5173
2. Cliquer "New Page"
3. Ajouter un titre et du contenu
4. Cliquer "Save"

**Via curl:**
```bash
curl -X POST http://localhost:3000/api/pages \
  -H "Content-Type: application/json" \
  -d '{"title":"Ma première page","content":"Hello Colla!"}'

# {"id":"uuid...","title":"Ma première page",...}
```

### 5. Vérifier le stockage Git

```bash
ls -la .colla-data/git-repo/pages/
# Vous devriez voir un fichier .json par page

git -C .colla-data/git-repo log
# Vous devriez voir les commits Git
```

## Structure des Données

Les pages sont stockées dans `.colla-data/git-repo/pages/`:

```json
{
  "id": "uuid-v4",
  "title": "Ma première page",
  "content": "Hello Colla!",
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z"
}
```

Chaque modification crée un commit Git.

## Commandes Utiles

```bash
# Développement
npm run dev:server        # Backend API (build shared automatiquement)
npm run dev:web           # Web frontend
npm run dev:desktop       # Desktop app

# Build
npm run build             # Build tout
npm run build:shared      # Build uniquement shared (si modifié)
npm run build -w @colla/server
npm run build -w @colla/web

# Tests
npm test                  # Tous les tests
npm test -w @colla/shared # Tests domaine
npm run test:watch -w @colla/shared  # Mode watch

# Lint
npm run lint              # Lint tout

# Clean
npm run clean             # Supprimer node_modules et dist
```

## Troubleshooting

### Le serveur ne démarre pas : "Cannot find module @colla/shared"

```bash
# Le package shared doit être buildé
npm run build:shared
# ou
npm run build -w @colla/shared
```

> **Note**: Ceci est maintenant automatique avec `npm run dev:server`, mais si vous modifiez le domaine (`@colla/shared`), relancez `npm run build:shared`.

### Port 3000 déjà utilisé

```bash
# Changer le port dans packages/server/.env
PORT=3001
```

### Erreurs TypeScript

```bash
# Rebuild shared package
npm run build -w @colla/shared
```

### Tests qui échouent

```bash
# Clean install
npm run clean
npm install
npm test
```

## Architecture

```
Frontend (React)  →  Backend API (Express)  →  Git Storage
   :5173              :3000                     .colla-data/
```

## Prochaines Étapes

1. ✅ Créer quelques pages
2. ✅ Explorer le stockage Git
3. 📖 Lire [DEVELOPMENT.md](./DEVELOPMENT.md) pour contribuer
4. 📖 Lire [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre les décisions

## Aide

- **Documentation**: Voir README.md
- **Architecture**: Voir ARCHITECTURE.md
- **Développement**: Voir DEVELOPMENT.md
- **Issues**: https://github.com/ThebaultLouis/Colla/issues

Bon développement! 🚀
