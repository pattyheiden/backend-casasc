import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import type { CityDto } from '../../types/api.js';

export async function cityRoutes(app: FastifyInstance) {
  app.get('/cities', async (): Promise<CityDto[]> => {
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            properties: {
              where: { status: 'published' }
            }
          }
        }
      }
    });

    return cities.map((city) => ({
      name: city.name,
      slug: city.slug,
      image: city.image,
      propertyCount: city._count.properties
    }));
  });

  app.get('/cities/:citySlug/neighborhoods', async (request) => {
    const { citySlug } = request.params as { citySlug: string };
    const neighborhoods = await prisma.neighborhood.findMany({
      where: {
        city: { slug: citySlug },
        properties: {
          some: { status: 'published' }
        }
      },
      orderBy: { name: 'asc' }
    });

    return neighborhoods.map((neighborhood) => neighborhood.name);
  });
}
