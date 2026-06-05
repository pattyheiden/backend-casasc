import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { toSlug } from '../../lib/slug.js';
import type { propertyListQuerySchema } from './propertySchemas.js';
import { mapProperty } from './propertyMapper.js';
import type { z } from 'zod';

type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;

const includeRelations = {
  city: true,
  neighborhood: true,
  advertiser: true
} satisfies Prisma.PropertyInclude;

function parsePriceRange(priceRange?: string): Prisma.IntFilter | undefined {
  if (!priceRange) return undefined;

  const [minRaw, maxRaw] = priceRange.split('-');
  const min = Number(minRaw);
  const max = Number(maxRaw);

  if (Number.isFinite(min) && Number.isFinite(max)) {
    return { gte: min, lte: max };
  }

  if (Number.isFinite(min) && priceRange.endsWith('+')) {
    return { gte: min };
  }

  return undefined;
}

function buildOrderBy(sort: PropertyListQuery['sort']): Prisma.PropertyOrderByWithRelationInput[] {
  if (sort === 'newest') return [{ createdAt: 'desc' }];
  if (sort === 'price-asc') return [{ price: 'asc' }];
  if (sort === 'price-desc') return [{ price: 'desc' }];
  if (sort === 'most-viewed') return [{ views: 'desc' }, { createdAt: 'desc' }];

  return [{ isPremium: 'desc' }, { createdAt: 'desc' }];
}

export async function listProperties(query: PropertyListQuery) {
  const where: Prisma.PropertyWhereInput = {
    status: 'published',
    priceType: query.priceType,
    city: query.city ? { slug: query.city } : undefined,
    neighborhood: query.neighborhood ? { slug: query.neighborhood } : undefined,
    price: parsePriceRange(query.priceRange),
    bedrooms: query.bedrooms ? { gte: query.bedrooms } : undefined,
    parkingSpaces: query.parkingSpaces ? { gte: query.parkingSpaces } : undefined,
    advertiser: query.brokerOnly ? { type: 'broker', isVerified: true } : undefined
  };

  if (query.query) {
    where.OR = [
      { title: { contains: query.query, mode: 'insensitive' } },
      { description: { contains: query.query, mode: 'insensitive' } },
      { city: { name: { contains: query.query, mode: 'insensitive' } } },
      { neighborhood: { name: { contains: query.query, mode: 'insensitive' } } }
    ];
  }

  const properties = await prisma.property.findMany({
    where,
    include: includeRelations,
    orderBy: buildOrderBy(query.sort)
  });

  return properties.map(mapProperty);
}

export async function getPublishedProperty(id: string) {
  const property = await prisma.property.findFirst({
    where: { id, status: 'published' },
    include: includeRelations
  });

  return property ? mapProperty(property) : null;
}

export async function createPropertyDraft(input: {
  title: string;
  price: number;
  priceType: 'sale' | 'rent';
  city: string;
  citySlug?: string;
  neighborhood: string;
  neighborhoodSlug?: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parkingSpaces: number;
  images: string[];
  description: string;
  features: string[];
  advertiser: {
    name: string;
    phone: string;
    type: 'broker' | 'owner';
    avatar?: string;
    creci?: string;
    isVerified: boolean;
  };
}) {
  const citySlug = input.citySlug ?? toSlug(input.city);
  const neighborhoodSlug = input.neighborhoodSlug ?? toSlug(input.neighborhood);

  const city = await prisma.city.upsert({
    where: { slug: citySlug },
    update: { name: input.city },
    create: {
      name: input.city,
      slug: citySlug,
      image: ''
    }
  });

  const neighborhood = await prisma.neighborhood.upsert({
    where: {
      cityId_slug: {
        cityId: city.id,
        slug: neighborhoodSlug
      }
    },
    update: { name: input.neighborhood },
    create: {
      name: input.neighborhood,
      slug: neighborhoodSlug,
      cityId: city.id
    }
  });

  const advertiser = await prisma.advertiser.create({
    data: {
      name: input.advertiser.name,
      phone: input.advertiser.phone,
      type: input.advertiser.type,
      avatar: input.advertiser.avatar,
      creci: input.advertiser.creci,
      isVerified: input.advertiser.isVerified
    }
  });

  const property = await prisma.property.create({
    data: {
      title: input.title,
      slug: toSlug(input.title),
      price: input.price,
      priceType: input.priceType,
      cityId: city.id,
      neighborhoodId: neighborhood.id,
      address: input.address,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area: input.area,
      parkingSpaces: input.parkingSpaces,
      images: input.images,
      description: input.description,
      features: input.features,
      advertiserId: advertiser.id,
      status: 'draft'
    }
  });

  return { id: property.id };
}

export async function registerPropertyMetric(propertyId: string, type: 'view' | 'whatsapp_click' | 'share', metadata?: object) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, advertiserId: true }
  });

  if (!property) return null;

  await prisma.$transaction([
    prisma.lead.create({
      data: {
        propertyId,
        advertiserId: property.advertiserId,
        type,
        metadata: metadata as Prisma.InputJsonObject | undefined
      }
    }),
    prisma.property.update({
      where: { id: propertyId },
      data:
        type === 'view'
          ? { views: { increment: 1 } }
          : type === 'whatsapp_click'
            ? { whatsappClicks: { increment: 1 } }
            : { shares: { increment: 1 } }
    })
  ]);

  return { ok: true };
}
