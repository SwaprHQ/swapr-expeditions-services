import { Server, ServerInjectOptions, ServerInjectResponse } from '@hapi/hapi';
import mongoose from 'mongoose';
import { configure, create } from '../../../../server';

export const startMockServer = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  const server = await configure(create());
  await server.initialize();
  return server;
};

export const stopMockServer = async (server: Server) => {
  await server.stop();
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};

export const createMakeRequest = <
  Payload extends ServerInjectOptions['payload']
>(
  server: Server,
  options: ServerInjectOptions
): TypedRequestCreator<Payload> => {
  return async (payload: Payload) =>
    server.inject({
      ...options,
      payload,
    });
};

export type TypedRequestCreator<Payload> = (
  payload: Payload
) => Promise<ServerInjectResponse>;
