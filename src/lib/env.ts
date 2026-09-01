import { z } from "zod";

const envSchema = z.object({
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is missing"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(), // Optional if webhook is not always running in dev

  // Base URL
  NEXT_PUBLIC_BASE_URL: z.string().url("NEXT_PUBLIC_BASE_URL must be a valid URL"),

  // Sanity
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1, "Sanity Project ID is missing"),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1, "Sanity Dataset is missing"),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().default("2024-11-07"),
  SANITY_API_READ_TOKEN: z.string().optional(),
  SANITY_API_TOKEN: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_VERCEL_ENV: z.string().optional(),
});

// Parsez `process.env`. Si une clé requise est manquante, Zod jettera une erreur explicite,
// empêchant l'application de démarrer de manière instable.
export const env = envSchema.parse(process.env);
