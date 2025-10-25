# 🔄 Build Automatique - Guide

## 📦 Problème Résolu

Le package `@colla/shared` contient le domaine métier en TypeScript qui doit être compilé en JavaScript pour être utilisé par les autres packages (server, web, desktop).

### ❌ Avant

```bash
# Il fallait manuellement builder shared
npm run build -w @colla/shared
npm run dev:server
```

### ✅ Après

```bash
# Le build est automatique !
npm run dev:server
# ✅ Build @colla/shared automatiquement
# ✅ Puis lance le serveur
```

## 🚀 Scripts Améliorés

### 1. `postinstall` - Build après installation

```json
{
  "scripts": {
    "postinstall": "npm run build -w @colla/shared"
  }
}
```

**Quand ?** Après chaque `npm install`

**Pourquoi ?** Garantit que `@colla/shared` est toujours compilé

### 2. `dev:server` - Build avant démarrage

```json
{
  "scripts": {
    "dev:server": "npm run build:shared && npm run dev -w @colla/server"
  }
}
```

**Quand ?** À chaque démarrage du serveur

**Pourquoi ?** Assure que les dernières modifications du domaine sont prises en compte

### 3. `build:shared` - Build manuel

```json
{
  "scripts": {
    "build:shared": "npm run build -w @colla/shared"
  }
}
```

**Quand ?** Quand vous modifiez le domaine et voulez tester sans redémarrer le serveur

**Pourquoi ?** Permet un build rapide ciblé

## 📋 Quand faut-il builder ?

### ✅ Build Automatique

Ces commandes buildent automatiquement `@colla/shared` :

- `npm install` → via `postinstall`
- `npm run dev:server` → via `build:shared &&`
- `npm run build` → build tous les packages

### 🔧 Build Manuel Nécessaire

Vous devez manuellement `npm run build:shared` si :

- ❌ Vous modifiez le domaine pendant que le serveur tourne
- ❌ Vous testez le serveur avec `ts-node` directement
- ❌ Vous avez supprimé le dossier `dist/`

## 🎯 Workflow de Développement

### Scénario 1: Premier démarrage

```bash
git clone https://github.com/ThebaultLouis/Colla.git
cd Colla
npm install          # ✅ Build shared via postinstall
npm run dev:server   # ✅ Build shared via dev:server
npm run dev:web      # Dans un autre terminal
```

### Scénario 2: Modifier le domaine

```bash
# Modifier packages/shared/src/domain/page/page.entity.ts

# Option A: Redémarrer le serveur (recommandé)
# Ctrl+C puis
npm run dev:server   # ✅ Rebuild automatique

# Option B: Build manuel (serveur qui tourne)
npm run build:shared
# Le serveur ts-node-dev devrait recharger automatiquement
```

### Scénario 3: Modifier le serveur

```bash
# Modifier packages/server/src/application/page.service.ts
# ✅ ts-node-dev recharge automatiquement
# ❌ Pas besoin de rebuild shared
```

### Scénario 4: Modifier le web

```bash
# Modifier packages/web/src/components/PageEditor.tsx
# ✅ Vite HMR recharge automatiquement
# ❌ Pas besoin de rebuild shared
```

## 🔍 Vérifier le Build

### Vérifier que shared est buildé

```bash
ls -la packages/shared/dist/
# Doit contenir:
# - index.js
# - index.d.ts
# - domain/page/*.js
```

### Vérifier la version buildée

```bash
cat packages/shared/dist/index.js
# Doit contenir du code JavaScript compilé
```

### En cas de problème

```bash
# 1. Nettoyer complètement
npm run clean
rm -rf packages/shared/dist

# 2. Réinstaller
npm install

# 3. Vérifier le build
ls packages/shared/dist/
```

## 📊 Ordre de Build

Dans un monorepo, l'ordre de build est important :

```
1. @colla/shared    ← Doit être buildé en premier (aucune dépendance)
   │
   ├── 2. @colla/server   (dépend de shared)
   ├── 3. @colla/web      (dépend de shared via API)
   └── 4. @colla/desktop  (dépend de web)
```

## 💡 Tips

### Développement actif sur le domaine

Si vous modifiez souvent le domaine, utilisez le mode watch :

```bash
# Terminal 1: Watch shared
cd packages/shared
npm run build -- --watch

# Terminal 2: Serveur
npm run dev:server
```

### Performance

Le build de `@colla/shared` est rapide (~1-2 secondes) car :
- ✅ Petit package (~10 fichiers)
- ✅ TypeScript en mode `--transpileOnly` pour dev
- ✅ Pas de bundling complexe

### CI/CD

Dans un pipeline CI/CD :

```yaml
- npm install          # Build shared via postinstall
- npm run build        # Build tous les packages
- npm test             # Tests
- npm run lint         # Lint
```

## 🎓 Pourquoi cette Architecture ?

### Monorepo avec Workspaces

- ✅ **Shared Package** : Réutilisé par server, web, desktop
- ✅ **Version unique** : Un seul domaine pour toute l'app
- ✅ **Type safety** : TypeScript partagé entre packages

### Build Required

- ✅ **Node.js** ne comprend que JavaScript
- ✅ **Server** importe `@colla/shared` → doit être compilé
- ✅ **Type definitions** (`.d.ts`) pour l'autocomplete

## 📚 Documentation

- **QUICKSTART.md** : Guide de démarrage
- **DEVELOPMENT.md** : Guide de développement
- **packages/shared/README.md** : Documentation du package shared

---

**Build automatisé = Moins de friction = Plus de productivité ! 🚀**
