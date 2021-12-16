import { ApolloServer } from 'apollo-server-express';
import { createContext } from './context';
import { schema } from './schema';

export const server = new ApolloServer({
  schema: schema,
  context: ({ req, res }) => createContext({ req, res }),
  playground: {
    settings: {
      "request.credentials": "include",
    }
  },
  introspection: true,
});