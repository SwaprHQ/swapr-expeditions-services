import CatboxMemory from '@hapi/catbox-memory';
import { Server, ServerRegisterPluginObject } from '@hapi/hapi';
import Joi from 'joi';
import * as HapiSwagger from 'hapi-swagger';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import { SERVER_HOST, SERVER_PORT } from './modules/config/config.service';
import { RoutesPlugin } from './modules/routes';

export const DEFAULT_AUTH_STRATEGY = 'bearer';

/**
 * Creates a new Hapi Auth Server with the following config
 * - port = `SERVER_PORT` and host `SERVER_HOST`
 * - Cache engine set to `CatboxMemory`
 * - All routes support CORS and not authentication required
 * @returns Server
 */
export function create(): Server {
  return new Server({
    port: SERVER_PORT,
    host: SERVER_HOST,
    cache: {
      engine: new CatboxMemory(),
      name: 'memory',
    },
    routes: {
      auth: false,
      cors: {
        origin: ['*'],
      },
    },
  });
}

/**
 * Configures the server object
 * - Adds Joi as default validation engine
 * - Sets rate limit in production
 * - Register router
 */
export async function configure(server: Server): Promise<Server> {
  // Register Joi
  await server.validator(Joi);
  // Rate-limit in production
  if (process.env.NODE_ENV === 'production') {
    await server.register({
      plugin: require('hapi-rate-limit'),
      options: {
        userLimit: 60000,
      },
    });
  }

  const swaggerOptions: HapiSwagger.RegisterOptions = {
    info: {
      title: 'Swapr Expeditions API Documentation',
      version: '1.0',
    },
    basePath: '/v1.0',
    definitionPrefix: 'useLabel',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SwaggerPlugins: Array<ServerRegisterPluginObject<any>> = [
    { plugin: Inert },
    { plugin: Vision },
    { plugin: HapiSwagger, options: swaggerOptions },
  ];

  // Register routes
  await server.register([{ plugin: RoutesPlugin }, ...SwaggerPlugins]);
  // Return configured server
  return server;
}

/**
 * Starts a new created server with default config
 * @returns the started `Server` object
 */
export async function start() {
  const server = await configure(create());
  await server.start();
  return server;
}
