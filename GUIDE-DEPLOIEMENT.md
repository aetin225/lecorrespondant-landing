# Déployer le site sur Vercel

## 1. Préparer le dossier

Décompressez l’archive et ouvrez le dossier `le-correspondant-site`. Le fichier `package.json` et le dossier `api` doivent être à la racine du projet importé.

Le projet cible Node.js 22 ou ultérieur. Si vous réutilisez le projet Vercel de l’ancien site, remplacez les fichiers de son dépôt par ceux de ce dossier. Ne conservez pas l’ancien `api/demo.js` ni son ancien `vercel.json`.

**Le mot de passe SMTP présent en clair dans l’ancien code doit être renouvelé auprès de votre fournisseur de messagerie. Il n’a pas été repris dans cette livraison.**

## 2. Paramètres du projet

Importez le dépôt dans Vercel, ou déployez le dossier avec la CLI officielle Vercel. Le fichier `vercel.json` fournit :

| Réglage | Valeur |
| --- | --- |
| Framework Preset | Other |
| Build Command | `npm run build` |
| Output Directory | `public` |
| Install Command | `npm ci` ou détection automatique |
| Root Directory | dossier contenant `package.json` |

Si vous réutilisez un projet Vercel, vérifiez que d’anciens réglages ne forcent pas une autre sortie ou une autre commande. Le dossier `api/` doit rester au même niveau que `public/`, pas à l’intérieur.

## 3. Activer le formulaire

Dans **Project → Settings → Environment Variables**, renseignez les valeurs pour **Production**, puis redéployez :

| Variable | Valeur à fournir |
| --- | --- |
| `SITE_URL` | origine publique exacte, par exemple `https://lecorrespondant.ci`, sans chemin |
| `SMTP_HOST` | serveur fourni par votre prestataire de messagerie |
| `SMTP_PORT` | `465` (TLS direct) ou `587` (STARTTLS obligatoire) |
| `SMTP_USER` | identifiant SMTP |
| `SMTP_PASS` | nouveau mot de passe SMTP |
| `SMTP_FROM` | adresse e-mail autorisée comme expéditeur |
| `SMTP_TO` | une ou plusieurs adresses destinataires, séparées par une virgule |

Valeurs prévues dans l’exemple : expéditeur `contact@lecorrespondant.ci` et destinataire `contact@sms-ci.net`. Vérifiez-les auprès de votre prestataire. `SMTP_PASSWORD` reste accepté si votre ancien projet emploie ce nom, mais `SMTP_PASS` est prioritaire.

Ne saisissez jamais de mot de passe dans le HTML, dans les scripts du navigateur ou dans le dépôt. Le serveur SMTP doit présenter un certificat TLS valide. Les versions de prévisualisation Vercel sont reconnues via leurs variables système ; n’activez leur envoi qu’avec les paramètres de messagerie souhaités.

L’absence de configuration ne bloque pas la publication du site. Le formulaire affichera alors une indisponibilité et proposera le contact par e-mail.

## 4. Publier

Depuis Vercel : lancez le déploiement du dépôt importé.

Alternative en terminal, après installation de la CLI officielle et authentification :

```sh
npm ci
npm run build
npm test
vercel --prod
```

La livraison ZIP ne publie pas automatiquement de site et ne change pas vos DNS.

## 5. Vérifier la messagerie après publication

Ouvrez votre site, saisissez une demande de test avec votre propre adresse, puis vérifiez sa réception par le destinataire configuré. La confirmation à l’écran apparaît après acceptation du message par le serveur SMTP ; elle ne garantit pas son classement en boîte de réception. Le message peut être filtré par le fournisseur du destinataire.

Le formulaire ne répond pas automatiquement par e-mail au visiteur. Le Cabinet reçoit la demande avec l’adresse du visiteur en `Reply-To`, et peut lui répondre directement.

En cas d’erreur : vérifiez le serveur, le port, les identifiants, le certificat et les règles de votre fournisseur SMTP. Les messages d’erreur détaillés ou les secrets ne sont jamais renvoyés au navigateur.

## 6. Informations de publication

- La page confidentialité décrit le formulaire du site vitrine ; les CGU de la plateforme sont reprises du document initial. Confirmez avec le Cabinet les mentions opérationnelles, la durée de conservation des contacts (trois ans dans le texte initial) et les prestataires réellement retenus.
- L’ancien engagement d’un hébergement exclusivement ivoirien n’est pas repris pour ce site destiné à Vercel.
- Aucune statistique commerciale, certification ou liste de clients n’a été inventée.
- Les images humaines sont des illustrations générées par IA ; les captures proviennent du logiciel et contiennent uniquement des données fictives.
- Le contrôle anti-abus comprend validation, champ piège, vérification de l’origine et limitation en mémoire. Cette dernière est propre à chaque instance ; pour des quotas partagés ou une forte exposition au spam, configurez les protections de l’hébergeur.

## Autre hébergement

Le dossier `public/` peut être servi par tout hébergement statique. L’envoi via `/api/demo` exige toutefois un service Node.js compatible : il n’est pas disponible en copiant uniquement `public/` sur un hébergement statique. Le ZIP est configuré pour Vercel.

## Références officielles

- Fonctions Node.js Vercel : https://vercel.com/docs/functions/runtimes/node-js
- Configuration du projet : https://vercel.com/docs/project-configuration/vercel-json
- Transport SMTP : https://nodemailer.com/smtp
