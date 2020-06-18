import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { jobs, parks, rides } from './api';

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome!');
});

app.use('/api/jobs', jobs);
app.use('/api/parks', parks);
app.use('/api/rides', rides);

app.listen({ port: 5000 }, () => {
  console.log(`REST API: Listening: http://localhost:5000`);
});
