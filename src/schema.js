import {
  arg,
  inputObjectType,
  makeSchema,
  nonNull,
  objectType,
  asNexusMethod,
} from 'nexus';
import { nexusPrisma } from 'nexus-plugin-prisma';
import { DateTimeResolver } from 'graphql-scalars';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { getJobWaitTimes, getRideWaitTime, getRideWaitTimes } from './influxdb';

const GQLDate = asNexusMethod(DateTimeResolver, 'datetime');

const LoginInput = inputObjectType({
  name: 'LoginInput',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('password');
  },
});

const LogoutPayload = objectType({
  name: 'LogoutPayload',
  definition(t) {
    t.nonNull.string('message');
  },
});

const WaitTimeWhereInput = inputObjectType({
  name: 'WaitTimeWhereInput',
  definition(t) {
    t.int('rideId');
    t.datetime('startDate');
    t.datetime('endDate');
  },
});

const WaitTime = objectType({
  name: 'WaitTime',
  definition(t) {
    t.nonNull.int('resortId');
    t.nonNull.int('parkId');
    t.nonNull.int('rideId');
    t.nonNull.datetime('timestamp');
    t.nonNull.int('amount');
    t.nonNull.boolean('active');
    t.nonNull.string('status');
  },
});

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.email();
    t.model.jobs();
  },
});

const Job = objectType({
  name: 'Job',
  definition(t) {
    t.model.id();
    t.model.startTime();
    t.model.endTime();
    t.model.user();
    t.model.created();
    t.list.field('waitTimes', {
      type: WaitTime,
      resolve: async (root) => {
        const data = await getJobWaitTimes(root.startTime);
        return data.map((waitTime) => ({
          resortId: waitTime.resortId,
          parkId: waitTime.parkId,
          rideId: waitTime.rideId,
          timestamp: waitTime._time,
          amount: waitTime.amount,
          active: waitTime.active,
          status: waitTime.status,
        }));
      },
    });
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
    t.nullable.field('waitTime', {
      type: WaitTime,
      resolve: async (root) => {
        const data = await getRideWaitTime(root.id);
        return (
          (data && {
            resortId: data.resortId,
            parkId: data.parkId,
            rideId: data.rideId,
            timestamp: data._time,
            amount: data.amount,
            active: data.active,
            status: data.status,
          }) ||
          null
        );
      },
    });
  },
});

const Park = objectType({
  name: 'Park',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.slug();
    t.model.abbreviation();
    t.model.latitude();
    t.model.longitude();
    t.model.timezone();
    t.model.resort();
    t.model.rides({
      filtering: true,
      ordering: true,
      pagination: true,
    });
  },
});

const Resort = objectType({
  name: 'Resort',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.slug();
    t.model.abbreviation();
    t.model.parks();
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
    t.list.field('waitTimes', {
      type: WaitTime,
      args: {
        where: arg({
          type: 'WaitTimeWhereInput',
        }),
      },
      resolve: async (root, args) => {
        const { rideId, startDate, endDate } = args.where;
        const data = await getRideWaitTimes(rideId, startDate, endDate);
        return data.map((waitTime) => ({
          resortId: waitTime.resortId,
          parkId: waitTime.parkId,
          rideId: waitTime.rideId,
          timestamp: waitTime._time,
          amount: waitTime.amount,
          active: waitTime.active,
          status: waitTime.status,
        }));
      },
    });
    t.field('currentUser', {
      type: 'User',
      resolve: async (parent, args, { prisma, req }) => {
        const { userId } = req;
        if (!userId) {
          return null;
        }
        const user = prisma.user.findUnique({
          where: {
            id: Number(userId),
          },
        });
        return user;
      },
    });
  },
});

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.nonNull.field('login', {
      type: 'User',
      args: {
        data: nonNull(
          arg({
            type: 'LoginInput',
          })
        ),
      },
      resolve: async (_, { data: { email, password } }, { prisma, res }) => {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (!user) {
          throw new Error('User does not exist');
        }
        const isPasswordMatch = await compare(password, user.password);
        if (!isPasswordMatch) {
          throw new Error(`Invalid Password.`);
        }
        const token = await sign({ userId: user.id }, process.env.APP_SECRET, {
          expiresIn: '7d',
        });

        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
        });

        return user;
      },
    });
    t.nonNull.field('logout', {
      type: 'LogoutPayload',
      resolve: async (_, args, { res }) => {
        res.clearCookie('token');
        return { message: 'You have been logged out.' };
      },
    });
  },
});

const schema = makeSchema({
  types: [
    User,
    Job,
    WaitTime,
    Ride,
    Park,
    Resort,
    Query,
    Mutation,
    LoginInput,
    LogoutPayload,
    GQLDate,
    WaitTimeWhereInput,
  ],
  plugins: [nexusPrisma({ experimentalCRUD: true })],
  outputs: {
    schema: `${__dirname}/../schema.graphql`,
    typegen: `${__dirname}/generated/nexus.ts`,
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
});

export { schema };
