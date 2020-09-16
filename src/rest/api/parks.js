import express from 'express';

import prisma from '../../prisma';

const parks = express.Router();

parks.get('/', async (req, res) => {
  const rtnParks = await prisma.park.findMany();
  res.status(200).json({ parks: rtnParks });
});

parks.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const rtnPark = await prisma.park.findOne({
    where: {
      id,
    },
  });
  res.status(200).json({ park: rtnPark });
});

parks.get('/:id/rides', async (req, res) => {
  const id = parseInt(req.params.id);
  const rtnRides = await prisma.ride.findMany({
    where: {
      park: {
        id,
      },
    },
  });
  res.status(200).json({ rides: rtnRides });
});

export { parks };
