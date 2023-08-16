import { secureRoute } from '../../../utils/route-security';
import { KubeFastifyInstance } from '../../../types';
import { AllAppwrappers } from './appwrapper-utils';

module.exports = module.exports = async (fastify: KubeFastifyInstance) => {
  fastify.get(
    '/',
    secureRoute(fastify)(async () => {
      try {
        const wrappers = await new AllAppwrappers().get();
        return wrappers;
      } catch (err) {
        return err;
      }
    }),
  );
};
