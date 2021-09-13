import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import { CronJob } from 'cron';
import { schema } from './schema';
import { createContext } from './context';
import scrape from './scrape';

require('dotenv').config();

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://disney-metadata-frontend.vercel.app',
    'https://themeparkstats.com/',
  ],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

const server = new ApolloServer({ schema, context: createContext });
server.applyMiddleware({ app, cors: corsOptions });

const job = new CronJob('0 0/15 * * * *', async function () {
  const timeStamp = this.lastExecution;
  console.log(`Scraping: ${timeStamp}`);
  await scrape(timeStamp);
  console.log('Ending Scrape');
});
job.start();

app.listen({ port: PORT }, () => {
  console.log(`REST API: Listening: http://localhost:${PORT}`);
  console.log(
    `GRAPHQL API: Listening: http://localhost:${PORT}${server.graphqlPath}`
  );
});
