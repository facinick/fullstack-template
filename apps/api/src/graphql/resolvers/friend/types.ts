import { InternalServerError } from "../../../errors/FiveHundred";
import { ConflictError, UnAuthenticatedError } from "../../../errors/FourHundred";
import { stringArg, nonNull, extendType, objectType, subscriptionField } from "nexus";
import { User } from "../user";

export const Friend = objectType({
    name: 'Friends',
    definition(t) {
        t.model.receiverId()
        t.model.createdAt()
        t.model.senderId()
        t.model.createdAt()
        t.model.updatedAt()
    },
});
export const FriendMutations = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("follow", {
            type: User,
            args: {
                userId: nonNull(stringArg()),
            },
            resolve: async (_root, _args, ctx) => {
                const { prisma } = ctx;
                const { userId } = _args;
                const { user, pubsub } = ctx;

                if (!user) {
                    throw new UnAuthenticatedError();
                }

                console.log(`follow mutation ${user.id} -> ${userId}`);

                try {
                    const userAndFriendRequest = await prisma.friends.create({
                        data: {
                            senderId: user.id,
                            receiverId: userId
                        },
                        include: {
                            sender: true
                        }
                    });

                    pubsub.publish("FOLLOW", userAndFriendRequest);

                    return userAndFriendRequest.sender;
                } catch (e) {
                    if (e.code === "P2002") {
                        throw new ConflictError("User you're trying to befriend is already your friend!");
                    } else if (e.code === "P2003") {
                        throw new ConflictError("User you're trying to befriend does not exist!");
                    }
                    else {
                        throw new InternalServerError(`Error tryning to follow user ${userId}: ${JSON.stringify(e)}`);
                    }
                }
            },
        });
        t.nonNull.field("unfollow", {
            type: User,
            args: {
                userId: nonNull(stringArg()),
            },
            resolve: async (_root, _args, ctx) => {
                const { prisma } = ctx;
                const { userId } = _args;
                const { user, pubsub } = ctx;

                if (!user) {
                    throw new UnAuthenticatedError();
                }

                try {
                    const userAndFriendRequest = await prisma.friends.delete({
                        where: {
                            senderId_receiverId: {
                                senderId: user.id,
                                receiverId: userId
                            }
                        },
                        include: {
                            sender: true,
                        }
                    });

                    pubsub.publish("UNFOLLOW", userAndFriendRequest);

                    return userAndFriendRequest.sender;
                } catch (e) {
                    if (e.code === "P2003") {
                        throw new ConflictError("User you're trying to unfollow does not exist!");
                    }
                    else {
                        throw new InternalServerError(`Error tryning to unfollow user ${userId}: ${JSON.stringify(e)}`);
                    }
                }
            },
        });
    },
});

export const FriendSubscriptions = extendType({
    type: "Subscription",
    definition(t) {
        t.nonNull.field("follow", {
            type: Friend,
            subscribe: (root, args, context) => {
                const { user } = context;
                if (!user) {
                    throw new UnAuthenticatedError();
                }
                return context.pubsub.asyncIterator("FOLLOW")
            },
            //@ts-ignore
            resolve: (payload) => payload
        });
        t.nonNull.field("unfollow", {
            type: Friend,
            subscribe: (root, args, context) => {
                const { user } = context;
                if (!user) {
                    throw new UnAuthenticatedError();
                }
                return context.pubsub.asyncIterator("UNFOLLOW")
            },
            //@ts-ignore
            resolve: (payload) => payload
        });
    },
});