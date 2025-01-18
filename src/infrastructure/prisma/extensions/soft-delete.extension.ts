import { Prisma } from '@prisma/client';

export const filterSoftDeleted = Prisma.defineExtension({
  name: 'filterSoftDeleted',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (
          model === 'User' ||
          model === 'Gathering' ||
          model === 'Feed' ||
          model === 'FeedComment'
        ) {
          if (
            operation === 'findUnique' ||
            operation === 'findFirst' ||
            operation === 'findMany'
          ) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          }
        }
      },
    },
  },
});
