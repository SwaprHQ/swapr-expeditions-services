import { APIGeneralResponse } from 'src/modules/shared/interfaces/response.interface';

export interface IGetDailyVisitsRequest extends Request {
  query: {
    address: string;
  };
}

export interface IAddDailyVisitsRequest extends Request {
  payload: {
    address: string;
    signature: string;
  };
}

export type IGetWeeklyRewardsRequest = IGetDailyVisitsRequest;
export type IClaimWeeklyRewardsRequest = IAddDailyVisitsRequest;

export type IGetDailyVisitsResponse = APIGeneralResponse<{
  address: string;
  allVisits: number;
  lastVisit: Date | number;
}>;

export type IAddDailyVisitsResponse = IGetDailyVisitsResponse;

