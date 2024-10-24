import { useTestApp } from './utils/use-test-app';

describe('HealthController', () => {
  const { getRequest } = useTestApp();

  it('GET /api/health', async () => {
    await getRequest().get('/api/health').expect(200).expect({
      status: 'ok',
      info: {},
      error: {},
      details: {},
    });
  });
});
