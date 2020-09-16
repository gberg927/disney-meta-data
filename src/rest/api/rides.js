import express from 'express';

import { subMinutes } from 'date-fns';
import prisma from '../../prisma';

const rides = express.Router();

rides.get('/', async (req, res) => {
  const rtnRides = await prisma.ride.findMany();
  res.status(200).json({ parks: rtnRides });
});

rides.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const rtnRide = await prisma.ride.findOne({
    where: {
      id,
    },
  });
  res.status(200).json({ ride: rtnRide });
});

rides.get('/:id/waittime', async (req, res) => {
  const id = parseInt(req.params.id);
  const rtnWaitTimes = await prisma.waitTime.findMany({
    where: {
      ride: {
        id,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 1,
  });
  res
    .status(200)
    .json({ waitTime: rtnWaitTimes.length ? rtnWaitTimes[0] : null });
});

rides.get('/:id/waittimes', async (req, res) => {
  const id = parseInt(req.params.id);
  const rtnWaitTimes = await prisma.waitTime.findMany({
    where: {
      ride: {
        id,
      },
      timestamp: {
        gte: subMinutes(new Date(), 1454),
      },
    },
  });
  res.status(200).json({ waitTimes: rtnWaitTimes });
});

export { rides };
