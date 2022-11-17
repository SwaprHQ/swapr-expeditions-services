import dayjs from 'dayjs';
import {
  DailyFragmentsTypes,
  DailyFragmentsServiceParams,
  DailyFragments,
  DailyRewardsBaseParams,
} from './DailyFragments.types';
import { AddressWithId } from '../../interfaces/shared';
import { VisitModel } from '../../models/Visit.model';
import { ClaimResult } from '../tasks/Tasks.types';
import { addFragmentsWithMultiplier } from '../../utils/addFragmentsWithMultiplier';
import { DAILY_VISIT_MULTIPLAND } from '../../../config/config.service';

export class DailyFragmentsService {
  private visitModel: VisitModel;

  constructor({ visitModel }: DailyFragmentsServiceParams) {
    this.visitModel = visitModel;
  }

  async getDailyVisitFragments({
    address,
    campaign_id,
  }: AddressWithId): Promise<DailyFragments> {
    const dailyVisitDocument = await VisitModel.findOne({
      address,
      campaign_id,
    });

    const lastVisit = dailyVisitDocument?.lastVisit || 0;
    const nextVisit = lastVisit
      ? dayjs.utc(lastVisit).add(1, 'day').toDate()
      : new Date(0);
    const allVisits = dailyVisitDocument?.allVisits || 0;
    const fragments = dailyVisitDocument?.fragments || 0;

    return {
      allVisits,
      lastVisit,
      nextVisit,
      fragments,
    };
  }

  async claimDailyVisitFragments({
    address,
    campaign_id,
  }: AddressWithId): Promise<ClaimResult> {
    const dailyVisitDocument = await VisitModel.findOne({
      address,
      campaign_id,
    });

    if (dailyVisitDocument != null) {
      const diffBetweenLastVisitAndNow = dayjs
        .utc()
        .diff(dailyVisitDocument.lastVisit);
      if (diffBetweenLastVisitAndNow < 24 * 60 * 60 * 1000) {
        throw new Error('Daily visit already recorded');
      }
    }

    const lastVisit = dayjs.utc().toDate();
    const allVisits = (dailyVisitDocument?.allVisits || 0) + 1;
    const { claimedFragments, totalFragments } = addFragmentsWithMultiplier({
      fragmentsHeld: dailyVisitDocument?.fragments,
      countOfCompletions: dailyVisitDocument?.allVisits,
      fragmentsMultiplicand: DAILY_VISIT_MULTIPLAND,
    });

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
        fragments: totalFragments,
        campaign_id,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return {
      claimedFragments: claimedFragments,
      type: DailyFragmentsTypes.VISIT,
    };
  }

  async getTotalClaimedFragments({ address, campaign_id }: AddressWithId) {
    const { fragments } = await this.getDailyVisitFragments({
      address,
      campaign_id,
    });
    return fragments;
  }
}

export const dailyFragmentsService = new DailyFragmentsService({
  visitModel: VisitModel,
});
