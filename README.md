# StatisFoot - Plateforme d'Analyse de Joueurs

StatisFoot est une application web conçue pour les recruteurs, agents et scouts de football. Elle permet de créer, gérer et consulter des rapports d'analyse sur des joueurs de football, facilitant ainsi le processus de recrutement et de suivi des talents.

## Fonctionnalités

- **Gestion des utilisateurs** : Inscription, connexion, et gestion de profils avec différents rôles (Scout, Recruteur, Agent, Admin).
- **Création de joueurs** : Ajoutez de nouveaux joueurs à la base de données.
- **Rapports détaillés** : Rédigez des rapports complets sur les joueurs, avec la possibilité de les sauvegarder comme brouillons ou de les publier.
- **Contrôle d'accès basé sur les rôles (RBAC)** : Des permissions spécifiques sont attribuées à chaque rôle pour garantir la sécurité et la confidentialité des données.
- **Tableau de bord** : Une vue d'ensemble des activités récentes, des rapports et des joueurs.

## Technologies utilisées

- **Framework frontend et backend** : [Next.js](https://nextjs.org/)
- **Base de données** : [PostgreSQL](https://www.postgresql.org/)
- **ORM** : [Prisma](https://www.prisma.io/)
- **Authentification** : [NextAuth.js](https://next-auth.js.org/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)

## Configuration et Installation

Pour lancer le projet en local, suivez les étapes ci-dessous.

### Prérequis

- [Node.js](https://nodejs.org/) (version 20 ou supérieure)
- [npm](https://www.npmjs.com/) ou un autre gestionnaire de paquets
- Une instance de [PostgreSQL](https://www.postgresql.org/download/)

### Étapes d'installation

1.  **Clonez le dépôt** :
    ```bash
    git clone <URL_DU_DEPOT>
    cd statisfoot
    ```

2.  **Installez les dépendances** :
    ```bash
    npm install
    ```

3.  **Configurez les variables d'environnement** :
    Créez un fichier `.env` à la racine du projet en vous basant sur le fichier `.env.example` (s'il existe). Remplissez les variables d'environnement nécessaires, notamment :

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    AUTH_URL="http://localhost:3000"               # ou NEXTAUTH_URL pour rétrocompatibilité
    AUTH_SECRET="votre_secret_ici"                 # ou NEXTAUTH_SECRET
    GOOGLE_CLIENT_ID="votre_client_id_google"
    GOOGLE_CLIENT_SECRET="votre_secret_client_google"
    ```

    > ⚠️ **Google OAuth** : ajoutez exactement `http://localhost:3000/api/auth/callback/google` (ou l'URL correspondant à `AUTH_URL`)
    > dans la liste des URI de redirection autorisés de votre projet Google Cloud. Une erreur `redirect_uri_mismatch` indique que
    > l'URL générée par NextAuth ne correspond pas à la configuration côté Google.

4.  **Appliquez les migrations de la base de données** :
    Cette commande va créer les tables nécessaires dans votre base de données en se basant sur le schéma Prisma.

    ```bash
    npx prisma migrate dev
    ```

5.  **Initialisez les rôles et, si besoin, un compte administrateur** :

    Le script de seed garantit que la table `Role` contient toutes les valeurs attendues. Pour créer automatiquement un premier
    compte administrateur, définissez au préalable les variables d'environnement suivantes (vous pouvez le faire dans votre
    terminal ou dans un fichier `.env.local`) puis lancez la commande de seed :

    ```bash
    export SEED_ADMIN_EMAIL="admin@example.com"
    export SEED_ADMIN_PASSWORD="mot_de_passe_sécurisé"
    export SEED_ADMIN_NAME="Nom Affiché"   # optionnel
    npx prisma db seed
    ```

    Si les variables `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` ne sont pas définies, la commande se contente de créer/mettre
    à jour les rôles sans générer de compte administrateur.


    Le script de seed garantit que la table `Role` contient toutes les valeurs attendues et peut créer un compte `ADMIN` si vous
    fournissez les variables d'environnement `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` (et optionnellement `SEED_ADMIN_NAME`).

    ```bash
    npx prisma db seed
    ```


6.  **Lancez le serveur de développement** :
    ```bash
    npm run dev
    ```

L'application sera alors accessible à l'adresse [http://localhost:3000](http://localhost:3000).

### Vérifier qu'un utilisateur possède le rôle administrateur

Deux options sont disponibles pour confirmer que votre compte dispose bien du rôle `ADMIN` :


1. **Via l'interface** : authentifiez-vous puis rendez-vous sur la page [`/profile`](http://localhost:3000/profile). Le rôle
   `ADMIN` apparaît dans la carte de profil si le compte possède cette permission.

1. **Via l'interface** : authentifiez-vous puis rendez-vous sur la page [`/profile`](http://localhost:3000/profile). Le rôle actuel
   est affiché dans la carte de profil.

2. **Via la base de données** : utilisez le script utilitaire fourni pour interroger Prisma.

   ```bash
   npm run check:admin -- --email admin@example.com
   ```

   Le script renvoie un message de confirmation si l'utilisateur dispose du rôle `ADMIN`, ou liste les rôles actuellement associés
   dans le cas inverse.

## Lancer en production

Pour construire et lancer l'application en mode production, utilisez les commandes suivantes :

```bash
npm run build
npm run start
```

## Structure du projet

Le projet suit la structure de l'App Router de Next.js :

-   `src/app` : Contient les pages, les layouts et les routes de l'API.
-   `src/components` : Contient les composants React réutilisables.
-   `src/lib` : Contient les librairies et les fonctions utilitaires (authentification, base de données, etc.).
-   `prisma` : Contient le schéma de la base de données (`schema.prisma`) et les migrations.
-   `public` : Contient les fichiers statiques (images, polices, etc.).
