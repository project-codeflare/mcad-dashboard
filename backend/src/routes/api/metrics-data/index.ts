import { secureRoute } from '../../../utils/route-security';
import { KubeFastifyInstance, OauthFastifyRequest } from '../../../types';
import { FastifyRequest, FastifyReply } from 'fastify';
import { getMetric, getMetricRange } from './metricsData';

module.exports = module.exports = async (fastify: KubeFastifyInstance) => {
  fastify.post(
    '/',
    secureRoute(fastify)(
      async (
        request: OauthFastifyRequest<{
          Body: { host: string; query: string; range: number[] };
        }>,
      ) => {
        const { host, query, range } = request.body;
        try {
          if (!range) {
            const data = await getMetric(host, query);
            return data;
          } else {
            const data = await getMetricRange(host, query, range);
            return data;
          }
        } catch (err) {
          return err;
        }
      },
    ),
  );
};
