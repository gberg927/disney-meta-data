import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { resorts, scrape } from './api';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', async (req, res) => {
  res.send('Welcome!');
});

app.use('/api/resorts', resorts);
app.use('/api/scrape', scrape);

export default app;
