# LE CORRESPONDANT — Site marketing

Version 2.0 · Cabinet SMS · Livraison du 29 septembre 2026

Le site reprend la direction graphique validée : bleu et magenta, ancien logo bouclier, scènes professionnelles ivoiriennes, captures réelles de l’application avec données fictives.

## Démarrage rapide

1. Décompressez l’archive.
2. Lisez **GUIDE-DEPLOIEMENT.md** pour publier sur Vercel et configurer l’envoi des demandes.
3. Le dossier **public/** contient le site complet et les images.

Pour le voir sur votre ordinateur avec Node.js 22 ou ultérieur :

```sh
npm ci
npm run dev
```

Ouvrez http://127.0.0.1:3000. Sans configuration SMTP, le site s’affiche normalement, mais le formulaire indique qu’il est indisponible. Il ne simule pas un envoi réussi.

## Contenu

- `public/index.html` : page d’accueil et formulaire.
- `public/styles.css` : charte et adaptation aux écrans.
- `public/app.js` : navigation mobile, onglets accessibles au clavier, agrandissement des captures, animations et formulaire.
- `public/assets/` : logo, photographies WebP, quatre captures du logiciel.
- `public/cgu.html` : texte des CGU de la plateforme repris de votre ancien site, nouvelle présentation.
- `public/confidentialite.html` et `public/cookies.html` : notices du site vitrine adaptées à son fonctionnement.
- `api/demo.js` et `lib/demo-handler.js` : réception et transmission des demandes par e-mail.
- `tests/` : tests du formulaire serveur.
- `vercel.json` : déploiement, routes et en-têtes.
- `.env.example` : noms des paramètres de messagerie, sans mot de passe.
- `ASSETS.md` : provenance des images et captures.
- `VALIDATION.md` : vérifications et limites.

## Personnalisation

- Couleurs : variables `--blue`, `--magenta`, `--ink` en tête de `public/styles.css`.
- Textes et coordonnées : `public/index.html` et pages de notices.
- Logo : `public/assets/logo.svg`.
- Connexion : le lien reprend `https://platform.lecorrespondant.ci` fourni dans votre site initial.
- Captures : remplacez les quatre PNG en conservant les noms et mettez à jour leurs légendes si nécessaire.
- Destinataire des demandes : `SMTP_TO`, dans les paramètres Vercel.

## Vérification

```sh
npm run build
npm test
```

Le site est statique et n’exige pas de compilation pour s’afficher. La commande de build vérifie ses fichiers et ses liens. Le seul paquet d’exécution est Nodemailer, utilisé côté serveur pour les e-mails. Aucune bibliothèque, police ou photographie n’est chargée depuis un service tiers par le navigateur.

Les fichiers du logiciel SaaS, sa base de données, ses identifiants, l’historique Git et les anciens secrets ne sont pas inclus.
