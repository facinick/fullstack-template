import { and, not, or, rule, shield } from "graphql-shield"
// import { Role } from "@fullstack/prisma-client"

const isAuthenticated = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    return ctx.user !== null;
})

const isAdmin = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    return ctx.user.role === 'ADMIN'
})

const isUser = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    return ctx.user.role === 'USER'
})

const isAuthorized = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    return ctx.user !== null && parent.id === ctx.user.id;
})

// Permissions
export const permissions = shield({
    Mutation: {
        createOnePost: isAuthenticated,
        updateOnePost: and(isAuthenticated, isAuthorized),
        login: not(isAuthenticated),
        logout: isAuthenticated,
        // refresh: isAuthenticated,
        register: not(isAuthenticated),
        resetPassword: isAuthenticated,
    },
}, {
    allowExternalErrors: true,
    debug: true,
})