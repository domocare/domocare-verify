# Deploiement Domocare Verify

## Option recommandee: Vercel

1. Connecter le repository GitHub `domocare/domocare-verify` dans Vercel.
2. Ajouter les variables d'environnement du projet:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_APP_URL`
3. Utiliser la commande de build existante:
   - `npm run build`
4. Apres deploiement, configurer le domaine final:
   - `verify.groupe-lantana.fr`
5. Mettre `NEXT_PUBLIC_APP_URL` a jour avec l'URL finale.

## Notes importantes

- Supabase expose la base PostgreSQL, mais l'application Next.js doit etre
  hebergee separement.
- Les pages back-office et verification sont rendues dynamiquement pour eviter
  les requetes Prisma pendant le build.
- Si le domaine final n'est pas encore pret, utiliser temporairement l'URL
  fournie par Vercel comme valeur `NEXT_PUBLIC_APP_URL`.
