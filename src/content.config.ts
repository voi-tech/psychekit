import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const optionSchema = z.object({ id: z.string(), score: z.number(), label: z.string() });
const itemSchema = z.object({ id: z.string(), text: z.string(), optionSet: z.string(), reversed: z.boolean().optional() });
const bandSchema = z.object({ min: z.number().int(), max: z.number().int(), label: z.string() });
const scaleSchema = z.object({
  id: z.string(), title: z.string(), aggregation: z.enum(["sum", "mean"]), items: z.array(z.string()),
  range: z.object({ min: z.number(), max: z.number() }), bands: z.array(bandSchema),
});

const instrumentSchema = z.object({
  id: z.string(), title: z.string(), subtitle: z.string(), language: z.string(), definitionVersion: z.string(),
  estimatedMinutes: z.number().int().positive(), license: z.string(), disclaimer: z.string(),
  sources: z.array(z.string().refine((value) => /^https?:\/\//.test(value), "Expected an HTTP source URL")), optionSets: z.record(z.string(), z.object({ id: z.string(), options: z.array(optionSchema) })),
  items: z.array(itemSchema), scales: z.array(scaleSchema),
  safetySignals: z.array(z.object({ id: z.string(), item: z.string(), when: z.object({ scoreGte: z.number() }), message: z.string().optional() })).default([]),
});

const licenseSchema = z.object({
  id: z.string(), class: z.enum(["public-domain", "unrestricted", "attribution", "noncommercial", "proprietary"]),
  status: z.enum(["verified", "pending"]), holder: z.string(), source: z.string().refine((value) => /^https?:\/\//.test(value), "Expected an HTTP source URL"), verifiedAt: z.string(),
  permissions: z.object({ redistribution: z.boolean(), modification: z.boolean(), translation: z.boolean(), commercialUse: z.boolean(), electronicAdministration: z.boolean() }),
  translation: z.object({ type: z.enum(["original", "official", "adaptation", "none"]), language: z.string(), source: z.string().refine((value) => /^https?:\/\//.test(value), "Expected an HTTP source URL").optional() }),
  notes: z.string().optional(),
});

export const collections = {
  instrumenty: defineCollection({ loader: glob({ pattern: "**/*.md", base: "./src/content/instrumenty" }), schema: instrumentSchema }),
  licencje: defineCollection({ loader: glob({ pattern: "**/*.{yaml,yml}", base: "./src/content/licencje" }), schema: licenseSchema }),
};
