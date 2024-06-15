const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers/index');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  
module.exports = schema;

