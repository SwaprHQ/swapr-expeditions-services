import { Server, ServerInjectResponse } from '@hapi/hapi';
import dayjs from 'dayjs';
import { ethers, Wallet } from 'ethers';
import mongoose from 'mongoose';
// Modules
import { create, configure } from '../../../server';
import { ADD_CAMPAIGN_MESSAGE } from '../constants';
import { VisitModel } from '../models';
import { CampaignModel } from '../models/Campaign.model';
import { AddCampaignRequest } from './types';

describe('Expeditions Controllers', () => {
  let server: Server;
  // Random test wallet
  const testWallet = Wallet.createRandom();

  beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI as string);
    server = await configure(create());
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  describe('getDailyVisitFragments', () => {
    test('should return default values when address has no previous data', async () => {
      const signupRes = await server.inject({
        method: 'GET',
        url: `/expeditions/daily-visits?address=${testWallet.address}`,
      });
      expect(signupRes.statusCode).toBe(200);
      expect(signupRes.result as any).toEqual({
        address: testWallet.address,
        allVisits: 0,
        lastVisit: 0,
      });
    });
  });

  describe('claimDailyVisitFragments', () => {
    const signaturePayload = 'Claim Swapr daily visit fragments';

    test('should return updated allVisits count after claimng fragment', async () => {
      const signature = await testWallet.signMessage(signaturePayload);
      const testRes = await server.inject({
        method: 'POST',
        url: `/expeditions/daily-visits`,
        payload: {
          signature,
          address: testWallet.address,
        },
      });
      expect(testRes.statusCode).toBe(200);
      expect((testRes.result as any).allVisits).toEqual(1);
    });

    test('should increase visits by one when address has previous visits', async () => {
      const testDate = dayjs().utc().add(-2, 'days').toDate();

      // Inject data into mongoose
      await new VisitModel({
        address: testWallet.address,
        allVisits: 4,
        lastVisit: testDate,
      }).save();

      const signature = await testWallet.signMessage(signaturePayload);

      const testRes = await server.inject({
        method: 'POST',
        url: `/expeditions/daily-visits`,
        payload: {
          signature,
          address: testWallet.address,
        },
      });

      expect(testRes.statusCode).toBe(200);
      expect((testRes.result as any).allVisits).toEqual(5);
    });
  });

  describe('getWeeklyFragments', () => {
    test('should return data from the subgraphs', async () => {
      const address = testWallet.address;

      const testRes = await server.inject({
        method: 'GET',
        url: `/expeditions/weekly-fragments?address=${address}`,
      });

      expect(testRes.statusCode).toBe(200);
      expect(Object.keys(testRes.result as any)).toEqual(
        expect.arrayContaining(['liquidityProvision', 'liquidityStaking'])
      );

      const { liquidityProvision, liquidityStaking } = testRes.result as any;

      const expectedValues = expect.objectContaining({
        claimableFragments: expect.any(Number),
        claimedFragments: expect.any(Number),
        totalAmountUSD: expect.any(Number),
      });

      expect(liquidityProvision).toEqual(expectedValues);
      expect(liquidityStaking).toEqual(expectedValues);
    });
    test('should return an error when ', async () => {
      const address = testWallet.address;

      const testRes = await server.inject({
        method: 'GET',
        url: `/expeditions/weekly-fragments?address=${address}&week=203515-01-01`,
      });

      expect(testRes.statusCode).toBe(400);
      console.log(testRes.result);
    });
  });

  describe('addCampaign', () => {
    let res: ServerInjectResponse;
    let makeRequest: (
      payload: Omit<AddCampaignRequest['payload'], 'address' | 'signature'>
    ) => Promise<ServerInjectResponse>;

    beforeAll(async () => {
      const signature = await testWallet.signMessage(ADD_CAMPAIGN_MESSAGE);

      makeRequest = async (
        payload: Omit<AddCampaignRequest['payload'], 'address' | 'signature'>
      ) => {
        return await server.inject({
          method: 'POST',
          url: `/expeditions/campaigns/add`,
          payload: {
            signature,
            address: testWallet.address,
            ...payload,
          } as AddCampaignRequest['payload'],
        });
      };
    });

    test('should validate payload', async () => {
      const baseDates = {
        startDate: new Date('2022-01-03'),
        endDate: new Date('2022-01-09'),
        redeemEndDate: new Date('2022-01-16'),
      };

      res = await makeRequest({
        ...baseDates,
        startDate: new Date('2022-01-02'), // Other than Monday
      });

      expect(res.statusCode === 400);
      res = await makeRequest({
        ...baseDates,
        endDate: new Date('2022-01-08'), // Other than Sunday
      });

      expect(res.statusCode === 400);

      res = await makeRequest({
        ...baseDates,
        endDate: new Date('2022-01-01'), // Earlier than startDate
      });

      expect(res.statusCode === 400);

      res = await makeRequest({
        ...baseDates,
        redeemEndDate: new Date('2022-01-01'), // Earlier than endDate
      });

      expect(res.statusCode === 400);
    });

    test('should prevent adding campaign if there is overlapping one', async () => {
      const overlapError = {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Overlapping campaign already exists.',
      };

      await CampaignModel.insertMany([
        {
          startDate: new Date('2022-01-10'),
          endDate: new Date('2022-01-16'),
          redeemEndDate: new Date('2022-01-30'),
          initiatorAddress: ethers.constants.AddressZero,
        },
      ]);

      // Req:  <===>
      // DB :  <===>
      res = await makeRequest({
        startDate: new Date('2022-01-10'),
        endDate: new Date('2022-01-16'),
        redeemEndDate: new Date('2022-01-30'),
      });

      expect(res.result).toEqual(overlapError);

      // Req: <===>
      // DB :   <===>
      res = await makeRequest({
        startDate: new Date('2022-01-03'),
        endDate: new Date('2022-01-09'),
        redeemEndDate: new Date('2022-01-16'),
      });

      expect(res.result).toEqual(overlapError);

      // Req:   <===>
      // DB : <===>
      res = await makeRequest({
        startDate: new Date('2022-01-17'),
        endDate: new Date('2022-01-23'),
        redeemEndDate: new Date('2022-02-06'),
      });

      expect(res.result).toEqual(overlapError);

      // Req:  <=====>
      // DB :   <===>
      res = await makeRequest({
        startDate: new Date('2022-01-03'),
        endDate: new Date('2022-01-09'),
        redeemEndDate: new Date('2022-02-06'),
      });

      expect(res.result).toEqual(overlapError);

      // Req:  <===>
      // DB :  <=====>
      res = await makeRequest({
        startDate: new Date('2022-01-10'),
        endDate: new Date('2022-01-16'),
        redeemEndDate: new Date('2022-01-23'),
      });

      expect(res.result).toEqual(overlapError);

      // Req:  <===>
      // DB :       <===>
      res = await makeRequest({
        startDate: new Date('2022-02-07'),
        endDate: new Date('2022-02-13'),
        redeemEndDate: new Date('2022-02-20'),
      });

      expect(res.statusCode).toEqual(200);
    });
  });
});
