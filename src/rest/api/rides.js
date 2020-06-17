import express from 'express';
import prisma from '../../prisma';

const rides = express.Router();

rides.get('/', async (req, res) => {
  const rtnRides = await prisma.ride.findMany();
  res.status(200).json({ rides: rtnRides });
});

rides.get('/:rideId', async (req, res) => {
  const { rideId } = req.params;
  const rtnRide = await prisma.ride.findOne({
    where: {
      id: parseInt(rideId),
    },
  });
  res.status(200).json({ ride: rtnRide });
});

rides.get('/:rideId/waittime', async (req, res) => {
  const { rideId } = req.params;
  const rtnWaitTimes = await prisma.waitTime.findMany({
    where: {
      ride: {
        id: parseInt(rideId),
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

rides.get('/:rideId/waittimes', async (req, res) => {
  const { rideId } = req.params;
  const rtnWaitTimes = await prisma.waitTime.findMany({
    where: {
      ride: {
        id: parseInt(rideId),
      },
    },
  });
  res.status(200).json({ waitTimes: rtnWaitTimes });
});

export { rides };
