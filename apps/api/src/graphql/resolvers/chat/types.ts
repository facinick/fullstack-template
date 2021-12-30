import { UnAuthenticatedError, UnAuthorizedError } from "../../../errors/FourHundred";
import { stringArg, nonNull, extendType, list, nullable, intArg, arg, inputObjectType, enumType } from "nexus";
import { objectType } from "nexus";
import { User } from "..";
import Events, { SubscriptionEventType } from "../../../constants/graphEvents";

export const MutationType = enumType({
    name: "MutationType",
    members: ["created", "deleted", "updated"],
});

export interface SubscriptionPayload<T> {
    event: SubscriptionEventType;
    mutationType: 'created' | 'deleted' | 'updated';
    payload: T;
}

export const ChatSubscriptionType = objectType({
    name: 'ChatSubscriptionType',
    definition(t) {
        t.nonNull.field('mutationType', { type: MutationType });
        t.nonNull.string('event');
        t.nonNull.field('payload', { type: Chat });
    },
});

export const TextSubscriptionType = objectType({
    name: 'TextSubscriptionType',
    definition(t) {
        t.nonNull.field('mutationType', { type: MutationType });
        t.nonNull.string('event');
        t.nonNull.field('payload', { type: Text });
    },
});

type ChatCreatePaylaod = Conversation;

type ChatDeletePaylaod = Pick<Conversation, 'id'>;

type ChatUpdatePaylaod = Conversation;

type TextCreatePaylaod = Message;

// type TextDeletePaylaod = Pick<Conversation, 'id'>;

// type TextUpdatePaylaod = Conversation;


export const ConversationOrderBy = inputObjectType({
    name: "ConversationOrderBy",
    definition(t) {
        t.field("id", { type: Sort });
        t.field("createdAt", { type: Sort });
        t.field("name", { type: Sort });
        t.field("authorId", { type: Sort });
    },
});

import { InternalServerError } from "../../../errors/FiveHundred";
import { Sort } from "../user/types";
import { Conversation, Message } from "@fullstack/prisma-client";
import { isValidConversationName } from "./validation";

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
                filter: nullable(stringArg()),
                orderBy: arg({ type: ConversationOrderBy }),
            },
            resolve: async (_root, _args, ctx) => {
                const { prisma } = ctx;
                const { skip, take, filter, orderBy } = _args;
                const { user } = ctx;

                const where = filter
                    ? {
                        OR: [
                            { text: { contains: filter } },
                        ],
                    }
                    : {}

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
                        conversationId: _root.id,
                        ...where

                    },
                    ...pagination,
                    orderBy
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
                const { user, pubsub } = ctx;

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
                            participants,
                            author: {
                                connect: {
                                    id: user.id
                                }
                            },
                            texts
                        },
                        include: {
                            texts: true,
                            author: true,
                            participants: true,
                        },
                    });

                    const _chatPayload: SubscriptionPayload<ChatCreatePaylaod> = {
                        event: Events.CHAT,
                        mutationType: 'created',
                        payload: _conversation
                    }

                    pubsub.publish(Events.CHAT, _chatPayload);

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
                const { user, pubsub } = ctx;

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

                    const _chatPayload: SubscriptionPayload<ChatDeletePaylaod> = {
                        event: Events.CHAT,
                        mutationType: 'deleted',
                        payload: {
                            id: conversationId
                        }
                    }

                    pubsub.publish(Events.CHAT, _chatPayload);

                    return _conversation;
                }

                catch (e) {
                    throw new InternalServerError(`Error trying to delete a conversation: ${JSON.stringify(e)}`);
                }
            },
        });
        t.nonNull.field("updateOneConversation", {
            type: Chat,
            args: {
                conversationId: nonNull(stringArg()),
                name: stringArg(),
                participantIds: nonNull(list(stringArg())),
            },
            resolve: async (_root, _args, ctx) => {
                const { prisma } = ctx;
                const { conversationId, participantIds, name } = _args;
                const { user, pubsub } = ctx;

                if (!user) {
                    throw new UnAuthenticatedError();
                }

                let updateName = false;
                let updateParticipants = false;

                if (isValidConversationName(name)) {
                    updateName = true;
                }

                let newParticipants = [];
                if (participantIds.length > 0) {
                    console.log(`creating participnts update list`)
                    updateParticipants = true;
                    const _participants = (await prisma.conversation.findUnique({
                        where: {
                            id: conversationId,
                        },
                        select: {
                            participants: true
                        }
                    })).participants;
                    console.log(_participants)
                    _participants.forEach((user) => newParticipants.push(user.id));
                    newParticipants.push(participantIds);
                    console.log(newParticipants)
                }

                try {
                    const _conversation = await prisma.conversation.update({
                        where: {
                            id: conversationId,
                        },
                        data: {
                            ...(updateName && { name }),
                            ...(updateParticipants && {
                                participants: {
                                    connect: newParticipants.map(participantId => ({
                                        id: participantId,
                                    }))
                                }
                            }),
                        }
                    });

                    const _chatPayload: SubscriptionPayload<ChatUpdatePaylaod> = {
                        event: Events.CHAT,
                        mutationType: 'updated',
                        payload: _conversation
                    }

                    pubsub.publish(Events.CHAT, _chatPayload);

                    return _conversation;
                }

                catch (e) {
                    throw new InternalServerError(`Error trying to update a conversation: ${JSON.stringify(e)}`);
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
                const { prisma, pubsub } = _ctx;

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
                    },
                };

                const _text = await prisma.message.create({
                    data,
                    include: {
                        conversation: true,
                        author: true
                    }
                });

                const _textPayload: SubscriptionPayload<TextCreatePaylaod> = {
                    event: Events.TEXT,
                    mutationType: 'created',
                    payload: _text
                }

                pubsub.publish(Events.TEXT, _textPayload);

                return _text;
            }
        })
    },
});

export const TextSubscriptions = extendType({
    type: "Subscription",
    definition(t) {
        t.nonNull.field("text", {
            type: TextSubscriptionType,
            subscribe: (root, args, context) => {
                const { user } = context;
                // if (!user) {
                //     throw new UnAuthenticatedError();
                // }
                return context.pubsub.asyncIterator("TEXT")
            },
            //@ts-ignore
            resolve: (payload) => payload
        });
    },
});

export const ConversationSubscriptions = extendType({
    type: "Subscription",
    definition(t) {
        t.nonNull.field("chat", {
            type: ChatSubscriptionType,
            subscribe: (root, args, context) => {
                const { user } = context;
                // if (!user) {
                //     throw new UnAuthenticatedError();
                // }
                return context.pubsub.asyncIterator("CHAT")
            },
            //@ts-ignore
            resolve: (payload) => payload
        });
    },
});