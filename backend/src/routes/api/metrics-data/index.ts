import { secureRoute } from '../../../utils/route-security';
import { KubeFastifyInstance, OauthFastifyRequest } from '../../../types';
import { FastifyRequest, FastifyReply } from 'fastify';
import { getMetric, getMetricRange, getHost } from './metricsData';

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
        let host: string;

        try {
          host = await getHost();
        } catch (err) {
          return err;
        }

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
