import { secureRoute } from '../../../utils/route-security';
import { KubeFastifyInstance, OauthFastifyRequest } from '../../../types';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AllAppwrappers } from './appwrapper-utils';

module.exports = module.exports = async (fastify: KubeFastifyInstance) => {
  fastify.get(
    '/',
    secureRoute(fastify)(async () => {
      try {
        const wrappers = await new AllAppwrappers().get();
        console.log('wrappers', wrappers);
        return wrappers;
      } catch (err) {
        return err;
      }
    }),
  );
};
