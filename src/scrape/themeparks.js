import prisma from '../prisma';

import {
  GetWDWMagicKingdomWaitTimes,
  GetWDWEpcotWaitTimes,
  GetWDWHollywoodStudiosWaitTimes,
  GetWDWAnimalKingdomnWaitTimes,
  GetDRMagicKingdomWaitTimes,
  GetDRCaliforniaAdventureWaitTimes,
  GetDPMagicKingdomWaitTimes,
  GetDPWaltDisneyStudiosWaitTimes,
  GetHKDisneylandWaitTimes,
  GetSDRMagicKingdomWaitTimes,
  GetTDRMagicKingdomWaitTimes,
  GetTDRDisneySeaWaitTimes,
} from './themeparksapi';

let timestamp = new Date();
let job = null;
let waitTimesCreated = 0;

const processWaitTime = async (ride, data) => {
  console.log(
    `${data.name}, ${data.id}, ${data.meta.area}, ${data.meta.latitude}, ${data.meta.longitude}, ${data.fastPass}`
  );

  const waitTime = await prisma.waitTime.create({
    data: {
      timestamp,
      amount: data.waitTime,
      active: data.active,
      status: data.status,
      ride:
        (ride && {
          connect: {
            id: ride.id,
          },
        }) ||
        null,
      job: {
        connect: {
          id: job.id,
        },
      },
    },
  });

  const processedWaitTime = {
    name: data.name,
    timestamp: waitTime.timestamp,
    amount: waitTime.amount,
    active: waitTime.active,
    status: waitTime.status,
    rideId: waitTime.rideId,
    jobId: waitTime.jobId,
  };

  waitTimesCreated += 1;
  // console.log(`Created WaitTime: ${data.name} - ${data.waitTime} minutes wait (${data.status})`);

  return processedWaitTime;
};

const processRide = async data => {
  const rides = await prisma.ride.findMany({
    where: {
      longId: data.id,
    },
    take: 1,
  });

  const waitTime = await processWaitTime(rides.length ? rides[0] : null, data);
  return waitTime;
};

const getParkRideTimes = async park => {
  let rideTimes = [];
  switch (park.slug) {
    case 'wdw-magic-kingdom':
      // rideTimes = await GetWDWMagicKingdomWaitTimes();
      break;
    case 'wdw-epcot':
      // rideTimes = await GetWDWEpcotWaitTimes();
      break;
    case 'wdw-hollywood-studios':
      // rideTimes = await GetWDWHollywoodStudiosWaitTimes();
      break;
    case 'wdw-animal-kingdom':
      // rideTimes = await GetWDWAnimalKingdomnWaitTimes();
      break;
    case 'dr-magic-kingdom':
      rideTimes = await GetDRMagicKingdomWaitTimes();
      break;
    case 'dr-california-adventure':
      rideTimes = await GetDRCaliforniaAdventureWaitTimes();
      break;
    case 'dp-magic-kingdom':
      rideTimes = await GetDPMagicKingdomWaitTimes();
      break;
    case 'dp-walt-disney-studios':
      // rideTimes = await GetDPWaltDisneyStudiosWaitTimes();
      break;
    case 'hk-disneyland':
      rideTimes = await GetHKDisneylandWaitTimes();
      break;
    case 'sdr-magic-kingdom':
      // rideTimes = await GetSDRMagicKingdomWaitTimes();
      break;
    case 'tdr-magic-kingdom':
      rideTimes = await GetTDRMagicKingdomWaitTimes();
      break;
    case 'tdr-disney-sea':
      rideTimes = await GetTDRDisneySeaWaitTimes();
      break;
    default:
      break;
  }
  return rideTimes;
};

const processPark = async park => {
  console.log(`Park: ${park.slug}`);
  const processedWaitTimes = [];
  const rideTimes = await getParkRideTimes(park);

  for (const rideTime of rideTimes) {
    const processedWaitTime = await processRide(rideTime);
    processedWaitTimes.push(processedWaitTime);
  }

  const processedPark = {
    id: park.id,
    name: park.name,
    slug: park.slug,
    processedWaitTimes,
  };
  return processedPark;
};

const startJob = async user => {
  timestamp = new Date();
  waitTimesCreated = 0;

  job = await prisma.job.create({
    data: {
      startTime: timestamp,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
};

const endJob = async () => {
  job = await prisma.job.update({
    where: { id: job.id },
    data: {
      endTime: new Date(),
      created: waitTimesCreated,
    },
  });
};

const processParks = async user => {
  console.log(`Processing Parks: ${timestamp}`);
  const processedParks = [];
  const parks = await prisma.park.findMany();

  await startJob(user);
  for (const park of parks) {
    const processedPark = await processPark(park);
    processedParks.push(processedPark);
  }
  await endJob();

  const processedJob = {
    status: job.status,
    startTime: job.timestamp,
    endTime: job.endTime,
    processedParks,
  };
  return processedJob;
};

export default processParks;
