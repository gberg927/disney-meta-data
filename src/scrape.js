import axios from 'axios';
import { Point } from '@influxdata/influxdb-client';
import prisma from './prisma';
import { writePoints } from './influxdb';

const getTimes = async (parkLongId) =>
  axios.get(`https://api.themeparks.wiki/preview/parks/${parkLongId}/waittime`);

const processWaitTime = async (unixTimestamp, resort, park, ride, waitTime) => {
  const wt = {
    amount: (waitTime && waitTime.waitTime) || 0,
    active: (waitTime && waitTime.active) || 0,
    status: (waitTime && waitTime.status) || 'Closed',
  };

  const point = new Point('waittime')
    .tag('resortId', resort.id)
    .tag('resort', resort.slug)
    .tag('parkId', park.id)
    .tag('park', park.slug)
    .tag('rideId', ride.id)
    .tag('ride', ride.slug)
    .intField('amount', wt.amount)
    .booleanField('active', wt.active)
    .stringField('status', wt.status)
    .timestamp(unixTimestamp);

  console.log(`WaitTime: ${wt.amount} minutes wait (${wt.status})`);
  return point;
};

const processRide = async (unixTimestamp, resort, park, ride, waitTimes) => {
  console.log(`Ride: ${ride.slug}`);
  if (ride.longId) {
    const waitTime = await waitTimes.find((wt) => wt.id === ride.longId);
    return processWaitTime(unixTimestamp, resort, park, ride, waitTime);
  }
  return null;
};

const processPark = async (unixTimestamp, resort, park) => {
  console.log(`Park: ${park.slug}`);
  const rideTimes = await getTimes(park.longId);

  const parkPoints = [];
  for (const ride of park.rides) {
    const ridePoint = await processRide(
      unixTimestamp,
      resort,
      park,
      ride,
      rideTimes.data
    );
    parkPoints.push(ridePoint);
  }
  return parkPoints;
};

const processResort = async (unixTimestamp, resort) => {
  console.log(`Resort: ${resort.slug}`);

  const resortPoints = [];
  for (const park of resort.parks) {
    const parkPoints = await processPark(unixTimestamp, resort, park);
    resortPoints.push(parkPoints);
  }
  return resortPoints.flat();
};

const scrape = async (startTime) => {
  console.log(`Processing Resorts: ${startTime}`);

  const job = await prisma.job.create({
    data: {
      userId: 1,
      startTime,
    },
  });

  const unixTimestamp = job.startTime.getTime() / 1000;

  const resorts = await prisma.resort.findMany({
    include: {
      parks: {
        include: {
          rides: true,
        },
      },
    },
  });

  const allPoints = [];
  for (const resort of resorts) {
    const resortPoints = await processResort(unixTimestamp, resort);
    allPoints.push(resortPoints);
  }

  const points = allPoints.flat().filter((point) => point !== null);
  writePoints(points);

  await prisma.job.update({
    where: {
      id: job.id,
    },
    data: {
      endTime: new Date(),
      created: points.length,
    },
  });
};

export default scrape;
