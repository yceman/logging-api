// src/websocket/server.js
import Fastify from 'fastify';
import amqp from 'amqplib';
import websocketPlugin from '@fastify/websocket';

const fastify = Fastify({ logger: true });
let channel;
const clients = new Set();

// WebSocket plugin
fastify.register(websocketPlugin);

// Rota WebSocket
fastify.get('/ws', { websocket: true }, (connection, req) => {
  clients.add(connection);

  connection.socket.on('message', msg => {
    fastify.log.info(`Mensagem recebida do cliente: ${msg}`);
    // Aqui pode-se publicar no RabbitMQ, por exemplo
  });

  connection.socket.on('close', () => {
    clients.delete(connection);
  });
});

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

    // Notifica todos os clientes conectados via WebSocket
    clients.forEach(conn => {
      conn.socket.send(JSON.stringify(order));
    });

    channel.ack(msg);
  });
});

// Endpoint para criar pedidos
fastify.post('/orders', async (request, reply) => {
  const order = request.body;
  channel.sendToQueue('orders', Buffer.from(JSON.stringify(order)));
  return { status: 'Order enviado para processamento' };
});

fastify.listen({ port: 4001 });
