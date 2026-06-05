import type { Advertiser, City, Neighborhood, Property } from '@prisma/client';
import type { AdvertiserDto, PropertyDto } from '../../types/api.js';

type PropertyWithRelations = Property & {
  city: City;
  neighborhood: Neighborhood;
  advertiser: Advertiser;
};

export function mapAdvertiser(advertiser: Advertiser): AdvertiserDto {
  return {
    id: advertiser.id,
    name: advertiser.name,
    phone: advertiser.phone,
    type: advertiser.type,
    avatar: advertiser.avatar ?? undefined,
    creci: advertiser.creci ?? undefined,
    isVerified: advertiser.isVerified
  };
}

export function mapProperty(property: PropertyWithRelations): PropertyDto {
  return {
    id: property.id,
    title: property.title,
    slug: property.slug,
    price: property.price,
    priceType: property.priceType,
    city: property.city.name,
    citySlug: property.city.slug,
    neighborhood: property.neighborhood.name,
    neighborhoodSlug: property.neighborhood.slug,
    address: property.address ?? undefined,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    parkingSpaces: property.parkingSpaces,
    images: property.images,
    description: property.description,
    features: property.features,
    advertiser: mapAdvertiser(property.advertiser),
    isPremium: property.isPremium,
    createdAt: property.createdAt.toISOString(),
    views: property.views,
    whatsappClicks: property.whatsappClicks,
    status: property.status === 'archived' ? 'paused' : property.status
  };
}
