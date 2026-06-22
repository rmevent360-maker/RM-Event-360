# 🎬 RM EVENTS - Photobooth 360° (Dakar)

Ce projet est une application web moderne pour **RM EVENTS**, l'agence leader de location de Borne Photobooth 360° à Dakar. L'application permet aux clients de s'informer sur le concept, de consulter les offres pour particuliers et professionnels, de réserver en ligne avec simulation sécurisée de paiement et de récupérer leurs souvenirs vidéo via un espace Galerie Privée.

---

## 🎨 Caractéristiques Techniques & Design

- **Typographie Moderne** : Police de titres **Montserrat** combinée avec la police de lecture **Poppins** pour un rendu élégant, lisible et haut de gamme.
- **Identité de Marque** : Logo officiel RM Events intégré de manière transparente dans l'en-tête de l'application.
- **Structure Optimisée** : Interface simplifiée sans superflu, garantissant que l'utilisateur accède directement à l'essentiel.

---

## 🚀 Guide de Déploiement en Local

Pour faire fonctionner cette application sur votre ordinateur de bureau, sur un serveur local ou pour la déployer sur un hébergeur, suivez ces instructions simples :

### Recette pour le lancement classique :

### 1. Prérequis
Assurez-vous d'avoir installé **Node.js** (version 18 ou supérieure recommandée) et **npm** sur votre machine locale.
Vous pouvez vérifier leur présence avec les commandes :
```bash
node -v
npm -v
```

### 2. Éléments à importer
Téléchargez l'archive complète de ce code source (le projet au format ZIP ou clonez-le via GitHub) sur votre ordinateur de bureau.

### 3. Installation des dépendances
Ouvrez votre terminal (Invite de commandes sous Windows, ou Terminal sous macOS/Linux), naviguez dans le dossier racine du projet et exécutez la commande suivante :
```bash
npm install
```

### 4. Lancement de l'environnement de développement local
Pour démarrer l'application instantanément en local avec rechargement automatique en cas de modification du code :
```bash
npm run dev
```
Par défaut, le serveur de développement local se lance et est accessible à l'adresse suivante :
👉 **`http://localhost:3000`**

---

## 📦 Compilation & Déploiement en Production

Pour mettre en ligne l'application ou l'héberger de manière optimisée :

### 1. Générer les fichiers statiques de production (Build)
Exécutez la commande suivante dans votre terminal :
```bash
npm run build
```
Cette commande crée un répertoire **`dist/`** à la racine du projet qui contient tous les fichiers optimisés de votre application (HTML, JavaScript, CSS minifié et images de marque).

### 2. Hébergement local ou Cloud
Le dossier de sortie **`dist`** est entièrement statique. Vous pouvez :
1. **Hébergement statique simple** : Transférez le contenu de ce dossier `dist/` chez n'importe quel hébergeur professionnel (ex: Netlify, Vercel, Firebase Hosting, Hostinger, l'Océan d'Host, etc.).
2. **Serveur web local** : Hébergez-le via un serveur web local sur site comme Apache, Nginx, ou via Node en installant l'outil `serve` :
   ```bash
   npm install -g serve
   serve -s dist -l 3000
   ```

---

## 🛠️ Qualité du Code
- Vérification de la syntaxe et des types TypeScript :
  ```bash
  npm run lint
  ```
- Tous les fichiers sources importants se trouvent dans le répertoire `/src`.

---
*RM EVENTS - Immortalisons vos moments d'exception à Dakar.*
