export default async function useRoutes(fastify, options) {
    fastify.get('/orders', async (request, reply) => {
        return [{
            id: 1,
            product: 'Laptop',
            quantity: 1
        }, {
            id: 2,
            product: 'Mouse',
            quantity: 2
        }]
    })

    fastify.post('/orders', async (request, reply) => {
        const { product, quantity } = request.body;
        // Logic to create a new order
        return { id: Date.now(), product, quantity };
        /*return { id: 3, product, quantity };*/
    })
}