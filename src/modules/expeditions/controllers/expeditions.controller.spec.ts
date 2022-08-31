import { Server } from '@hapi/hapi';
import dayjs from 'dayjs';
import { Wallet } from 'ethers';
import mongoose from 'mongoose';
// Modules
import { create, configure } from '../../../server';
import { VisitModel } from '../models';

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
      expect((signupRes.result as any).data).toEqual({
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
      expect((testRes.result as any).data.allVisits).toEqual(1);
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
      expect((testRes.result as any).data.allVisits).toEqual(5);
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
      expect(Object.keys((testRes.result as any).data)).toEqual(
        expect.arrayContaining(['liquidityProvision', 'liquidityStaking'])
      );

      const { liquidityProvision, liquidityStaking } = (testRes.result as any)
        .data;

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
});
