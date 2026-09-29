# Vérifications de livraison

- Contrôle de présence des pages, images, liens internes et ancres : réussi.
- 13 tests serveur : réussis (champs obligatoires, accord de contact, adresse e-mail, tailles, types, injection HTML et en-têtes, origine, méthode, format, anti-spam, absence de configuration, erreur SMTP, destinataire refusé, limitation et TLS).
- Contrôle dans Chrome : affichage à 320, 375, 768, 1024 et 1440 pixels sans débordement horizontal.
- Images : chargement vérifié, captures et photographies inspectées.
- Interactions : onglets, touches fléchées, agrandissement des captures, fermeture par Échap, menu mobile et ancres vérifiés.
- Formulaire : confirmation testée avec réponse serveur simulée ; erreur réelle testée avec le serveur local non configuré. Les champs restent renseignés en cas d’échec.
- Pages de confidentialité, cookies et CGU : accessibles. Route inexistante : réponse 404.
- Dépendance installée et audit npm : aucune vulnérabilité signalée au moment de la livraison.

## Limites

Le site n’a pas été publié dans votre compte Vercel et aucun e-mail réel n’a été envoyé. La connexion à votre messagerie doit être vérifiée après renseignement des variables SMTP. Les tests serveur utilisent un transport simulé, sans solliciter vos destinataires.

Cette livraison porte sur le site marketing, pas sur un audit de sécurité ou de conformité de l’application SaaS. Les captures reproduisent ses composants avec des données fictives. Les CGU de la plateforme reprennent votre texte initial ; elles n’ont pas fait l’objet d’une validation juridique.
