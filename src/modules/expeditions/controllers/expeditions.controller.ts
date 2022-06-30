import { captureException } from '@sentry/node';
import { Request } from '@hapi/hapi';
import Boom from '@hapi/boom';
import { ethers } from 'ethers';
import dayjs from 'dayjs';
import dayjsUtcPlugin from 'dayjs/plugin/utc';

import { VisitModel } from '../models';

dayjs.extend(dayjsUtcPlugin);

interface IGetDailyVisitsRequest extends Request {
  query: {
    address: string;
  };
}

const defaultDailyVisitPayload = 'Swapr Dail Visit';

interface IAddDailyVisitsRequest extends Request {
  payload: {
    signature: string;
  };
}

/**
 * Get daily visits for a given address
 */
export async function getDailyVisitsController(req: IGetDailyVisitsRequest) {
  try {
    const { address } = req.query;

    const lastVisitDocument = await VisitModel.findOne({
      address,
    });

    const lastVisit = lastVisitDocument?.lastVisit || 0;
    const allVisits = lastVisitDocument?.allVisits || 0;

    return {
      data: {
        address,
        allVisits,
        lastVisit,
      },
    };
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

/**
 * Add daily visits for a given address
 */
export async function addDailyVisitsController(req: IAddDailyVisitsRequest) {
  try {
    const { signature } = req.payload;

    const address = ethers.utils.verifyMessage(
      defaultDailyVisitPayload,
      signature
    );

    const lastVisitDocument = await VisitModel.findOne({
      address: address,
    });

    if (lastVisitDocument != null) {
      const diffBetweenLastVisitAndNow = dayjs
        .utc()
        .diff(lastVisitDocument.lastVisit);
      if (diffBetweenLastVisitAndNow < 24 * 60 * 60 * 1000) {
        throw new Error('Daily visit already recorded');
      }
    }

    const lastVisit = dayjs.utc().toDate();
    const allVisits = lastVisitDocument ? lastVisitDocument.allVisits + 1 : 1;

    // Record the new visit
    await VisitModel.updateOne(
      {
        address,
      },
      {
        address,
        lastVisit,
        allVisits,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Return the new visit
    return {
      data: {
        address,
        lastVisit,
        allVisits,
      },
    };
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

