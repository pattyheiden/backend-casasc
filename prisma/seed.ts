import { PrismaClient } from '@prisma/client';
import { toSlug } from '../src/lib/slug.js';

const prisma = new PrismaClient();

const cityImages: Record<string, string> = {
  florianopolis:
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
  'balneario-camboriu':
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  joinville: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
};

const properties = [
  {
    title: 'Casa com piscina perto da Lagoa',
    price: 1280000,
    priceType: 'sale' as const,
    city: 'Florianopolis',
    neighborhood: 'Lagoa da Conceicao',
    address: 'Rua das Palmeiras, 120',
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    parkingSpaces: 2,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80'
    ],
    description: 'Casa ampla, iluminada e pronta para morar em uma das regioes mais desejadas da ilha.',
    features: ['Piscina', 'Churrasqueira', 'Jardim', 'Suite master'],
    isPremium: true,
    advertiser: {
      name: 'Marina Costa',
      phone: '+5548999991111',
      type: 'broker' as const,
      creci: 'SC-48291',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    title: 'Apartamento mobiliado vista mar',
    price: 6800,
    priceType: 'rent' as const,
    city: 'Balneario Camboriu',
    neighborhood: 'Centro',
    address: 'Avenida Atlantica, 900',
    bedrooms: 3,
    bathrooms: 2,
    area: 118,
    parkingSpaces: 1,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80'
    ],
    description: 'Apartamento mobiliado com sacada, vista para o mar e acesso rapido a servicos.',
    features: ['Vista mar', 'Mobiliado', 'Sacada', 'Portaria 24h'],
    isPremium: true,
    advertiser: {
      name: 'Rafael Martins',
      phone: '+5547999992222',
      type: 'broker' as const,
      creci: 'SC-39102',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    title: 'Sobrado familiar com quintal',
    price: 760000,
    priceType: 'sale' as const,
    city: 'Joinville',
    neighborhood: 'America',
    address: 'Rua Otto Boehm, 540',
    bedrooms: 3,
    bathrooms: 3,
    area: 175,
    parkingSpaces: 2,
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80'
    ],
    description: 'Sobrado bem conservado, com ambientes integrados e quintal para receber a familia.',
    features: ['Quintal', 'Area gourmet', 'Escritorio', 'Lavabo'],
    isPremium: false,
    advertiser: {
      name: 'Ana e Paulo',
      phone: '+5547999993333',
      type: 'owner' as const,
      isVerified: false
    }
  }
];

async function main() {
  for (const item of properties) {
    const citySlug = toSlug(item.city);
    const neighborhoodSlug = toSlug(item.neighborhood);

    const city = await prisma.city.upsert({
      where: { slug: citySlug },
      update: {
        name: item.city,
        image: cityImages[citySlug] ?? ''
      },
      create: {
        name: item.city,
        slug: citySlug,
        image: cityImages[citySlug] ?? ''
      }
    });

    const neighborhood = await prisma.neighborhood.upsert({
      where: {
        cityId_slug: {
          cityId: city.id,
          slug: neighborhoodSlug
        }
      },
      update: { name: item.neighborhood },
      create: {
        name: item.neighborhood,
        slug: neighborhoodSlug,
        cityId: city.id
      }
    });

    const advertiser = await prisma.advertiser.create({
      data: item.advertiser
    });

    await prisma.property.upsert({
      where: {
        cityId_neighborhoodId_slug: {
          cityId: city.id,
          neighborhoodId: neighborhood.id,
          slug: toSlug(item.title)
        }
      },
      update: {
        price: item.price,
        isPremium: item.isPremium,
        status: 'published'
      },
      create: {
        title: item.title,
        slug: toSlug(item.title),
        price: item.price,
        priceType: item.priceType,
        cityId: city.id,
        neighborhoodId: neighborhood.id,
        address: item.address,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        area: item.area,
        parkingSpaces: item.parkingSpaces,
        images: item.images,
        description: item.description,
        features: item.features,
        isPremium: item.isPremium,
        advertiserId: advertiser.id,
        status: 'published',
        publishedAt: new Date()
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
