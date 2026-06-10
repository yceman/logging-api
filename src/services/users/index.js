import Fastify from 'fastify';
import useRoutes from './routes';

const fastify = Fastify({logger: true});
fastify.register(useRoutes, {});

fastify.listen({ port: 4001 }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});