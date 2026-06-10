// src/gateway/server.js
import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';

import pingRoutes from './routes/ping.js';

const gateway = Fastify({ logger: true });

const app = Fastify({
  logger: {
    level: 'info', // níveis: trace, debug, info, warn, error, fatal
    transport: {
      target: 'pino-pretty', // deixa os logs mais legíveis no console
      options: {
        colorize: true, // ativa cores para facilitar a leitura
        translateTime: 'yyyy-mm-dd HH:MM:ss.l', // formata o timestamp
        ignore: 'pid,hostname' // ignora campos desnecessários  
      }
    }
  }
});

// Proxy para o serviço de usuários
gateway.register(fastifyHttpProxy, {
  upstream: 'http://localhost:4001',
  prefix: '/users',
  rewritePrefix: '/users'
});

// Proxy para o serviço de pedidos
gateway.register(fastifyHttpProxy, {
  upstream: 'http://localhost:4002',
  prefix: '/orders',
  rewritePrefix: '/orders'
});

gateway.listen({ port: 3000 }, (err, address) => {
  if (err) {
    gateway.log.error(err);
    process.exit(1);
  }
  gateway.log.info(`API Gateway rodando em ${address}`);
});
