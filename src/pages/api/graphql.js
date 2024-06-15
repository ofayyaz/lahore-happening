// pages/api/graphql.js
import { ApolloServer } from 'apollo-server-micro';
import typeDefs from '../../graphql/typeDefs';
import resolvers from '../../graphql/resolvers/index'
import { PageConfig } from 'next';
import Cors from 'micro-cors';

const cors = Cors({
    allowMethods: ['POST', 'OPTIONS'],
    allowCredentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    origin: ['https://studio.apollographql.com'] // Adjust according to your needs
  });

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    // Add your context setup here, such as DB connections or auth tokens
  }),
});

const startServer = apolloServer.start();

const handler = cors(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
});


export const config = {
    api: {
      bodyParser: false,
    },
  };

  export default handler;
