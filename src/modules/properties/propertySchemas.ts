import { z } from 'zod';

export const propertyListQuerySchema = z.object({
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  priceType: z.enum(['sale', 'rent']).optional(),
  priceRange: z.string().optional(),
  query: z.string().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  parkingSpaces: z.coerce.number().int().min(0).optional(),
  brokerOnly: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((value) => value === true || value === 'true')
    .optional(),
  sort: z.enum(['premium', 'newest', 'price-asc', 'price-desc', 'most-viewed']).default('premium')
});

export const draftSchema = z.object({
  title: z.string().min(3),
  price: z.coerce.number().int().positive(),
  priceType: z.enum(['sale', 'rent']),
  city: z.string().min(2),
  citySlug: z.string().optional(),
  neighborhood: z.string().min(2),
  neighborhoodSlug: z.string().optional(),
  address: z.string().optional(),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  area: z.coerce.number().int().positive(),
  parkingSpaces: z.coerce.number().int().min(0),
  images: z.array(z.string().url()).default([]),
  description: z.string().min(10),
  features: z.array(z.string()).default([]),
  advertiser: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    type: z.enum(['broker', 'owner']).default('owner'),
    avatar: z.string().url().optional(),
    creci: z.string().optional(),
    isVerified: z.boolean().default(false)
  })
});

export const metricBodySchema = z.object({
  metadata: z.record(z.unknown()).optional()
});
