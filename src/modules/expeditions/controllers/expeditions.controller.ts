import { captureException } from '@sentry/node';
import { Request } from '@hapi/hapi';
import Boom from '@hapi/boom';

interface IGetDailyVisitsRequest extends Request {
  query: {
    address: string;
  };
}

/**
 * Get daily visits for a given address
 */
export async function getDailyVisitsController(req: IGetDailyVisitsRequest) {
  try {
    const { address } = req.query;

    return {
      data: {
        address,
        dailVisits: 0,
        lastVisitTimestamp: 0,
      },
      message: 'not implemented',
    };
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

