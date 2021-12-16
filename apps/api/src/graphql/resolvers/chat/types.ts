import { UnAuthenticatedError, UnAuthorizedError } from "../../../errors/FourHundred";
import { stringArg, nonNull, extendType, list, nullable, intArg, arg } from "nexus";
import { objectType } from "nexus";
import { User } from "..";
import { LinkOrderByInput } from "../user/types";
import { InternalServerError } from "../../../errors/FiveHundred";

export const Text = objectType({
    name: 'Message',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.text()
        t.model.author()
        t.model.conversation()
    },
});

export const Chat = objectType({
    name: 'Conversation',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.updatedAt()
        t.model.participants()
        t.nonNull.field("texts", {
            type: nonNull(list(Text)),
            args: {
                skip: nullable(intArg()),
                take: nullable(intArg()),
            },
            resolve: async (_root, _args, ctx) => {
                const { prisma } = ctx;
                const { skip, take } = _args;
                const { user } = ctx;

                console.log(user);

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

                const _messages = await prisma.message.findMany({
                    where: {
                        conversationId: _root.id
                    },
                    ...pagination,
                })

                return _messages;
            },
        });
    },
});

export const ChatQueries = extendType({
    type: 'Query',
    definition(t) {
    },
})

export const ChatMutations = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createOneConversation", {
            type: Chat,
            args: {
                participantIds: nonNull(list(nonNull(stringArg()))),
                text: nullable(stringArg()),
            },
            resolve: async (_root, _args, ctx) => {
                const { prisma } = ctx;
                const { participantIds, text } = _args;
                const { user } = ctx;

                if (!user) {
                    throw new UnAuthenticatedError();
                }

                const userAndparticipantIds: Array<string> = [...participantIds, user.id];

                const participants = {
                    connect: userAndparticipantIds.map(participantId => ({
                        id: participantId,
                    }))
                };

                const texts = text ? {
                    create: {
                        text,
                        author: {
                            connect: {
                                id: user.id
                            }
                        }
                    }
                } : {};

                try {
                    const _conversation = await prisma.conversation.create({
                        data: {
                            ...participants,
                            ...texts,
                            authorId: user.id
                        }
                    });

                    return _conversation;
                }

                catch (e) {
                    console.log(e);
                    throw new InternalServerError(`Error trying to create a conversation: ${JSON.stringify(e)}`);
                }
            },
        });
        t.nonNull.field("deleteOneConversation", {
            type: Chat,
            args: {
                conversationId: nonNull(stringArg()),
            },
            resolve: async (_root, _args, ctx) => {
                const { prisma } = ctx;
                const { conversationId } = _args;
                const { user } = ctx;

                if (!user) {
                    throw new UnAuthenticatedError();
                }

                try {
                    const _conversation = await prisma.conversation.update({
                        where: {
                            id: conversationId,
                        },
                        data: {
                            texts: {
                                deleteMany: {}
                            }
                        }
                    });

                    return _conversation;
                }

                catch (e) {
                    throw new InternalServerError(`Error trying to delete a conversation: ${JSON.stringify(e)}`);
                }
            },
        });
    },
});

export const TextMutations = extendType({
    type: "Mutation",
    definition(t) {
        t.field('createOneText', {
            type: nonNull(Text),
            args: {
                conversationId: nonNull(stringArg()),
                text: nonNull(stringArg()),
            },
            resolve: async function (_root, _args, _ctx) {
                const { user } = _ctx;
                const { text, conversationId } = _args;
                const { prisma } = _ctx;

                if (!user) {
                    throw new UnAuthenticatedError();
                }

                const data = {
                    text,
                    author: {
                        connect: {
                            id: user.id
                        }
                    },
                    conversation: {
                        connect: {
                            id: conversationId
                        }
                    }
                };

                const _text = prisma.message.create({
                    data
                })

                return _text;
            }
        })
    },
});

// export const TextSubscriptions = extendType({
//     type: "Subscription",
//     definition(t) {
//         t.field('subscribeToText', {
//             type: Text,
//             subscribe: async (root, args, context) => {
//                 const { prisma} = context;
//                 return prisma.
//             },
//             resolve: payload => {
//                 return payload;
//             }
//         })
//     },
// });