import { z } from 'zod';

const booleanParamSchema = z
  .union([z.literal('true'), z.literal('false'), z.boolean()])
  .transform((value) => value === true || value === 'true');

const optionalNumberParamSchema = z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  z.coerce.number().int().min(0).optional()
);

const featuresParamSchema = z.preprocess((value) => {
  if (Array.isArray(value)) return value.flatMap((item) => String(item).split(','));
  if (typeof value === 'string') return value.split(',');
  return undefined;
}, z.array(z.string().min(1)).optional());

export const propertyListQuerySchema = z
  .object({
    city: z.string().optional(),
    neighborhood: z.string().optional(),
    priceType: z.enum(['sale', 'rent']).optional(),
    type: z.enum(['sale', 'rent']).optional(),
    priceRange: z.string().optional(),
    price: z.string().optional(),
    query: z.string().optional(),
    q: z.string().optional(),
    bedrooms: optionalNumberParamSchema,
    parkingSpaces: optionalNumberParamSchema,
    parking: optionalNumberParamSchema,
    brokerOnly: booleanParamSchema.optional(),
    features: featuresParamSchema,
    sort: z.enum(['premium', 'newest', 'price-asc', 'price-desc', 'most-viewed']).default('premium')
  })
  .transform((query) => ({
    city: query.city,
    neighborhood: query.neighborhood,
    priceType: query.priceType ?? query.type,
    priceRange: query.priceRange ?? query.price,
    query: query.query ?? query.q,
    bedrooms: query.bedrooms,
    parkingSpaces: query.parkingSpaces ?? query.parking,
    brokerOnly: query.brokerOnly,
    features: query.features,
    sort: query.sort
  }));

const draftBaseSchema = z.object({
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
  advertiser: z
    .object({
      name: z.string().min(2),
      phone: z.string().min(8),
      type: z.enum(['broker', 'owner']).default('owner'),
      avatar: z.string().url().optional(),
      creci: z.string().optional(),
      isVerified: z.boolean().default(false)
    })
    .optional(),
  advertiserName: z.string().min(2).optional(),
  advertiserPhone: z.string().min(8).optional(),
  advertiserType: z.enum(['broker', 'owner']).optional(),
  creci: z.string().optional()
});

export const draftSchema = draftBaseSchema.transform((draft, context) => {
  const advertiser =
    draft.advertiser ??
    (draft.advertiserName && draft.advertiserPhone
      ? {
          name: draft.advertiserName,
          phone: draft.advertiserPhone,
          type: draft.advertiserType ?? 'owner',
          creci: draft.creci || undefined,
          isVerified: false
        }
      : undefined);

  if (!advertiser) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Advertiser data is required',
      path: ['advertiser']
    });

    return z.NEVER;
  }

  return {
    title: draft.title,
    price: draft.price,
    priceType: draft.priceType,
    city: draft.city,
    citySlug: draft.citySlug,
    neighborhood: draft.neighborhood,
    neighborhoodSlug: draft.neighborhoodSlug,
    address: draft.address,
    bedrooms: draft.bedrooms,
    bathrooms: draft.bathrooms,
    area: draft.area,
    parkingSpaces: draft.parkingSpaces,
    images: draft.images,
    description: draft.description,
    features: draft.features,
    advertiser: {
      ...advertiser,
      creci: advertiser.type === 'broker' ? advertiser.creci : undefined
    }
  };
});

export const legacyDraftSchema = z.object({
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
