# DressCode

<div align="center">

**[Français](#français)** · **[English](#english)**

</div>

---

## Français

### 📋 Présentation

Bienvenue sur le code source de **DressCode**. Développeur Full Stack, j'avais envie d'explorer l'écosystème e-commerce moderne, alors j'ai construit cette boutique en ligne de A à Z. C'est une application Next.js 16 qui intègre des solutions robustes : **Clerk** pour une authentification sans friction, **Sanity** comme CMS headless pour gérer le catalogue de produits, **Stripe** pour le traitement sécurisé des paiements, et une **internationalisation native (FR / EN)** complète.

### 🌐 Internationalisation (i18n)

L'application supporte nativement et dynamiquement le français et l'anglais :
- **Bascule instantanée** : Sélecteur de langue dans l'en-tête alimenté par un `LanguageContext` et `next-intl`.
- **Traductions exhaustives** : Navigation, bannières, fiche produit, panier, processus de paiement et page de confirmation.
- **Clerk bilingue** : Les modales et composants d'authentification Clerk s'adaptent instantanément à la langue sélectionnée (`frFR` / `enUS`).
- **Stripe Checkout localisé** : La langue active de l'utilisateur est transmise à la session Stripe Checkout pour un paiement dans sa langue.

### 📑 Les pages

| Route | Ce qu'on y trouve |
| --- | --- |
| `/` (Accueil) | Vitrine avec bannière promotionnelle réactive (soldes saisonnières FR/EN), catégories et grille de produits |
| `/product/[slug]` | Fiche détaillée d'un article, sélection dynamique des tailles disponibles et ajout au panier |
| `/categories/[slug]` | Filtre dynamique pour naviguer facilement parmi les produits d'une catégorie |
| `/search` | Moteur de recherche pour trouver rapidement un article précis avec filtres par badges |
| `/basket` | Panier d'achat (Zustand) avec carte de test Stripe intégrée (copie 1-clic) et modal de confirmation de suppression |
| `/success` | Page de confirmation post-paiement bilingue avec numéro de commande centré |
| `/orders` | Historique des commandes, accessible uniquement aux utilisateurs connectés |
| `/studio` | Back-office d'administration (Sanity Studio) embarqué directement dans l'application |

### 💳 Paiements & Webhooks

Afin de garantir une sécurité maximale, tout le processus de paiement est délégué à Stripe Checkout. Une fois le paiement validé, un webhook sécurisé écoute les événements de Stripe et se charge de créer la commande correspondante directement dans le CMS Sanity. Sur la page panier, une carte de test Stripe stylisée noir & blanc avec copie en un clic est mise à disposition pour tester les paiements en mode sandbox en toute simplicité.

### 📦 Gestion du contenu & Promotions

Le catalogue entier vit sur Sanity (v6), ce qui permet d'ajouter des produits ou lancer des soldes sans toucher au code. Les coupons de réduction (ex: `HIVER` / `WINTER`, `BFRIDAY`) sont validés et typés avec TypeScript pour éviter toute incohérence.

### 🛡️ Sécurité & Validation

L'application utilise **Zod** comme rempart de sécurité au moment de l'exécution (Runtime). Les variables d'environnement sont strictement vérifiées au démarrage (évitant les crashs silencieux en production) et les actions sensibles, comme la création d'une session de paiement, sont validées pour s'assurer que les données reçues correspondent parfaitement aux attentes du serveur.

### 🛠 Stack technique

| Catégorie | Technologies |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Langage | TypeScript |
| Package manager | Bun |
| Styling | Tailwind CSS v4 |
| Internationalisation | next-intl + Custom LanguageContext |
| CMS & Back-office | Sanity v6 |
| Authentification | Clerk (Core 3 avec localisation FR/EN) |
| Paiement & Webhooks | Stripe Checkout |
| State Management | Zustand |
| Validation de Données | Zod |
| UI & Icônes | shadcn/ui, Lucide React |
| Tests | Vitest + React Testing Library |

### 📁 Structure du projet

```
dresscode-ecommerce/
├── actions/                     # Actions côté serveur (ex: créer la session Stripe localisée)
├── messages/                    # Catalogues de traduction (fr.json, en.json)
├── public/                      # Assets statiques & Favicon SVG officiel squircle
├── src/
│   ├── app/
│   │   ├── (store)/             # Ce que le client voit (Accueil, Panier, Commandes...)
│   │   ├── api/
│   │   │   └── webhook/         # Point d'entrée pour les événements Stripe
│   │   ├── studio/              # Le panneau d'administration Sanity
│   │   ├── icon.svg             # Favicon SVG moderne Next.js
│   │   └── globals.css          # Styles globaux et variables Tailwind v4
│   ├── components/              # Composants UI (Header, BannerClient, BottomNav, ProductDetailClient...)
│   ├── context/                 # LanguageContext pour la gestion de la langue & Clerk provider
│   ├── i18n/                    # Configuration des requêtes i18n
│   ├── lib/                     # Utilitaires (formatage prix, configuration Stripe)
│   ├── sanity/                  # Configuration du CMS & schémas (couponCodes typés)
│   └── proxy.ts                 # Middleware pour la protection des routes (Clerk)
├── .env.local                   # Variables d'environnement (Stripe, Sanity, Clerk)
├── package.json
└── README.md
```

### 🚀 Pour lancer le projet

```bash
git clone <url-du-repo>
cd dresscode-ecommerce

bun install
bun run dev
```

Direction [http://localhost:3000](http://localhost:3000).

> 💡 Le projet nécessite un fichier `.env.local` configuré avec vos propres clés API pour **Clerk**, **Sanity** et **Stripe** afin de fonctionner.

### À propos de moi

Je suis Ruddy Autem, développeur Full Stack. Si le code vous inspire ou que vous voulez discuter, n'hésitez pas — vous me trouverez sur [autem.dev](https://autem.dev) ou [GitHub](https://github.com/ruddyautem).

---

## English

### 📋 Overview

Welcome to the source code of **DressCode**. As a Full Stack developer, I wanted to explore the modern e-commerce ecosystem, so I built this online store from scratch. It's a Next.js 16 app integrating robust solutions: **Clerk** for frictionless authentication, **Sanity** as a headless CMS to manage the product catalog, **Stripe** for secure payment processing, and **full native internationalization (FR / EN)**.

### 🌐 Internationalization (i18n)

The app natively and dynamically supports French and English:
- **Instant Switching**: Language toggle in the header backed by a `LanguageContext` and `next-intl`.
- **Comprehensive Translations**: Navigation, promotional banners, product details, shopping cart, checkout flow, and confirmation screen.
- **Bilingual Clerk**: Authentication popovers and user profile modals dynamically adapt to the selected locale (`frFR` / `enUS`).
- **Localized Stripe Checkout**: The active user language is forwarded to the Stripe Checkout session for a native localized payment experience.

### 📑 Pages

| Route | What's there |
| --- | --- |
| `/` (Home) | Storefront with responsive promo banner (seasonal sales in FR/EN), categories, and product grid |
| `/product/[slug]` | Detailed product page with dynamic available size parsing and add-to-cart action |
| `/categories/[slug]` | Dynamic category filtering with horizontal pill scrolling on mobile |
| `/search` | Search engine to quickly find items with badge filters |
| `/basket` | Shopping cart (Zustand) with integrated B&W Stripe test card box (1-click copy) and delete confirmation modal |
| `/success` | Bilingual post-payment confirmation page with centered order identifier |
| `/orders` | Order history, accessible only to logged-in users |
| `/studio` | Administration back-office (Sanity Studio) embedded directly into the app |

### 💳 Payments & Webhooks

To ensure maximum security, the entire payment process is delegated to Stripe Checkout. Once a payment is successful, a secure webhook listens to Stripe events and handles creating the corresponding order directly inside the Sanity CMS. On the basket page, a sleek black-and-white Stripe test card box with 1-click copy allows seamless testing in sandbox mode.

### 📦 Content Management & Sales

The entire catalog lives on Sanity (v6), allowing you to add products or run sales without touching the code. Discount coupon codes (e.g. `HIVER` / `WINTER`, `BFRIDAY`) are strictly typed in TypeScript to prevent runtime errors.

### 🛡️ Security & Validation

The application uses **Zod** as a security gatekeeper at runtime. Environment variables are strictly parsed upon startup (preventing silent crashes in production) and sensitive server actions, like generating a checkout session, are validated to ensure incoming data perfectly matches the server's expectations.

### 🛠 Tech stack

| Category | Technologies |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Package manager | Bun |
| Styling | Tailwind CSS v4 |
| Internationalization | next-intl + Custom LanguageContext |
| CMS & Back-office | Sanity v6 |
| Authentication | Clerk (Core 3 with FR/EN localization) |
| Payments & Webhooks | Stripe Checkout |
| State Management | Zustand |
| Data Validation | Zod |
| UI & Icons | shadcn/ui, Lucide React |
| Testing | Vitest + React Testing Library |

### 📁 Project structure

```
dresscode-ecommerce/
├── actions/                     # Server actions (e.g., creating localized Stripe sessions)
├── messages/                    # Translation catalogs (fr.json, en.json)
├── public/                      # Static assets & official squircle SVG favicon
├── src/
│   ├── app/
│   │   ├── (store)/             # What the end user sees (Home, Cart, Orders...)
│   │   ├── api/
│   │   │   └── webhook/         # Endpoint for Stripe events
│   │   ├── studio/              # The Sanity admin panel
│   │   ├── icon.svg             # Modern Next.js SVG favicon
│   │   └── globals.css          # Global styles and Tailwind v4 variables
│   ├── components/              # UI components (Header, BannerClient, BottomNav, ProductDetailClient...)
│   ├── context/                 # LanguageContext for state & dynamic Clerk provider
│   ├── i18n/                    # i18n request configuration
│   ├── lib/                     # Utilities (price formatting, Stripe config)
│   ├── sanity/                  # CMS configuration & schemas (typed couponCodes)
│   └── proxy.ts                 # Route protection middleware (Clerk)
├── .env.local                   # Environment variables (Stripe, Sanity, Clerk)
├── package.json
└── README.md
```

### 🚀 Running it locally

```bash
git clone <repo-url>
cd dresscode-ecommerce

bun install
bun run dev
```

Then head to [http://localhost:3000](http://localhost:3000).

> 💡 The project requires a `.env.local` file configured with your own API keys for **Clerk**, **Sanity**, and **Stripe** to function properly.

### About me

I'm Ruddy Autem, a Full Stack developer. If the code speaks to you or you just want to say hi, feel free — you'll find me at [autem.dev](https://autem.dev) or on [GitHub](https://github.com/ruddyautem).
