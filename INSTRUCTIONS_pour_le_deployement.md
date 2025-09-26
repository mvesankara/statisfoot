# Instructions de Configuration de l'Environnement

Pour que l'application fonctionne correctement après ces modifications, il est **essentiel** de mettre à jour votre fichier `.env` (ou vos variables d'environnement de déploiement).

## Migration de NextAuth v4 à v5

Le système d'authentification a été mis à jour de `next-auth` v4 à v5 (`auth.js`) pour corriger une erreur de compatibilité. Cette mise à jour introduit des changements dans les noms des variables d'environnement requises.

## Action Requise

Veuillez vous assurer que votre fichier `.env` utilise les variables suivantes :

```dotenv
# Requis par NextAuth.js v5
AUTH_SECRET="votre_cle_secrete_ici"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# Requis par Prisma
DATABASE_URL="postgresql://appuser:strongpass@localhost:5432/statisfoot?schema=public"
```

**IMPORTANT**:
- Remplacez `votre_cle_secrete_ici` par une chaîne de caractères aléatoire et sécurisée.
- La variable `NEXTAUTH_SECRET` n'est plus utilisée et sera ignorée. Vous devez utiliser `AUTH_SECRET`.

Sans ces changements dans votre environnement, l'authentification échouera.
