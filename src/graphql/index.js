import { ApolloServer } from 'apollo-server-express';
import { createContext } from './context';
import { schema } from './schema';
import rest from '../rest';

require('dotenv').config({ path: 'src/config/variables.env' });

const server = new ApolloServer({ schema, context: createContext });

server.applyMiddleware({
  app: rest,
});

export default server;
