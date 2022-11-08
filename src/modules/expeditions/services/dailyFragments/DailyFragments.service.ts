import dayjs from 'dayjs';
import {
  DailyFragmentsTypes,
  DailyFragmentsServiceParams,
  DailyFragments,
} from './DailyFragments.types';
import { AddressWithId } from '../../interfaces/shared';
import { VisitModel } from '../../models/Visit.model';
import { ClaimResult } from '../tasks/Tasks.types';

export class DailyFragmentsService {
  private visitModel: VisitModel;

  constructor({ visitModel }: DailyFragmentsServiceParams) {
    this.visitModel = visitModel;
  }

  async getDailyVisitFragments({
    address,
    campaign_id,
  }: AddressWithId): Promise<DailyFragments> {
    const lastVisitDocument = await VisitModel.findOne({
      address,
      campaign_id,
    });

    const lastVisit = lastVisitDocument?.lastVisit || 0;
    const allVisits = lastVisitDocument?.allVisits || 0;

    return {
      allVisits,
      lastVisit,
    };
  }

  async claimDailyVisitFragments({
    address,
    campaign_id,
  }: AddressWithId): Promise<ClaimResult> {
    const lastVisitDocument = await VisitModel.findOne({
      address,
      campaign_id,
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
    await this.visitModel.updateOne(
      {
        address,
        campaign_id,
      },
      {
        address,
        lastVisit,
        allVisits,
        campaign_id,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return {
      claimedFragments: 0,
      type: DailyFragmentsTypes.VISIT,
    };
  }
}

export const dailyFragmentsService = new DailyFragmentsService({
  visitModel: VisitModel,
});
