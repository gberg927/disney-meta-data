import { ApolloServer } from 'apollo-server';
import prisma from '../prisma';
import schema from './schema';

const app = new ApolloServer({ schema, context: { prisma } });

export default app;
