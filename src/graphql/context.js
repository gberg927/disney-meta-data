import prisma from '../prisma';

const createContext = () => ({ prisma });

export { createContext };
