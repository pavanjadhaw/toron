import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { User } from './entities/User';
import { UserResolver } from './resolvers/user';
import { __host__ } from './constants';

async function bootstrap() {
  // const db =
  await createConnection({
    type: 'postgres',
    username: 'postgres',
    password: 'postgres',
    host: __host__,
    logging: true,
    synchronize: true,
    entities: [User],
  });

  // await db.dropDatabase();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
  });

  const app = express();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`,
    ),
  );
}

bootstrap().catch(err => console.log(err));
