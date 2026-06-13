<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</div>

<br />

<div align="center">
  <h1>🌟 Bookify - Frontend Application</h1>
  <p><strong>Plateforme de réservation de services en ligne</strong></p>
  <p>Application web moderne, rapide et réactive construite avec <b>React</b>, <b>TypeScript</b>, et propulsée par <b>Vite</b>.</p>
</div>

---

## 📖 Présentation

Le projet **Bookify** (Frontend) est l'interface utilisateur de la plateforme de réservation. Il a été conçu avec une approche **"Mobile-First"** et utilise des concepts modernes de design d'interface comme le **Glassmorphism**, les micro-animations et un mode sombre/clair natif. 

L'application est divisée en **trois espaces distincts** :
1. **👨‍💼 Espace Client** : Recherche de prestataires, réservation de services, gestion des favoris et dépôt d'avis.
2. **🛠️ Espace Prestataire** : Gestion du profil (portfolio, services offerts, disponibilités), suivi des réservations et interaction avec les clients.
3. **🛡️ Espace Administrateur** : Tableau de bord de gestion globale, modération des utilisateurs, gestion des catégories de services et du support.

---

## 🚀 Fonctionnalités Principales

- **Authentification & Sécurité** : Connexion basée sur JWT (JSON Web Tokens) avec gestion des rôles (Admin, Prestataire, Client).
- **Interface Utilisateur Premium** : Animations fluides avec `framer-motion`, design Glassmorphism et adaptabilité totale (Responsive Design).
- **Mode Sombre / Mode Clair** : Gestion dynamique du thème avec `ThemeContext` et classes utilitaires Tailwind.
- **Routage Protégé** : Routes privées et publiques sécurisées par type d'utilisateur avec `react-router-dom`.
- **Gestion d'État & API** : Utilisation de hooks personnalisés et appels API structurés et centralisés via `Axios`.

---

## 📂 Architecture & Structure du Code

L'architecture suit les meilleures pratiques React pour maintenir un code propre, modulaire et hautement évolutif.

```text
bookify-frontend/
├── public/                 # Fichiers statiques publics (favicon, images statiques)
├── src/                    # Code source principal
│   ├── assets/             # Icônes, polices et illustrations locales
│   ├── components/         # Composants réutilisables (divisés par espace)
│   │   ├── Admin/          # Composants spécifiques au dashboard administrateur
│   │   ├── Client/         # Composants publics et spécifiques aux clients
│   │   ├── Provider/       # Composants du tableau de bord prestataire
│   │   └── shared/         # Composants partagés (boutons, modales, loaders)
│   ├── context/            # Contextes React globaux (AuthContext, ThemeContext)
│   ├── hooks/              # Hooks personnalisés (ex: useDebounce, useAuth)
│   ├── pages/              # Pages principales de l'application (Vues)
│   │   ├── Admin/          # Vues de l'administration (Users, Categories...)
│   │   ├── Client/         # Vues clients (Home, Explore, FavorisAvis...)
│   │   └── Provider/       # Vues prestataires (Dashboard, MesServices...)
│   ├── routes/             # Configuration des routes (AppRoutes, ProtectedRoute)
│   ├── services/           # Logique de communication avec l'API Backend (Axios)
│   │   └── api.ts          # Configuration de l'instance Axios avec intercepteurs
│   ├── styles/             # Fichiers CSS globaux (index.css)
│   ├── App.tsx             # Composant racine
│   └── main.tsx            # Point d'entrée de l'application React
├── .env                    # Variables d'environnement
├── tailwind.config.js      # Configuration personnalisée de TailwindCSS
├── tsconfig.json           # Configuration TypeScript
└── vite.config.ts          # Configuration du bundler Vite
```

---

## 🛠️ Stack Technologique

- **Cœur** : React 18, TypeScript, Vite
- **Routage** : React Router DOM v6
- **Stylisation** : Tailwind CSS, Lucide React (Icônes)
- **Animations** : Framer Motion
- **Requêtes HTTP** : Axios
- **Notifications** : React Hot Toast
- **Formatage du code** : ESLint, Prettier

---

## 💻 Installation & Lancement

Suivez ces étapes pour exécuter le projet localement :

### 1. Prérequis
- **Node.js** (v18 ou supérieur)
- **NPM** (v9 ou supérieur) ou **Yarn**

### 2. Cloner le projet
```bash
git clone https://github.com/tahv7x/bookify-frontend.git
cd bookify-frontend
```

### 3. Installer les dépendances
```bash
npm install
# ou
yarn install
```

### 4. Variables d'Environnement
Créez un fichier `.env` à la racine du dossier `frontend` :
```env
VITE_API_URL=http://localhost:5200/api
```

### 5. Démarrer le serveur de développement
```bash
npm run dev
# ou
yarn dev
```
> Le serveur se lancera généralement sur [http://localhost:5173](http://localhost:5173). Les rechargements à chaud (HMR) sont instantanés !

### 6. Compiler pour la production
```bash
npm run build
```
Les fichiers optimisés seront générés dans le dossier `/dist`.

---

## 🔍 Logique de Navigation (Routes)

Le système de routes (`AppRoutes.tsx`) est sécurisé grâce au composant `ProtectedRoute`.
- Les utilisateurs non connectés sont redirigés vers les pages `/login` ou `/register`.
- Si un `Client` tente d'accéder au `/Dashboard-Provider`, il est bloqué et redirigé.
- Les Layouts (`AdminLayout`, `ProviderLayout`) englobent automatiquement les vues enfants pour éviter la duplication de code (ex: Menu latéral et TopBar).

---

## 🎨 Lignes directrices UI/UX

1. **Cohérence des Couleurs** : Le projet utilise des variables CSS dynamiques et les classes Tailwind (ex: `dark:bg-black`) pour s'adapter à la préférence de l'utilisateur.
2. **Micro-interactions** : Chaque bouton et carte utilise `transition-all duration-300` et `active:scale-95` pour donner un retour visuel instantané (Feedback UI).
3. **Portails** : Les Modales et Menus Déroulants utilisent souvent `createPortal` pour éviter les problèmes de débordement (Overflow Clipping) dus aux propriétés CSS des tableaux parents.

---

<div align="center">
  <p>Fait avec ❤️ pour le projet de fin d'études <b>Bookify</b>.</p>
</div>
