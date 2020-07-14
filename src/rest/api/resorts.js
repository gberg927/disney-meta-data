import express from 'express';
import { subMinutes } from 'date-fns';

import prisma from '../../prisma';

const resorts = express.Router();

resorts.get('/', async (req, res) => {
  const rtnResorts = await prisma.resort.findMany();
  res.status(200).json({ parks: rtnResorts });
});

resorts.get('/:resortSlug', async (req, res) => {
  const { resortSlug } = req.params;
  const rtnResorts = await prisma.resort.findMany({
    where: {
      slug: resortSlug,
    },
  });
  res.status(200).json({ resort: rtnResorts.length ? rtnResorts[0] : null });
});

resorts.get('/:resortSlug/parks', async (req, res) => {
  const { resortSlug } = req.params;
  const rtnParks = await prisma.park.findMany({
    where: {
      resort: {
        slug: resortSlug,
      },
    },
  });
  res.status(200).json({ parks: rtnParks });
});

resorts.get('/:resortSlug/parks/:parkSlug', async (req, res) => {
  const { resortSlug, parkSlug } = req.params;
  const rtnParks = await prisma.park.findMany({
    where: {
      resort: { slug: resortSlug },
      slug: parkSlug,
    },
    take: 1,
  });
  res.status(200).json({ park: rtnParks.length ? rtnParks[0] : null });
});

resorts.get('/:resortSlug/parks/:parkSlug/rides', async (req, res) => {
  const { resortSlug, parkSlug } = req.params;
  const rtnRides = await prisma.ride.findMany({
    where: {
      park: {
        slug: parkSlug,
        resort: { slug: resortSlug },
      },
    },
  });
  res.status(200).json({ rides: rtnRides });
});

resorts.get(
  '/:resortSlug/parks/:parkSlug/rides/:rideSlug',
  async (req, res) => {
    const { resortSlug, parkSlug, rideSlug } = req.params;
    const rtnRides = await prisma.ride.findMany({
      where: {
        park: {
          slug: parkSlug,
          resort: { slug: resortSlug },
        },
        slug: rideSlug,
      },
      take: 1,
    });
    res.status(200).json({ ride: rtnRides.length ? rtnRides[0] : null });
  }
);

resorts.get(
  '/:resortSlug/parks/:parkSlug/rides/:rideSlug/waittime',
  async (req, res) => {
    const { resortSlug, parkSlug, rideSlug } = req.params;
    const rtnWaitTimes = await prisma.waitTime.findMany({
      where: {
        ride: {
          slug: rideSlug,
          park: {
            slug: parkSlug,
            resort: { slug: resortSlug },
          },
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
  }
);

resorts.get(
  '/:resortSlug/parks/:parkSlug/rides/:rideSlug/waittimes',
  async (req, res) => {
    const { resortSlug, parkSlug, rideSlug } = req.params;
    const rtnWaitTimes = await prisma.waitTime.findMany({
      where: {
        ride: {
          slug: rideSlug,
          park: {
            slug: parkSlug,
            resort: { slug: resortSlug },
          },
        },
        timestamp: {
          gte: subMinutes(new Date(), 1454),
        },
      },
    });
    res.status(200).json({ waitTimes: rtnWaitTimes });
  }
);

export { resorts };
