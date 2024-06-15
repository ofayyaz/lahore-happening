const { PrismaClient } = require('@prisma/client');
const { ApolloServer } = require('@apollo/server');
require('dotenv').config({ path: '../.env' });
const app = require('./app');  // Import the configured Express app
const schema = require('../src/schema');  // Ensure the schema is ready
const { expressMiddleware } = require('@apollo/server/express4');

const prisma = new PrismaClient();

const startServer = async () => {
    const server = new ApolloServer({
      schema,
      context: ({ req }) => ({
        prisma,
    
      }), 
    });

    await server.start();

    app.use(expressMiddleware(server, {
      path: '/graphql'
    }));

    //app.use('/graphql', expressMiddleware(server));

    app.listen(4000, () => {
        console.log('Server is running on http://localhost:4000/graphql');
        console.log('GraphiQL is available at http://localhost:4000/graphiql');
    });
};

startServer();
