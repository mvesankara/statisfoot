# Documentation du processus d'authentification

Cette documentation décrit le fonctionnement complet de l'authentification dans Statisfisfoot, en détaillant les interactions entre les pages clientes, les server actions, l'API NextAuth et la base de données Prisma.

## Vue d'ensemble
- **Framework** : [NextAuth.js](https://next-auth.js.org/) configuré en mode JWT, avec des fournisseurs Credentials et Google. La configuration se trouve dans [`src/lib/auth.ts`](../lib/auth.ts).
- **Stockage** : Base de données gérée via Prisma (`src/lib/prisma.ts`). Les tables clés concernées sont `User`, `Role`, `UserRole`, `EmailVerificationToken` et les colonnes de réinitialisation de mot de passe sur `User`.
- **Pages concernées** : toutes les pages d'authentification vivent sous `src/app/(auth)/` (`login`, `register`, `forgot-password`, `reset-password`).
- **Flux additionnels** : une server action permet de renvoyer l'e-mail de vérification (`src/app/actions/resendVerificationEmail.ts`), et une route API gère la confirmation (`src/app/api/auth/verify-email/route.ts`).

## Inscription
1. Le formulaire client d'inscription est rendu par [`(auth)/register/page.tsx`](register/page.tsx) et soumet les données à la server action [`register`](../register/actions.ts).
2. La server action :
   - Valide la présence des champs requis, la correspondance et la longueur du mot de passe (`≥ 8` caractères).  
   - Normalise l'adresse e-mail (minuscule), génère un nom d'utilisateur unique et un affichage (`displayName`).  
   - Hash le mot de passe avec `bcryptjs` avant insertion (`hashedPass`).  
   - Attribue le rôle initial (`SCOUT`, `RECRUITER` ou `AGENT`) via la relation `UserRole`.  
   - Génère un token de vérification valide 24 h stocké dans `EmailVerificationToken`.  
   - Envoie un e-mail de vérification et redirige vers `/login?verified=false` pour signaler qu'une confirmation est attendue.

## Vérification d'e-mail
- L'utilisateur clique sur le lien envoyé, qui cible [`/api/auth/verify-email?token=…`](../api/auth/verify-email/route.ts).  
- La route API :
  - Contrôle la présence du token et le récupère dans `EmailVerificationToken`.  
  - Rejette les tokens invalides ou expirés et nettoie les enregistrements obsolètes.  
  - Marque `User.emailVerified` et supprime le token associé.  
  - Redirige vers `/login?verified=true` pour informer de la réussite.
- Les utilisateurs connectés peuvent déclencher [`resendVerificationEmail`](../actions/resendVerificationEmail.ts) qui regénère un token 24 h et renvoie un e-mail.

## Connexion
1. La page [`(auth)/login/page.tsx`](login/page.tsx) redirige immédiatement les utilisateurs déjà authentifiés grâce à `auth()` (wrapper de `getServerSession`).
2. Le formulaire [`LoginForm`](login/LoginForm.tsx) :
   - Valide localement la présence de l'email et du mot de passe.  
  - Appelle `signIn("credentials")` sans redirection automatique pour gérer les erreurs côté client.  
  - Redirige vers `callbackUrl` (par défaut `/app`) en cas de succès.
3. Côté serveur, le provider Credentials de [`authOptions`](../lib/auth.ts) :
   - Recherche l'utilisateur par e-mail, récupère ses rôles et vérifie le hash (`bcryptjs.compare`).  
   - Expose l'identifiant, le rôle primaire et les métadonnées (displayName, username, emailVerified) dans l'objet `user`.  
   - Les callbacks `jwt` et `session` synchronisent ces informations avec le token JWT et la session côté client.
4. Un provider Google est également configuré ; à la première connexion les utilisateurs doivent exister (ou un processus d'auto-provisioning doit être ajouté).

## Réinitialisation de mot de passe
1. La page [`(auth)/forgot-password`](forgot-password/page.tsx) envoie un e-mail via la server action [`forgotPassword`](../forgot-password/actions.ts) :
   - Normalise l'e-mail et répond de manière neutre si l'utilisateur n'existe pas.  
   - Génère un token unique d'une validité d'1 h (`passwordResetToken`, `passwordResetTokenExpiry` sur `User`).  
   - Déclenche l'envoi d'un e-mail contenant le lien `/reset-password?token=…`.
2. La page [`(auth)/reset-password`](reset-password/page.tsx) lit le token dans l'URL et soumet à la server action [`resetPassword`](../reset-password/actions.ts) :
   - Vérifie la présence du token, la correspondance et la longueur du nouveau mot de passe.  
   - S'assure que le token n'a pas expiré.  
   - Hash le nouveau mot de passe (`bcryptjs`) et purge le token avant de rediriger vers `/login?reset=true`.

## Gestion des sessions & protection
- `auth()` est utilisé dans les pages serveur et routes API pour récupérer la session actuelle (`src/lib/auth.ts`).
- Le middleware [`src/middleware.ts`](../middleware.ts) applique `withAuth` afin de restreindre l'accès aux routes protégées selon le rôle stocké dans le JWT.
- Les composants côté client peuvent accéder à `useSession` via le provider défini dans [`src/app/providers.tsx`](../providers.tsx).

## Dépendances et configuration
- Variables d'environnement indispensables : `AUTH_SECRET` (ou `NEXTAUTH_SECRET`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, paramètres SMTP (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`).
- Prisma doit avoir appliqué les migrations ajoutant :
  - Les rôles/permissions (`UserRole`, `Role`).  
  - Les colonnes `emailVerified`, `emailVerificationToken` ou la table `EmailVerificationToken`.  
  - Les champs `passwordResetToken` et `passwordResetTokenExpiry` sur `User`.
- Les utilitaires d'e-mail se trouvent dans [`src/lib/email.ts`](../lib/email.ts) et reposent sur Nodemailer.

## Résumé des fichiers clés
| Zone | Fichier | Description |
| ---- | ------- | ----------- |
| Pages | `(auth)/login/page.tsx`, `(auth)/register/page.tsx`, `(auth)/forgot-password/page.tsx`, `(auth)/reset-password/page.tsx` | Interfaces client (forms, redirections). |
| Server actions | `register/actions.ts`, `forgot-password/actions.ts`, `reset-password/actions.ts`, `actions/resendVerificationEmail.ts` | Logique serveur pour l'inscription, la réinitialisation et le renvoi d'e-mail. |
| API | `api/auth/[...nextauth]/route.ts`, `api/auth/verify-email/route.ts` | Configuration NextAuth & validation des tokens de vérification. |
| Auth helpers | `lib/auth.ts`, `middleware.ts`, `app/providers.tsx` | Session, callbacks JWT, middleware de protection. |
| E-mails | `lib/email.ts` | Envoi d'e-mails de vérification et de réinitialisation. |

> **Bonnes pratiques** : garder les templates d'e-mail cohérents, surveiller l'expiration des tokens, et prévoir un parcours utilisateur clair (alertes visuelles et redirections) pour chaque étape.
