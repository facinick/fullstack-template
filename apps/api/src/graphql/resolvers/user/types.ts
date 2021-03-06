import { UnAuthenticatedError, UnAuthorizedError } from '../../../errors/FourHundred';
import { arg, enumType, extendType, inputObjectType, intArg, list, nonNull, nullable, objectType, stringArg } from 'nexus';

export const UserOrderBy = inputObjectType({
    name: "UserOrderBy",
    definition(t) {
        t.field("id", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});

export const Presence = objectType({
    name: 'Presence',
    definition(t) {
        t.model.id();
        t.model.bio();
        t.model.imageUrl();
        t.model.spaceX();
        t.model.spaceY();
        t.model.online();
        t.model.user();
        t.model.mood();
        t.model.color();
        t.model.smell();
        t.model.taste();
    },
});

export const User = objectType({
    name: 'User',
    definition(t) {
        t.model.id();
        t.model.role()
        t.model.posts()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.presence()
        t.nonNull.field("followers", {
            type: nonNull(list(nonNull("User"))),
            args: {
                skip: nullable(intArg()),
                take: nullable(intArg()),
                filterById: nullable(stringArg()),
                orderBy: arg({ type: UserOrderBy }),
            },
            resolve: async (_root, _args, ctx) => {
                const { prisma } = ctx;
                const { skip, take, filterById, orderBy } = _args;

                const filter = filterById
                    ? {
                        OR: [
                            { senderId: { contains: filterById } },
                        ],
                    }
                    : {}

                // skip and take if any from all the results
                const pagination: {
                    skip?: number;
                    take?: number;
                } = {};

                if (skip) {
                    pagination["skip"] = skip;
                }

                if (take) {
                    pagination["take"] = take;
                }

                const _friends = await prisma.friends.findMany({
                    where: {
                        receiverId: _root.id,
                        ...filter
                    },
                    ...pagination,
                    include: {
                        sender: true,
                    },
                    orderBy
                });
                const _followers = _friends.map((queryResult) => queryResult.sender);
                return _followers;
            },
        })
        t.nonNull.field("following", {
            type: nonNull(list(nonNull("User"))),
            args: {
                skip: nullable(intArg()),
                take: nullable(intArg()),
                filterById: nullable(stringArg()),
                orderBy: arg({ type: UserOrderBy }),
            },
            resolve: async (_root, _args, ctx) => {
                const { prisma } = ctx;
                const { skip, take, filterById, orderBy } = _args;

                const filter = filterById
                    ? {
                        OR: [
                            { receiverId: { contains: filterById } },
                        ],
                    }
                    : {}

                // skip and take if any from all the results
                const pagination: {
                    skip?: number;
                    take?: number;
                } = {};

                if (skip) {
                    pagination["skip"] = skip;
                }

                if (take) {
                    pagination["take"] = take;
                }

                const _friends = await prisma.friends.findMany({
                    where: { senderId: _root.id, ...filter },
                    ...pagination,
                    include: {
                        receiver: true,
                    },
                    orderBy
                });

                const _following = _friends.map((queryResult) => queryResult.receiver);

                return _following;
            },
        });
        t.model.chats({
            type: "Conversation",
            resolve: async (root, args, context) => {

                const { user, prisma } = context;

                if (!user) {
                    throw new UnAuthenticatedError();
                }

                if (user.id !== root.id) {
                    throw new UnAuthorizedError();
                }

                const _user = await prisma.user.findUnique({
                    where: {
                        id: root.id,
                    },
                    include: {
                        chats: true
                    }
                })

                return _user.chats;
            }
        });
    },
});

export const userQueries = extendType({
    type: 'Query',
    definition(t) {
        t.crud.user()
        t.crud.users({
            ordering: {
                id: true,
            },
            filtering: {
                id: true,
            }
        })
    },
})