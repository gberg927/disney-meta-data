import { nexusPrismaPlugin } from 'nexus-prisma';
import { makeSchema, objectType } from '@nexus/schema';

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

const Query = objectType({
  name: 'Query',
  definition(t) {
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
  types: [Ride, Park, Resort, User, Job, Query],
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
