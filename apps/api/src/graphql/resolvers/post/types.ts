import { extendType, nonNull, objectType, stringArg } from 'nexus';

export const Post = objectType({
    name: 'Post',
    definition(t) {
        t.model.id();
        t.model.title();
        t.model.description();
        t.model.author();
        t.model.updatedAt();
        t.model.createdAt();
    },
});

export const PostQueries = extendType({
    type: 'Query',
    definition(t) {
        t.crud.post()
        t.crud.posts({
            ordering: {
                title: true,
            },
            filtering: {
                title: true,
                authorId: true,
            }
        })
    },
})

export const PostMutations = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createOnePost', {
            type: Post,
            args: {
                title: nonNull(stringArg()),
                description: nonNull(stringArg()),
            },
            resolve: async function (_root, _args, _ctx) {
                const { user } = _ctx;
                const { title, description } = _args;
                return _ctx.prisma.post.create({
                    data: {
                        title,
                        description,
                        author: {
                            connect: {
                                id: String(user.id)
                            }
                        }
                    }
                })
            }
        })
        t.field('updateOnePost', {
            type: Post,
            args: {
                title: nonNull(stringArg()),
                description: nonNull(stringArg()),
                id: nonNull(stringArg())
            },
            resolve: async function (_root, _args, _ctx) {
                const { user } = _ctx;
                const { title, description, id } = _args;

                const update = await _ctx.prisma.post.update({
                    where: {
                        id
                    },
                    data: {
                        title,
                        description,
                        author: {
                            connect: {
                                id: user.id
                            }
                        }
                    },
                });

                return update;
            },
        })
    }
})