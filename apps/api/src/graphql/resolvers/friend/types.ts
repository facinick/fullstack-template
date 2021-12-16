import { InternalServerError } from "../../../errors/FiveHundred";
import { ConflictError, UnAuthenticatedError } from "../../../errors/FourHundred";
import { stringArg, nonNull, extendType } from "nexus";
import { User } from "../user";

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
                const { user } = ctx;

                console.log(`follow mutation ${user.id} -> ${userId}`);

                if (!user) {
                    throw new UnAuthenticatedError();
                }

                let _userAndFriendRequest;

                try {
                    _userAndFriendRequest = await prisma.friends.create({
                        data: {
                            senderId: user.id,
                            receiverId: userId
                        },
                        include: {
                            sender: true
                        }
                    });
                    console.log(_userAndFriendRequest);
                    return _userAndFriendRequest.sender;
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
                const { user } = ctx;

                if (!user) {
                    throw new UnAuthenticatedError();
                }

                let _userAndFriendRequest;

                try {
                    _userAndFriendRequest = await prisma.friends.delete({
                        where: {
                            senderId_receiverId: {
                                senderId: user.id,
                                receiverId: userId
                            }
                        },
                        include: {
                            sender: true
                        }
                    });
                    return _userAndFriendRequest.sender;
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