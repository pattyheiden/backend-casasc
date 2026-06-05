export type PriceType = 'sale' | 'rent';

export type AdvertiserDto = {
  id: string;
  name: string;
  phone: string;
  type: 'broker' | 'owner';
  avatar?: string;
  creci?: string;
  isVerified: boolean;
};

export type PropertyDto = {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceType: PriceType;
  city: string;
  citySlug: string;
  neighborhood: string;
  neighborhoodSlug: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parkingSpaces: number;
  images: string[];
  description: string;
  features: string[];
  advertiser: AdvertiserDto;
  isPremium: boolean;
  createdAt: string;
  views?: number;
  whatsappClicks?: number;
  status?: 'draft' | 'published' | 'paused';
};

export type CityDto = {
  name: string;
  slug: string;
  propertyCount: number;
  image: string;
};
