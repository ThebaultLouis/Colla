# Colla 🚀

Un espace de travail collaboratif inspiré de Notion, utilisant **Git comme backend** pour le versioning et la synchronisation.

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/ThebaultLouis/Colla.git
cd Colla

# Installer les dépendances
npm install
```

## 💻 Développement

### Lancer le serveur backend

```bash
npm run dev:server
```

Le serveur démarre sur `http://localhost:3000`

### Lancer le client web

```bash
npm run dev:web
```

L'application web est disponible sur `http://localhost:5173`

### Lancer l'application desktop

```bash
npm run dev:desktop
```

## 📦 Structure du projet

```
colla/
├── packages/
│   ├── shared/          # Logique métier partagée (DDD)
│   ├── server/          # API backend (Express + Git storage)
│   ├── web/             # Application web (React + Vite)
│   └── desktop/         # Application desktop (Electron)
└── package.json         # Monorepo workspace
```

## 🎯 Vision

Colla stocke toutes les données dans un repository Git pour offrir :

- ✅ Versioning natif du contenu
- ✅ Collaboration via Git (push/pull/merge)
- ✅ Historique complet et traçabilité
- ✅ Décentralisation des données
- ✅ Backup via n'importe quel service Git

## 📝 License

MIT
