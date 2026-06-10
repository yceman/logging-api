// cluster-server.js
import cluster from 'node:cluster';
import os from 'node:os';
import Fastify from 'fastify';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master rodando. Criando ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} morreu. Reiniciando...`);
    cluster.fork();
  });
} else {
  const fastify = Fastify({ logger: true });

  fastify.get('/ping', async () => ({ pong: 'it works!' }));

  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`Worker ${process.pid} rodando em ${address}`);
  });
}
