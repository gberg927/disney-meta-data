import prisma from './prisma';

const createContext = (req) => ({ ...req, prisma });

export { createContext };
