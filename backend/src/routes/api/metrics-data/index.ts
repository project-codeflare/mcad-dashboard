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
          Body: { query: string; range: number[] };
        }>,
      ) => {
        const { query, range } = request.body;
        try {
          if (!range) {
            const data = await getMetric(query);
            return data;
          } else {
            const data = await getMetricRange(query, range);
            return data;
          }
        } catch (err) {
          return err;
        }
      },
    ),
  );
};
