# Adéquation Charge / Ressource — PPDC Bretagne-Sud

Maquette interactive (look & feel) d'un tableau de bord d'aide à la décision pour La Poste : ajuster
la charge de travail (volume d'objets) aux ressources (agents/facteurs) sur 3 sites de distribution.

**Toutes les données sont fictives et codées en dur** — aucun backend, aucune API, aucune base de données.

Sites du PoC : **Guichen** (12 tournées), **Messac** (10 tournées), **Montfort** (8 tournées).

Stack : React 18 + Vite + Tailwind CSS + `recharts` + `lucide-react`.

## 1. Lancer le projet en local

Prérequis : [Node.js](https://nodejs.org/) 18 ou plus récent.

```bash
npm install
npm run dev
```

Ouvrir l'URL affichée (par défaut http://localhost:5173).

Pour tester le build de production en local :

```bash
npm run build
npm run preview
```

## 2. Mettre le code sur GitHub

Depuis ce dossier :

```bash
git init
git add .
git commit -m "Maquette dashboard Adéquation Charge / Ressource"
git branch -M main
git remote add origin https://github.com/<votre-compte>/<votre-repo>.git
git push -u origin main
```

Créez au préalable un dépôt vide sur GitHub (sans README/licence, pour éviter les conflits) puis
remplacez l'URL `<votre-compte>/<votre-repo>` par la vôtre.

## 3. Héberger sur Railway

1. Aller sur [railway.app](https://railway.app) et se connecter avec son compte GitHub.
2. **New Project** → **Deploy from GitHub repo** → sélectionner le dépôt poussé à l'étape 2.
3. Railway détecte automatiquement le projet Node (Nixpacks) grâce à `package.json` et au fichier
   `railway.json` déjà présents dans le dépôt :
   - Build : `npm install` puis `npm run build` (génère le dossier `dist/`).
   - Démarrage : `npm run start` (sert `dist/` via `serve`, sur le port fourni par Railway).
4. Une fois le déploiement terminé, cliquer sur **Generate Domain** dans l'onglet *Settings* du
   service pour obtenir une URL publique (`*.up.railway.app`).

Aucune variable d'environnement n'est nécessaire : l'application ne contient aucune donnée sensible
ni aucun appel réseau externe.

## 4. Modifier les données ou coefficients

- Les données mockées (sites, tournées, mix d'objets) sont générées dans
  [`src/data/mockData.js`](src/data/mockData.js) — modifiez les tableaux `SITES` ou `OBJECT_TYPES`
  pour changer le périmètre.
- Les coefficients EOR sont aussi modifiables directement dans l'écran **Matrice EOR** de l'application.
