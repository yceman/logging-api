// routes/ping.js
export default async function pingRoutes(fastify, options) {
  fastify.get('/ping', async (request, reply) => {
    fastify.log.info('Requisição recebida em /ping');
    return { pong: 'it works!' };
  });
}
