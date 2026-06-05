import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { mapAdvertiser } from '../properties/propertyMapper.js';

export async function advertiserRoutes(app: FastifyInstance) {
  app.get('/brokers', async () => {
    const brokers = await prisma.advertiser.findMany({
      where: {
        type: 'broker',
        isVerified: true
      },
      orderBy: { name: 'asc' }
    });

    return brokers.map(mapAdvertiser);
  });

  app.get('/advertisers', async () => {
    const advertisers = await prisma.advertiser.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return advertisers.map(mapAdvertiser);
  });
}
