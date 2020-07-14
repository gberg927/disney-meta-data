import { nexusPrismaPlugin } from 'nexus-prisma';
import { makeSchema, objectType } from '@nexus/schema';
import { subMinutes } from 'date-fns';

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.email();
    t.model.jobs({
      pagination: true,
    });
  },
});

const Job = objectType({
  name: 'Job',
  definition(t) {
    t.model.id();
    t.model.startTime();
    t.model.endTime();
    t.model.created();
    t.model.user();
  },
});

const WaitTime = objectType({
  name: 'WaitTime',
  definition(t) {
    t.model.id();
    t.model.timestamp();
    t.model.amount();
    t.model.active();
    t.model.status();
    t.model.ride();
    t.model.job();
  },
});

const Ride = objectType({
  name: 'Ride',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.slug();
    t.model.longId();
    t.model.category();
    t.model.type();
    t.model.longitude();
    t.model.latitude();
    t.model.area();
    t.model.openedOn();
    t.model.heightRestriction();
    t.model.duration();
    t.model.fastPass();
    t.model.singleRider();
    t.model.riderSwap();
    t.model.park();
    t.list.field('waitTime', {
      type: WaitTime,
      resolve: (root, args, ctx) =>
        ctx.prisma.waitTime.findMany({
          where: {
            ride: {
              id: root.id,
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        }),
    });
    t.list.field('waitTimes', {
      type: WaitTime,
      resolve: (root, args, ctx) =>
        ctx.prisma.waitTime.findMany({
          where: {
            ride: {
              id: root.id,
            },
            timestamp: {
              gte: subMinutes(new Date(), 1454),
            },
          },
        }),
    });
  },
});

const Park = objectType({
  name: 'Park',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.slug();
    t.model.latitude();
    t.model.longitude();
    t.model.timezone();
    t.model.resort();
    t.model.rides();
  },
});

const Resort = objectType({
  name: 'Resort',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.slug();
    t.model.parks();
  },
});

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.waitTime();
    t.crud.waitTimes({
      filtering: true,
      ordering: true,
      pagination: true,
    });
    t.crud.resort();
    t.crud.resorts({
      filtering: true,
      ordering: true,
      pagination: true,
    });
    t.crud.park();
    t.crud.parks({
      filtering: true,
      ordering: true,
      pagination: true,
    });
    t.crud.ride();
    t.crud.rides({
      filtering: true,
      ordering: true,
      pagination: true,
    });
    t.crud.user();
    t.crud.users({
      filtering: true,
      ordering: true,
      pagination: true,
    });
    t.crud.job();
    t.crud.jobs({
      filtering: true,
      ordering: true,
      pagination: true,
    });
  },
});

/*
const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.crud.createOneUser();
  },
});
*/

const schema = makeSchema({
  types: [User, Job, WaitTime, Ride, Park, Resort, Query],
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: `${__dirname}/schema.graphql`,
    typegen: `${__dirname}/generated/nexus.ts`,
  },
  typegenAutoConfig: {
    contextType: 'Context',
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
});

export { schema };
