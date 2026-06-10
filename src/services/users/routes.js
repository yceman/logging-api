export default async function useRoutes(fastify, options) {
    fastify.get('/users', async (request, reply) => {
        return [{
            id: 1,
            name: 'John Doe',
            id: 2,
            name: 'Jane Doe'
        }]
    })

    fastify.post('/users', async (request, reply) => {
        const { name } = request.body;
        // Logic to create a new user
        return { id: Date.now(), name };
        /*return { id: 3, name };*/
    })
}