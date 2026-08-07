# Configuration SMTP — Formulaire de démo

## 1. Variables d'environnement (Vercel)

Dans **Vercel → Project → Settings → Environment Variables**, ajoute :

| Variable | Exemple | Description |
|----------|---------|-------------|
| `SMTP_HOST` | `mail.lecorrespondant.ci` | Serveur SMTP |
| `SMTP_PORT` | `587` | Port (587 STARTTLS ou 465 SSL) |
| `SMTP_USER` | `contact@lecorrespondant.ci` | Identifiant SMTP |
| `SMTP_PASS` | `********` | Mot de passe SMTP |
| `SMTP_FROM` | `contact@lecorrespondant.ci` | Adresse expéditeur |
| `SMTP_TO` | `contact@lecorrespondant.ci,contact@sms-ci.net` | Destinataires |

## 2. Déploiement

```bash
cd landing
npm install
vercel --prod
```

Ou pousse le dossier sur GitHub et importe le projet dans Vercel.

## 3. Ports SMTP courants

- **587** + STARTTLS → `SMTP_PORT=587` (recommandé)
- **465** + SSL → `SMTP_PORT=465` (secure auto si 465)
- **25** souvent bloqué chez les hébergeurs cloud

## 4. Test

1. Ouvre le site déployé
2. Remplis « Demander une démo »
3. Vérifie la boîte `contact@lecorrespondant.ci` / `contact@sms-ci.net`
4. Le **Reply-To** de l'email est l'adresse du prospect

## 5. Dépannage

- Erreur « Configuration SMTP manquante » → variables non définies sur Vercel (Production)
- Timeout / auth fail → vérifie host, port, user, pass (parfois besoin du mot de passe d'application)
- Redeploy après ajout des variables d'environnement
