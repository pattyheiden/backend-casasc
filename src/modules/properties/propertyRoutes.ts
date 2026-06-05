import type { FastifyInstance } from 'fastify';
import {
  createPropertyDraft,
  getPublishedProperty,
  listProperties,
  registerPropertyMetric
} from './propertyService.js';
import { draftSchema, metricBodySchema, propertyListQuerySchema } from './propertySchemas.js';

export async function propertyRoutes(app: FastifyInstance) {
  app.get('/properties', async (request) => {
    const query = propertyListQuerySchema.parse(request.query);
    return listProperties(query);
  });

  app.get('/properties/:id', async (request) => {
    const { id } = request.params as { id: string };
    return getPublishedProperty(id);
  });

  app.post('/properties/drafts', async (request, reply) => {
    const body = draftSchema.parse(request.body);
    const draft = await createPropertyDraft(body);
    return reply.code(201).send(draft);
  });

  app.post('/properties/:id/views', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = metricBodySchema.parse(request.body ?? {});
    const result = await registerPropertyMetric(id, 'view', body.metadata);
    if (!result) return reply.code(404).send({ message: 'Property not found' });
    return result;
  });

  app.post('/properties/:id/whatsapp-clicks', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = metricBodySchema.parse(request.body ?? {});
    const result = await registerPropertyMetric(id, 'whatsapp_click', body.metadata);
    if (!result) return reply.code(404).send({ message: 'Property not found' });
    return result;
  });

  app.post('/properties/:id/shares', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = metricBodySchema.parse(request.body ?? {});
    const result = await registerPropertyMetric(id, 'share', body.metadata);
    if (!result) return reply.code(404).send({ message: 'Property not found' });
    return result;
  });
}
