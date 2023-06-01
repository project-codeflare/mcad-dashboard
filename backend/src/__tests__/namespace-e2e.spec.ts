import { AllAppwrappers } from '../routes/api/appwrappers.ts/appwrapper-utils';

jest.setTimeout(60000);

describe('allnamespaces should get all namespace data from cluster', () => {
  let namespaces: AllAppwrappers;
  let res: any;

  beforeAll(async () => {
    namespaces = new AllAppwrappers();
    res = await namespaces.get();
  });

  it('Should return a response with a parsable body', async () => {
    const parsedRes = JSON.parse(res.body);
    expect(typeof parsedRes).toBe('object');
    expect(typeof parsedRes).not.toBe(null);
  });

  it('Should have all required fields', async () => {
    const parsedRes = JSON.parse(res.body);
    expect(typeof parsedRes.metadata).not.toBe(null);
    expect(typeof parsedRes.status).not.toBe(null);
  });
});
