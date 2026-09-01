# DressCode

<div align="center">

**[Français](#français)** · **[English](#english)**

</div>

---

## Français

### 📋 Présentation

Bienvenue sur le code source de **DressCode**. Développeur Full Stack, j'avais envie d'explorer l'écosystème e-commerce moderne, alors j'ai construit cette boutique en ligne de A à Z. C'est une application Next.js 16 qui intègre des solutions robustes : **Clerk** pour une authentification sans friction, **Sanity** comme CMS headless pour gérer le catalogue de produits, et **Stripe** pour le traitement sécurisé des paiements.

### 📑 Les pages

| Route | Ce qu'on y trouve |
| --- | --- |
| `/` (Accueil) | Une vitrine avec les promotions en cours, les catégories, et une grille de produits |
| `/product/[slug]` | La fiche détaillée d'un article, son prix, et l'ajout au panier |
| `/categories/[slug]` | Un filtre dynamique pour naviguer facilement parmi les produits d'une catégorie |
| `/search` | Un moteur de recherche pour trouver rapidement un article précis |
| `/basket` | Le panier d'achat, géré localement avec Zustand pour plus de rapidité avant le paiement |
| `/success` | La page de confirmation post-paiement, qui vide le panier au passage |
| `/orders` | L'historique des commandes, accessible uniquement aux utilisateurs connectés |
| `/studio` | Le back-office d'administration (Sanity Studio) embarqué directement dans l'application |

### 💳 Paiements & Webhooks

Afin de garantir une sécurité maximale, tout le processus de paiement est délégué à Stripe Checkout. Une fois le paiement validé, un webhook sécurisé écoute les événements de Stripe et se charge de créer la commande correspondante directement dans le CMS Sanity.

### 📦 Gestion du contenu

Le catalogue entier vit sur Sanity (v6), ce qui permet d'ajouter des produits ou lancer des soldes sans toucher au code. Les requêtes sont optimisées via les API de cache de Next.js pour que les pages se chargent instantanément tout en conservant des données à jour.

### 🛡️ Sécurité & Validation

L'application utilise **Zod** comme rempart de sécurité au moment de l'exécution (Runtime). Les variables d'environnement sont strictement vérifiées au démarrage (évitant les crashs silencieux en production) et les actions sensibles, comme la création d'une session de paiement, sont validées pour s'assurer que les données reçues correspondent parfaitement aux attentes du serveur.

### 🛠 Stack technique

| Catégorie | Technologies |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Langage | TypeScript |
| Package manager | Bun |
| Styling | Tailwind CSS v4 |
| CMS & Back-office | Sanity v6 |
| Authentification | Clerk (Core 3) |
| Paiement & Webhooks | Stripe |
| State Management | Zustand |
| Validation de Données | Zod |
| UI & Icônes | shadcn/ui, Lucide React |
| Tests | Vitest + React Testing Library |

### 📁 Structure du projet

```
dresscode-ecommerce/
├── actions/                     # Actions côté serveur (ex: créer la session Stripe)
├── src/
│   ├── app/
│   │   ├── (store)/             # Ce que le client voit (Accueil, Panier, Commandes...)
│   │   ├── api/
│   │   │   └── webhook/         # Point d'entrée pour les événements Stripe
│   │   ├── studio/              # Le panneau d'administration Sanity
│   │   └── globals.css          # Styles globaux et variables Tailwind v4
│   ├── components/              # Composants UI réutilisables (Header, ProductGrid...)
│   ├── lib/                     # Utilitaires (formatage prix, configuration Stripe)
│   ├── sanity/                  # Configuration du CMS
│   │   ├── schemaTypes/         # Structure des Produits, Commandes, etc.
│   │   └── lib/                 # Logique de récupération des données
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

Welcome to the source code of **DressCode**. As a Full Stack developer, I wanted to explore the modern e-commerce ecosystem, so I built this online store from scratch. It's a Next.js 16 app integrating robust solutions: **Clerk** for frictionless authentication, **Sanity** as a headless CMS to manage the product catalog, and **Stripe** for secure payment processing.

### 📑 Pages

| Route | What's there |
| --- | --- |
| `/` (Home) | A storefront featuring active promotions, categories, and a product grid |
| `/product/[slug]` | A detailed product page with pricing and the add-to-cart action |
| `/categories/[slug]` | A dynamic filter to easily browse items within a specific category |
| `/search` | A search engine to quickly find a specific item |
| `/basket` | The shopping cart, managed locally with Zustand for speed before checkout |
| `/success` | The post-payment confirmation page, which clears the cart |
| `/orders` | Order history, accessible only to logged-in users |
| `/studio` | The administration back-office (Sanity Studio) embedded directly into the app |

### 💳 Payments & Webhooks

To ensure maximum security, the entire payment process is delegated to Stripe Checkout. Once a payment is successful, a secure webhook listens to Stripe events and handles creating the corresponding order directly inside the Sanity CMS.

### 📦 Content Management

The entire catalog lives on Sanity (v6), allowing me to add products or run sales without touching the code. Data fetching is optimized using Next.js caching APIs so pages load instantly while keeping the data fresh.

### 🛡️ Security & Validation

The application uses **Zod** as a security gatekeeper at runtime. Environment variables are strictly parsed upon startup (preventing silent crashes in production) and sensitive server actions, like generating a checkout session, are validated to ensure incoming data perfectly matches the server's expectations.

### 🛠 Tech stack

| Category | Technologies |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Package manager | Bun |
| Styling | Tailwind CSS v4 |
| CMS & Back-office | Sanity v6 |
| Authentication | Clerk (Core 3) |
| Payments & Webhooks | Stripe |
| State Management | Zustand |
| Data Validation | Zod |
| UI & Icons | shadcn/ui, Lucide React |
| Testing | Vitest + React Testing Library |

### 📁 Project structure

```
dresscode-ecommerce/
├── actions/                     # Server actions (e.g., creating a Stripe session)
├── src/
│   ├── app/
│   │   ├── (store)/             # What the end user sees (Home, Cart, Orders...)
│   │   ├── api/
│   │   │   └── webhook/         # Endpoint for Stripe events
│   │   ├── studio/              # The Sanity admin panel
│   │   └── globals.css          # Global styles and Tailwind v4 variables
│   ├── components/              # Reusable UI components (Header, ProductGrid...)
│   ├── lib/                     # Utilities (price formatting, Stripe config)
│   ├── sanity/                  # CMS configuration
│   │   ├── schemaTypes/         # Structure of Products, Orders, etc.
│   │   └── lib/                 # Data fetching logic
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
