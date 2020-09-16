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

resorts.get('/:id/parks', async (req, res) => {
  const id = parseInt(req.params.id);
  const rtnParks = await prisma.park.findMany({
    where: {
      resort: {
        id,
      },
    },
  });
  res.status(200).json({ parks: rtnParks });
});

export { resorts };
