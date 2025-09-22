# Architecture de l'Application StatisFoot

Ce document décrit l'architecture technique de l'application StatisFoot, une plateforme d'analyse de joueurs de football.

## Vue d'ensemble

StatisFoot est une application web full-stack construite avec Next.js. Elle utilise une base de données PostgreSQL gérée par l'ORM Prisma, et l'authentification est gérée par NextAuth.js.

L'architecture est basée sur le **App Router** de Next.js, ce qui permet de créer des composants qui s'exécutent soit sur le serveur (Server Components), soit sur le client (Client Components).

## Schéma de la Base de Données

La base de données est modélisée à l'aide de Prisma. Le schéma se trouve dans `prisma/schema.prisma`.

### Modèles principaux

-   **User** : Représente un utilisateur de l'application. Chaque utilisateur a un rôle (`Role`) qui détermine ses permissions.
-   **Player** : Représente un joueur de football. Un joueur peut être créé par un utilisateur.
-   **Report** : Représente un rapport d'analyse sur un joueur. Un rapport est rédigé par un utilisateur (`author`) et concerne un joueur (`player`).
-   **Role** : Une énumération (`enum`) des différents rôles possibles pour un utilisateur : `SCOUT`, `RECRUITER`, `AGENT`, `ADMIN`.

### Relations

-   Un `User` peut créer plusieurs `Player` (relation un-à-plusieurs).
-   Un `User` peut écrire plusieurs `Report` (relation un-à-plusieurs).
-   Un `Player` peut avoir plusieurs `Report` (relation un-à-plusieurs).
-   Un `Report` est lié à un seul `User` (son auteur) et à un seul `Player`.

## Flux d'Authentification et d'Autorisation

### Authentification

L'authentification est gérée par **NextAuth.js**. La configuration se trouve dans `src/lib/auth.ts`.

1.  **Providers** :
    -   `CredentialsProvider` : Permet aux utilisateurs de se connecter avec une adresse e-mail et un mot de passe. Le mot de passe est haché avec `bcryptjs` avant d'être stocké en base de données.
    -   `GoogleProvider` : Permet l'authentification via un compte Google (OAuth).

2.  **Session** :
    -   La stratégie de session utilisée est `jwt` (JSON Web Tokens).
    -   Les informations de l'utilisateur (y compris son ID et son rôle) sont encodées dans le JWT, qui est ensuite stocké dans un cookie sécurisé.
    -   Les callbacks `jwt` and `session` de NextAuth.js sont utilisés pour enrichir le token et l'objet de session avec des données personnalisées (comme le rôle de l'utilisateur).

### Autorisation (Contrôle d'accès)

L'autorisation est gérée par un système de **Role-Based Access Control (RBAC)** personnalisé.

1.  **Middleware** :
    -   Le fichier `src/middleware.ts` intercepte les requêtes vers les routes protégées (définies dans `config.matcher`).
    -   Il utilise la fonction `withAuth` de NextAuth.js pour vérifier si l'utilisateur est authentifié.

2.  **Permissions** :
    -   Le fichier `src/lib/rbac.ts` définit les rôles (`ROLES`), les permissions (`PERMISSIONS`), et les permissions accordées à chaque rôle (`GRANTS`).
    -   Le middleware vérifie si le rôle de l'utilisateur authentifié lui donne la permission d'accéder à la route demandée.

## Communication Client-Serveur

### Server Components et Client Components

-   Par défaut, les composants dans `src/app` sont des **Server Components**. Ils s'exécutent sur le serveur et peuvent accéder directement à la base de données (via Prisma) ou à d'autres ressources côté serveur.
-   Les composants qui nécessitent de l'interactivité (par exemple, des gestionnaires d'événements comme `onClick` ou des hooks comme `useState`) doivent être des **Client Components**. Ils sont marqués avec la directive `"use client"`.

### Server Actions

Pour les mutations de données (création, mise à jour, suppression), l'application utilise les **Server Actions** de Next.js.

-   Les Server Actions sont des fonctions asynchrones qui s'exécutent sur le serveur mais peuvent être appelées depuis des Client Components.
-   Elles sont utilisées pour les formulaires (connexion, inscription, création de rapports, etc.).
-   Exemples : `src/app/login/actions.ts`, `src/app/register/actions.ts`.

## Structure du code

-   **`src/app`** : Organisation des routes.
    -   `layout.tsx` : Layout principal de l'application.
    -   `page.tsx` : Page d'accueil.
    -   `(auth)` : Groupe de routes pour l'authentification.
    -   `dashboard` : Pages du tableau de bord.
    -   `api` : Contient les routes de l'API, notamment pour NextAuth.js.
-   **`src/components`** : Composants React réutilisables.
    -   `Sidebar.tsx`, `Header.tsx` : Composants de navigation principaux.
    -   `PasswordInput.tsx` : Champ de mot de passe avec affichage/masquage.
    -   `RadarChart.tsx` : Composant pour afficher des graphiques de type radar.
-   **`src/lib`** : Logique métier et configuration.
    -   `auth.ts` : Configuration de NextAuth.js.
    -   `prisma.ts` : Instance du client Prisma.
    -   `rbac.ts` : Logique du contrôle d'accès basé sur les rôles.
    -   `email.ts` : Fonctions pour l'envoi d'e-mails (vérification, réinitialisation de mot de passe).
-   **`public`** : Contient les images et autres ressources statiques.
-   **`prisma`** : Schéma et migrations de la base de données.
