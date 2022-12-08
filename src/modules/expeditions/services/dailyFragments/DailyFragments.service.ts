import dayjs from 'dayjs';
import { HydratedDocument } from 'mongoose';
import {
  DailyFragmentsTypes,
  DailyFragmentsServiceParams,
  DailyFragments,
  RegisterDailySwapParams,
} from './DailyFragments.types';
import { AddressWithId } from '../../interfaces/shared';
import { VisitModel } from '../../models/Visit.model';
import { ClaimTaskResult } from '../tasks/Tasks.types';
import { addFragmentsWithMultiplier } from '../../utils/addFragmentsWithMultiplier';
import {
  DAILY_SWAPS_MIN_USD_AMOUNT,
  DAILY_SWAPS_MULTIPLAND,
  DAILY_VISIT_MULTIPLAND,
} from '../../../config/config.service';
import { DailySwapsModel } from '../../models/DailySwaps.model';
import { IDailySwaps } from '../../interfaces/IDailySwaps.interface';

export class DailyFragmentsService {
  private visitModel: VisitModel;
  private dailySwapsModel: DailySwapsModel;

  constructor({ visitModel, dailySwapsModel }: DailyFragmentsServiceParams) {
    this.visitModel = visitModel;
    this.dailySwapsModel = dailySwapsModel;
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
  }: AddressWithId): Promise<ClaimTaskResult> {
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

  async getDailySwapsFragments({ address, campaign_id }: AddressWithId) {
    const dailySwapsDocuments = await this.dailySwapsModel.find({
      address,
      campaign_id,
    });

    return dailySwapsDocuments.reduce(
      (total, dailySwaps) => {
        if (dailySwaps.fragments) {
          total.fragments += dailySwaps.fragments;
          total.numberOfCompletions += 1;
        }

        return total;
      },
      {
        fragments: 0,
        numberOfCompletions: 0,
      }
    );
  }

  async registerDailySwap({
    address,
    campaign_id,
    tradeUSDValue,
  }: RegisterDailySwapParams) {
    const currentDay = dayjs.utc().startOf('day').toDate();

    let currentDaySwapsDocument: HydratedDocument<IDailySwaps> | undefined;
    let claimedFragments = 0;

    const dailySwapsDocuments = await this.dailySwapsModel.find({
      address,
      campaign_id,
    });

    currentDaySwapsDocument = dailySwapsDocuments.find(
      dailySwaps => +dailySwaps.date === +currentDay
    );

    if (!currentDaySwapsDocument) {
      currentDaySwapsDocument = new DailySwapsModel({
        address,
        campaign_id,
        date: currentDay,
        fragments: 0,
        totalTradeUSDValue: 0,
      });
    }

    currentDaySwapsDocument.totalTradeUSDValue += tradeUSDValue;

    if (
      currentDaySwapsDocument.totalTradeUSDValue >=
        DAILY_SWAPS_MIN_USD_AMOUNT &&
      currentDaySwapsDocument.fragments === 0
    ) {
      const countOfCompletions = dailySwapsDocuments.filter(
        dailySwaps => dailySwaps.fragments > 0
      ).length;

      claimedFragments = addFragmentsWithMultiplier({
        countOfCompletions,
        fragmentsMultiplicand: DAILY_SWAPS_MULTIPLAND,
      }).claimedFragments;

      currentDaySwapsDocument.fragments = claimedFragments;
    }

    await currentDaySwapsDocument.save();

    return {
      claimedFragments,
      totalTradeUSDValue: currentDaySwapsDocument.totalTradeUSDValue,
    };
  }

  async getTotalClaimedFragments({ address, campaign_id }: AddressWithId) {
    const { fragments: visitsFragments } = await this.getDailyVisitFragments({
      address,
      campaign_id,
    });

    const { fragments: swapsFragments } = await this.getDailySwapsFragments({
      address,
      campaign_id,
    });

    return visitsFragments + swapsFragments;
  }
}

export const dailyFragmentsService = new DailyFragmentsService({
  visitModel: VisitModel,
  dailySwapsModel: DailySwapsModel,
});
