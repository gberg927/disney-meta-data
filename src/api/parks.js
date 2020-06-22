import express from 'express';
import prisma from '../prisma';

const parks = express.Router();

parks.get('/', async (req, res) => {
  const rtnParks = await prisma.park.findMany();
  res.status(200).json({ parks: rtnParks });
});

parks.get('/:parkId', async (req, res) => {
  const { parkId } = req.params;
  const rtnPark = await prisma.park.findOne({
    where: {
      id: parseInt(parkId),
    },
  });
  res.status(200).json({ park: rtnPark });
});

parks.get('/:parkId/rides', async (req, res) => {
  const { parkId } = req.params;
  const rtnRides = await prisma.ride.findMany({
    where: {
      parkId: parseInt(parkId),
    },
  });
  res.status(200).json({ rides: rtnRides });
});

parks.get('/:parkId/rides/:rideId', async (req, res) => {
  const { parkId, rideId } = req.params;
  const rtnRides = await prisma.ride.findMany({
    where: {
      park: { id: parseInt(parkId) },
      id: parseInt(rideId),
    },
    take: 1,
  });
  res.status(200).json({ ride: rtnRides.length ? rtnRides[0] : null });
});

parks.get('/:parkId/rides/:rideId/waittime', async (req, res) => {
  const { parkId, rideId } = req.params;
  const rtnWaitTimes = await prisma.waitTime.findMany({
    where: {
      ride: {
        id: parseInt(rideId),
        park: { id: parseInt(parkId) },
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

parks.get('/:parkId/rides/:rideId/waittimes', async (req, res) => {
  const { parkId, rideId } = req.params;
  const rtnWaitTimes = await prisma.waitTime.findMany({
    where: {
      ride: {
        id: parseInt(rideId),
        park: { id: parseInt(parkId) },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
  res.status(200).json({ waitTimes: rtnWaitTimes });
});

export { parks };
