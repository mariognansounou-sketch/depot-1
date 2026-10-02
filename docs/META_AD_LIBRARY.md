# Meta Ad Library — accès légal et limites techniques

AdWinner OS n'accède **jamais** à `facebook.com/ads/library` par scraping automatisé. C'est
interdit par les conditions d'utilisation de Meta et techniquement fragile (protections
anti-bot). À la place, l'application utilise exclusivement deux sources conformes,
implémentées derrière le port `AdSourcePort` (`src/core/ports/ad-source.port.ts`) :

## 1. Meta Ad Library API (officielle)

`src/infrastructure/ad-sources/meta-ad-library-source.ts`

C'est l'API publique que Meta publie spécifiquement pour cet usage :
https://www.facebook.com/ads/library/api

**Prérequis** :
- Un compte développeur Meta, avec une app ayant un rôle (Administrateur/Développeur/Testeur)
  assigné à l'utilisateur dont le token est utilisé.
- ⚠️ **Vérification d'identité Meta obligatoire** — confirmé en conditions réelles (pas
  seulement documenté sur le papier) : même une simple recherche `ad_type=ALL` sur des
  publicités e-commerce classiques échoue avec une `OAuthException` (code 10) tant que le
  compte n'a pas suivi le processus de vérification décrit sur
  https://www.facebook.com/ads/library/api. Un rôle Admin sur l'app ne suffit pas à lui
  seul (erreur observée : `error_subcode 2332004` "App role required" avec un token
  d'application ; `error_subcode 2332002` "Autorisation et informations de connexion
  requises" même avec un token utilisateur Admin, tant que la vérification n'est pas
  faite). Ce point corrige une hypothèse initiale trop optimiste : on pensait que seule la
  donnée `spend`/`impressions` des pubs politiques nécessitait cette vérification — en
  pratique Meta verrouille l'accès à l'endpoint entier derrière elle.
- Un `access_token` valide (utilisateur ou application), renseigné dans
  `META_AD_LIBRARY_ACCESS_TOKEN`.

**Limites connues (documentées, jamais masquées à l'utilisateur)** :
- Les champs `spend` (dépense) et `impressions` ne sont publiés par Meta **que pour les
  publicités à caractère social, électoral ou politique** — jamais pour une publicité
  e-commerce standard. AdWinner OS ne prétend donc jamais exposer une dépense publicitaire
  qu'il n'a pas.
- Les publicités trop anciennes sortent de l'archive plus vite pour les annonceurs
  commerciaux que pour les annonceurs politiques.
- Des quotas de taux s'appliquent (rate limiting Meta). Les résultats sont donc mis en
  cache via `SearchHistory` plutôt que re-requêtés à l'identique.
- La recherche par mot-clé (`ads_archive`) ne garantit pas un lookup direct par URL de
  publicité individuelle ; la résolution par ID d'archive interroge le nœud Graph API
  correspondant.

## 2. Saisie manuelle (fallback toujours disponible)

`src/infrastructure/ad-sources/manual-ad-input-source.ts`

Quand l'API n'est pas configurée, ou qu'une publicité précise n'est pas atteignable via
l'API, l'utilisateur colle lui-même les données publiques qu'il a sous les yeux
(Gestionnaire de publicités, page publique de la bibliothèque). Aucun accès automatisé aux
systèmes de Meta n'a lieu ici — c'est toujours légal et toujours disponible, y compris en
environnement de développement sans token.

## Sélection automatique de la source

`src/infrastructure/ad-sources/ad-source.factory.ts` retourne la source Meta Ad Library API
si `META_AD_LIBRARY_ACCESS_TOKEN` est défini, sinon bascule silencieusement sur la saisie
manuelle. Les use-cases (`SearchWinningProductsUseCase`, `AnalyzeCompetitorUseCase`) ne
connaissent jamais la source active — c'est un détail d'infrastructure interchangeable.

## Alternatives envisagées et écartées

- **Scraping headless (Puppeteer/Playwright) de la page publique** : rejeté — viole les
  CGU de Meta, fragile face aux évolutions du DOM et aux protections anti-bot.
- **API tierces non officielles** : rejetées — pas de garantie de conformité légale ni de
  stabilité.
- **Extension navigateur captant les données affichées à l'utilisateur** : piste robuste et
  conforme (l'utilisateur ne récupère que ce qu'il voit déjà), documentée ici comme
  évolution possible du mode "saisie manuelle" pour réduire la friction, mais non
  implémentée dans cette itération.
