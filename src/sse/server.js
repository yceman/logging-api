// src/sse/server.js
import Fastify from 'fastify';
import amqp from 'amqplib';

const fastify = Fastify({ logger: true });
let channel;

// Conexão RabbitMQ
fastify.addHook('onReady', async () => {
  const connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertQueue('orders');
  fastify.log.info('Conectado ao RabbitMQ');

  // Consumidor da fila
  channel.consume('orders', msg => {
    const order = JSON.parse(msg.content.toString());
    fastify.log.info(`Processando pedido: ${order.product}`);

    // Notifica todos os clientes conectados via SSE
    clients.forEach(res => {
      res.write(`data: ${JSON.stringify(order)}\n\n`);
    });

    channel.ack(msg);
  });
});

// Lista de clientes conectados via SSE
const clients = [];

// Endpoint SSE
fastify.get('/events', async (request, reply) => {
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.flushHeaders();

  clients.push(reply.raw);

  reply.raw.on('close', () => {
    clients.splice(clients.indexOf(reply.raw), 1);
  });
});

// Endpoint para criar pedidos
fastify.post('/orders', async (request, reply) => {
  const order = request.body;
  channel.sendToQueue('orders', Buffer.from(JSON.stringify(order)));
  return { status: 'Order enviado para processamento' };
});

fastify.listen({ port: 4001 });