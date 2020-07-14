import express from 'express';
import { authenticate } from '../../auth';
import processResorts from '../../scrape/themeparks';

const scrape = express.Router();

scrape.post('/', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  if (!user) {
    return res.status(400).json({ errors: 'Invalid Username or Password.' });
  }

  const job = await processResorts(user);
  res.status(200).json({ job });
});

export { scrape };
