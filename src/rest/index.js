import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { jobs, parks, rides } from './api';

const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('Welcome!');
});

app.use('/api/jobs', jobs);
app.use('/api/parks', parks);
app.use('/api/rides', rides);

export default app;
