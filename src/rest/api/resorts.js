import express from 'express';

import prisma from '../../prisma';

const resorts = express.Router();

resorts.get('/', async (req, res) => {
  const rtnResorts = await prisma.resort.findMany();
  res.status(200).json({ parks: rtnResorts });
});

resorts.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const rtnResorts = await prisma.resort.findOne({
    where: {
      id,
    },
  });
  res.status(200).json({ resort: rtnResorts });
});

export { resorts };
