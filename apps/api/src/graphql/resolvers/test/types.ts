import { wait } from '../../../utils/misc';
import { extendType, nonNull, objectType } from 'nexus';

const Test = objectType({
    name: "Test",
    definition(t) {
        t.nonNull.string("timestamp");
    },
});

export const testQueries = extendType({
    type: 'Query',
    definition(t) {
        t.nonNull.field("utc", {
            type: nonNull(Test),
            resolve: async (_root, _args, ctx) => {
                const utcDateString = new Date().toUTCString();
                return { timestamp: utcDateString };
            },
        })
        t.nonNull.field("wait", {
            type: nonNull(Test),
            resolve: async (_root, _args, ctx) => {
                const utcDateString = new Date().toUTCString();
                await wait(5);
                return { timestamp: utcDateString };
            },
        })
        t.nonNull.field("utcsecure", {
            type: nonNull(Test),
            resolve: async (_root, _args, ctx) => {
                const utcDateString = new Date().toUTCString();
                return { timestamp: utcDateString };
            },
        })
        t.nonNull.field("waitsecure", {
            type: nonNull(Test),
            resolve: async (_root, _args, ctx) => {
                const utcDateString = new Date().toUTCString();
                await wait(5);
                return { timestamp: utcDateString };
            },
        })
    },
})

export const testMutations = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field("utcmut", {
            type: nonNull(Test),
            resolve: async (_root, _args, ctx) => {
                const utcDateString = new Date().toUTCString();
                return { timestamp: utcDateString };
            },
        })
        t.nonNull.field("waitmut", {
            type: nonNull(Test),
            resolve: async (_root, _args, ctx) => {
                const utcDateString = new Date().toUTCString();
                await wait(5);
                return { timestamp: utcDateString };
            },
        })
        t.nonNull.field("utcsecuremut", {
            type: nonNull(Test),
            resolve: async (_root, _args, ctx) => {
                const utcDateString = new Date().toUTCString();
                return { timestamp: utcDateString };
            },
        })
        t.nonNull.field("waitsecuremut", {
            type: nonNull(Test),
            resolve: async (_root, _args, ctx) => {
                const utcDateString = new Date().toUTCString();
                await wait(5);
                return { timestamp: utcDateString };
            },
        })
    },
})