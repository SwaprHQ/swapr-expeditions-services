import dayjs from 'dayjs';
import { VisitModel } from '../../models/Visit.model';

export class DailyFragmentsService {
  private visitModel: VisitModel;

  constructor({ visitModel }: { visitModel: VisitModel }) {
    this.visitModel = visitModel;
  }

  async getDailyFragments({ address }: { address: string }) {
    const lastVisitDocument = await VisitModel.findOne({
      address,
    });

    const lastVisit = lastVisitDocument?.lastVisit || 0;
    const allVisits = lastVisitDocument?.allVisits || 0;

    return {
      address,
      allVisits,
      lastVisit,
    };
  }

  async claimDailyFragments({ address }: { address: string }) {
    const lastVisitDocument = await VisitModel.findOne({
      address,
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
      address,
      lastVisit,
      allVisits,
    };
  }
}

export const dailyFragmentsService = new DailyFragmentsService({
  visitModel: VisitModel,
});
