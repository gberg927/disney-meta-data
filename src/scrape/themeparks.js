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
  const waitTime = await prisma.waitTime.create({
    data: {
      timestamp,
      amount: data.waitTime || 0,
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
  console.log(
    `Created WaitTime: ${data.name} - ${data.waitTime} minutes wait (${data.status})`
  );

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

const getParkRideTimes = async (park, resortSlug) => {
  let rideTimes = [];
  const slug = `${resortSlug}-${park.slug}`;
  switch (slug) {
    case 'wdw-magic-kingdom':
      rideTimes = await GetWDWMagicKingdomWaitTimes();
      break;
    case 'wdw-epcot':
      rideTimes = await GetWDWEpcotWaitTimes();
      break;
    case 'wdw-hollywood-studios':
      rideTimes = await GetWDWHollywoodStudiosWaitTimes();
      break;
    case 'wdw-animal-kingdom':
      rideTimes = await GetWDWAnimalKingdomnWaitTimes();
      break;
    case 'dl-magic-kingdom':
      rideTimes = await GetDRMagicKingdomWaitTimes();
      break;
    case 'dl-california-adventure':
      rideTimes = await GetDRCaliforniaAdventureWaitTimes();
      break;
    case 'dlp-magic-kingdom':
      rideTimes = await GetDPMagicKingdomWaitTimes();
      break;
    case 'dlp-walt-disney-studios':
      rideTimes = await GetDPWaltDisneyStudiosWaitTimes();
      break;
    case 'hkd-disneyland':
      rideTimes = await GetHKDisneylandWaitTimes();
      break;
    case 'shd-magic-kingdom':
      rideTimes = await GetSDRMagicKingdomWaitTimes();
      break;
    case 'td-magic-kingdom':
      rideTimes = await GetTDRMagicKingdomWaitTimes();
      break;
    case 'td-disney-sea':
      rideTimes = await GetTDRDisneySeaWaitTimes();
      break;
    default:
      break;
  }
  return rideTimes;
};

const processPark = async (park, resortSlug) => {
  console.log(`Park: ${park.slug}`);
  const processedWaitTimes = [];

  try {
    const rideTimes = await getParkRideTimes(park, resortSlug);
    console.log(rideTimes);
    for (const rideTime of rideTimes) {
      const processedWaitTime = await processRide(rideTime);
      processedWaitTimes.push(processedWaitTime);
    }
  } catch (err) {
    console.error(err);
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

const processResort = async resort => {
  console.log(`Resort: ${resort.slug}`);
  const processedParks = [];

  for (const park of resort.parks) {
    const processedPark = await processPark(park, resort.slug);
    processedParks.push(processedPark);
  }

  const processedResort = {
    id: resort.id,
    name: resort.name,
    slug: resort.slug,
    processedParks,
  };
  return processedResort;
};

const processResorts = async user => {
  console.log(`Processing Resorts: ${timestamp}`);
  const processedResorts = [];
  const resorts = await prisma.resort.findMany({
    include: {
      parks: true,
    },
  });

  await startJob(user);
  for (const resort of resorts) {
    const processedResort = await processResort(resort);
    processedResorts.push(processedResort);
  }
  await endJob();

  const processedJob = {
    status: job.status,
    startTime: job.timestamp,
    endTime: job.endTime,
    processedResorts,
  };
  return processedJob;
};

export default processResorts;
