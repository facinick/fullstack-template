import { makeSchema } from 'nexus';
import { nexusPrisma } from 'nexus-plugin-prisma';
import * as path from 'path';
import * as types from './resolvers';
import { applyMiddleware } from 'graphql-middleware'
import { permissions } from './permissions';

const PRISMA_PATH = path.resolve('libs/prisma-client/src');

export const schema = applyMiddleware(makeSchema({
  plugins: [
    nexusPrisma({
      experimentalCRUD: true,
      inputs: {
        prismaClient: PRISMA_PATH,
      },
    }),
  ],
  outputs: {
    schema: path.join(__dirname, '../generated/schema.graphql'),
    typegen: path.join(__dirname, '../generated/nexus.ts'),
  },
  contextType: {
    module: path.join(process.cwd(), 'apps/api/src/graphql/context.ts'),
    export: 'Context',
  },
  types,
}), permissions);
