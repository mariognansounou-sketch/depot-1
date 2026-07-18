# AdWinner OS

L'OS IA pour e-commerçants Facebook Ads : trouvez des produits gagnants, décodez la
stratégie de vos concurrents et créez de meilleures publicités.

## Stack technique

| Domaine | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript strict | SSR/API routes unifiés, un seul déploiement, écosystème mature |
| UI | Tailwind CSS + design system maison (`src/components/ui`) | Contrôle total du look (inspiration ChatGPT/Linear/Stripe), zéro dépendance UI lourde |
| Base de données | PostgreSQL + Prisma | Typage bout-en-bout, migrations versionnées, modèle relationnel adapté aux 15 modules |
| Auth | Auth.js (NextAuth v5), credentials + JWT, rôles (`OWNER/ADMIN/MEMBER`) | Standard, testable, compatible Edge middleware |
| IA | Anthropic Claude via `AIPort` (`src/core/ports/ai.port.ts`) | Sortie structurée forcée par tool-use + validation Zod, jamais de JSON en free-text non validé |
| Données publicitaires | `AdSourcePort` : Meta Ad Library API officielle + saisie manuelle | 100% conforme aux CGU Meta — voir [`docs/META_AD_LIBRARY.md`](./docs/META_AD_LIBRARY.md) |
| Tests | Vitest | Rapide, ESM natif, aucune config lourde |

## Architecture

Clean Architecture en 4 couches, pensée pour que **chaque module évolue indépendamment** :

```
src/
  core/                  # Domaine pur : ports (interfaces), erreurs métier
    ports/               #   AIPort, AdSourcePort — aucune dépendance à un vendor
  infrastructure/        # Implémentations concrètes des ports
    ai/                  #   AnthropicAIProvider (structured output via tool-use)
    ad-sources/          #   MetaAdLibraryApiSource, ManualAdInputSource
    db/                  #   Prisma client singleton
    security/            #   Chiffrement AES-256-GCM des clés API
    logging/              #   Logger structuré JSON
  modules/               # Un dossier par fonctionnalité métier (voir ci-dessous)
    <module>/
      types.ts           #   DTOs du module
      schemas.ts          #   Schémas Zod des réponses IA structurées
      prompts.ts          #   System prompt + builders de prompt
      use-cases/          #   Logique métier, orchestre ports + Prisma
      components/          #   UI React du module
  app/                   # Routes Next.js (pages + API routes), fines : validation → use-case → réponse
  components/            # Design system partagé (ui/) + layout (sidebar, topbar…)
  lib/                   # Utilitaires transverses (validation Zod des requêtes API, constants)
```

Un module ne dépend jamais directement d'un autre module — seulement de `core/` et
`infrastructure/`. Un nouveau module (ex: Module 15 Ecommerce Brain) peut donc être
développé, testé et déployé sans toucher aux modules existants.

### Pourquoi un `AIPort` plutôt qu'un appel direct au SDK Anthropic ?

Chaque module IA (Competitor Analyzer, Angle Finder, Product Validator, et demain Script
Generator, Copywriter, Offer Builder…) a besoin de la même garantie : une réponse JSON
strictement conforme à un schéma métier, jamais un texte libre à parser à la main.
`AnthropicAIProvider.generateStructured()` force le modèle à appeler un outil
(`tool_choice`) dont le schéma est généré depuis le Zod schema de l'appelant, puis
revalide la réponse avec ce même schéma (retry unique en cas d'échec). Changer de vendor
IA plus tard ne touche qu'un fichier.

### Pourquoi un `AdSourcePort` avec deux implémentations ?

Voir [`docs/META_AD_LIBRARY.md`](./docs/META_AD_LIBRARY.md) pour le détail légal. En
résumé : l'API officielle Meta Ad Library quand elle est configurée, sinon une saisie
manuelle toujours disponible — jamais de scraping du site public.

## Modules

| # | Module | Statut | Notes |
|---|---|---|---|
| 1 | Winner Finder | ✅ Complet | Scoring déterministe et explicable (`winner-finder/scoring`) |
| 2 | Competitor Intelligence AI | ✅ Complet | 4 modes d'entrée, analyse IA complète, générateur de stratégie, comparateur |
| 3 | AI Angle Marketing Finder | ✅ Complet | Réutilise le moteur du Module 2 |
| 4 | Creative Analyzer | 🚧 Scaffoldé | Modèle de données prêt (`CreativeAnalysis`) |
| 5 | Product Validator | ✅ Complet | Score 5 critères /20, décision LAUNCH/TEST/AVOID |
| 6 | Market Opportunity Score | 🚧 Scaffoldé | Modèle de données prêt |
| 7 | Saturation Detector | 🚧 Scaffoldé | Modèle de données prêt |
| 8 | Script Generator | 🚧 Scaffoldé | Modèle de données prêt |
| 9 | Copywriter E-commerce | 🚧 Scaffoldé | Modèle de données prêt |
| 10 | Offer Builder | 🚧 Scaffoldé | Modèle de données prêt |
| 11 | Audience Finder | 🚧 Scaffoldé | Modèle de données prêt |
| 12 | Comment Analyzer | 🚧 Scaffoldé | Logique déjà présente par publicité dans le Module 2 |
| 13 | WhatsApp Sales Assistant | 🚧 Scaffoldé | Modèle de données prêt |
| 14 | Supplier Finder | 🚧 Scaffoldé | Modèle de données prêt |
| 15 | Personal Ecommerce Brain | 🚧 Scaffoldé | Modèle de données prêt |

Les modules 🚧 ont leur schéma de base de données, leurs routes de navigation et une page
d'attente premium déjà en place — l'implémentation IA suit le même patron que les modules
✅ (port → use-case → schéma Zod → route → UI).

## Démarrage local

```bash
cp .env.example .env.local
# renseigner DATABASE_URL, AUTH_SECRET, ANTHROPIC_API_KEY, ENCRYPTION_KEY au minimum

npm install
npm run db:push      # ou db:migrate en environnement versionné
npm run db:seed       # crée un compte de démo
npm run dev
```

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run typecheck` | Vérification TypeScript stricte |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run db:studio` | Explorateur de base de données Prisma |

## Sécurité

- Mots de passe hashés avec bcrypt (12 rounds).
- Clés API tierces chiffrées au repos (AES-256-GCM, `ENCRYPTION_KEY`).
- Toute entrée d'API est validée avec Zod avant d'atteindre la couche métier.
- Middleware Edge séparé de la logique Node (bcrypt) — voir `src/modules/auth/auth.config.ts`
  vs `auth.ts`.
- Rôles (`OWNER/ADMIN/MEMBER`) portés par le modèle `User`, prêts pour une gestion d'équipe.
