import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { advertiserRoutes } from './modules/advertisers/advertiserRoutes.js';
import { cityRoutes } from './modules/cities/cityRoutes.js';
import { propertyRoutes } from './modules/properties/propertyRoutes.js';

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN
  });
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: 'Validation error',
        issues: error.issues
      });
    }

    app.log.error(error);
    return reply.code(500).send({ message: 'Internal server error' });
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'casa-sc-backend'
  }));

  await app.register(propertyRoutes);
  await app.register(cityRoutes);
  await app.register(advertiserRoutes);

  return app;
}
