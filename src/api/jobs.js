import express from 'express';
import prisma from '../prisma';

const jobs = express.Router();

jobs.get('/', async (req, res) => {
  const rtnJobs = await prisma.job.findMany();
  res.status(200).json({ jobs: rtnJobs });
});

jobs.get('/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const rtnJob = await prisma.job.findOne({
    where: {
      id: parseInt(jobId),
    },
  });
  res.status(200).json({ job: rtnJob });
});

jobs.get('/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const rtnJob = await prisma.job.findOne({
    where: {
      id: parseInt(jobId),
    },
    include: {
      WaitTime: true,
    },
  });
  res.status(200).json({ job: rtnJob });
});

export { jobs };
