import 'reflect-metadata';
import 'dotenv-safe/config';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { User } from './entities/User';
import { UserResolver } from './resolvers/user';

async function bootstrap() {
  const db = await createConnection({
    type: 'postgres',
    username: 'postgres',
    password: 'postgres',
    host: process.env.POSTGRES_HOST,
    logging: true,
    synchronize: true,
    entities: [User],
  });

  // await db.dropDatabase();
  if (db.isConnected) {
    console.log('📁 Connected to database');
  }

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis({
    host: process.env.REDIS_HOST,
  });

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    }),
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
  });

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`,
    ),
  );
}

bootstrap().catch(err => console.log(err));
