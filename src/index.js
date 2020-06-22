import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { jobs, parks, rides, scrape } from './api';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', async (req, res) => {
  res.send('Welcome!');
});

app.use('/api/jobs', jobs);
app.use('/api/parks', parks);
app.use('/api/rides', rides);
app.use('/api/scrape', scrape);

const PORT = process.env.PORT || 5000;

app.listen({ port: PORT }, () => {
  console.log(`REST API: Listening: http://localhost:${PORT}`);
});
