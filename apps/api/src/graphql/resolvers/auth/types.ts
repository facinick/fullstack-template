import { stringArg, nonNull, extendType } from "nexus";
import * as bcrypt from "bcrypt";
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from "../../../constants/authConstants";
import {
    generateTokens,
    getCookies,
    verifyRefreshToken,
} from "../../../utils/auth";

import { objectType } from "nexus";
import { User } from "..";
import { isValidPassword, isValidID } from '../../../utils/validations';

const Token = objectType({
    name: "Token",
    definition(t) {
        t.string("accessToken");
        t.int("accessTokenExpiry");
        t.int("refreshTokenExpiry");
    },
});

export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t) {
        t.nonNull.field("user", { type: User });
        t.field("tokens", { type: Token });
    },
});

export const AuthMutations = extendType({
    type: "Mutation",
    definition(t) {
        t.field("register", {
            type: AuthPayload,
            args: {
                id: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            async resolve(_root, args, context) {
                // take the inputs from arguments
                const { id, password } = args;
                const { res, prisma } = context;

                // validate
                const isValidPass = await isValidPassword(password);
                const isValidEmai = isValidID(id);

                if (!isValidEmai.isValid) {
                    throw new Error(isValidEmai.message);
                }

                if (!isValidPass.isValid) {
                    throw new Error(isValidPass.message);
                }

                // if inputs are valid, encrypt the password to store in database
                // don't store password as it is in database, if it ever gets leaked all passwords
                // are gone.
                const encryptedPassword = await bcrypt.hash(password, 10);
                let user;
                try {
                    user = await prisma.user.create({
                        data: {
                            id: id,
                            password: encryptedPassword,
                        },
                    });
                } catch (e) {
                    if (e.code === "P2002") {
                        throw new Error("User Already Exists!");
                    } else {
                        throw new Error(`User Register Error! ${JSON.stringify(e)}`);
                    }
                }

                const { accessToken, refreshToken } = generateTokens(user);

                await prisma.user.update({
                    where: {
                        id: id,
                    },
                    data: {
                        refreshToken: refreshToken,
                        expiresIn: REFRESH_TOKEN_EXPIRES,
                    },
                });

                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    maxAge: REFRESH_TOKEN_EXPIRES * 1000, //7 days
                });

                return {
                    tokens: {
                        accessToken,
                        // refreshToken,
                        accessTokenExpiry: ACCESS_TOKEN_EXPIRES,
                        refreshTokenExpiry: REFRESH_TOKEN_EXPIRES,
                    },
                    user,
                };
            },
        });
        t.field("login", {
            type: AuthPayload,
            args: {
                id: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            async resolve(_root, args, context) {
                const { id, password } = args;

                const isValidPass = await isValidPassword(password);
                const isValidEmai = isValidID(id);

                if (!isValidEmai.isValid) {
                    throw new Error(isValidEmai.message);
                }

                if (!isValidPass.isValid) {
                    throw new Error(isValidPass.message);
                }

                // taking res, prisma objects we saved in context earlier
                const { res, prisma } = context;

                // check to see if user exists or not with given id
                const user = await prisma.user.findUnique({
                    where: {
                        id: id
                    },
                });

                if (!user) {
                    throw new Error(`No user found for id: ${id}`);
                }

                // if exists, check if password matches.
                // as we stored encrypted password, use bcrypt's compare method to verify
                // if password user entered matches the encrypted version in db
                const passwordMatched = await bcrypt.compare(password, user.password);

                if (!passwordMatched) {
                    throw new Error("Invalid password");
                }

                // use user object to generate two tokens, tokens difer in expiry only.
                // access token is short lifed and refresh token has a long life
                // later user can use refresh token to generate new access token when
                // his/her access token is about to expire
                const { accessToken, refreshToken } = generateTokens(user);

                // also save refresh token with expiry, will need it when -> user sends a refresh token
                // to generate new acess token <- to cross check with his sent refresh token
                await prisma.user.update({
                    where: {
                        id: id
                    },
                    data: {
                        refreshToken: refreshToken,
                        expiresIn: REFRESH_TOKEN_EXPIRES,
                    },
                });

                // here we use response to a https only cookie in user's browser, this cannot be modified
                // by clients
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    maxAge: REFRESH_TOKEN_EXPIRES * 1000, //7 days
                });

                // finally return everything back. user is logged in. basically
                // this accesstoken is valid for the time being and user can use this to
                // access protected routes
                return {
                    tokens: {
                        accessToken,
                        // refreshToken,
                        accessTokenExpiry: ACCESS_TOKEN_EXPIRES,
                        refreshTokenExpiry: REFRESH_TOKEN_EXPIRES,
                    },
                    user,
                };
            },
        });
        t.field("refresh", {
            type: AuthPayload,
            async resolve(_root, args, context) {
                const { req, prisma, res } = context;
                const cookies = getCookies(req);

                if (!cookies || !cookies["refreshToken"]) {
                    throw new Error(`Refresh Token not in the cookie!`);
                }

                const refresh_token: string = cookies["refreshToken"];

                const decodedUserData = verifyRefreshToken(refresh_token);

                const _user = await prisma.user.findUnique({
                    where: {
                        id: String(decodedUserData.id),
                    },
                });

                if (!_user) {
                    throw new Error(`User not found!`);
                }

                if (_user.refreshToken !== refresh_token) {
                    throw new Error(
                        `Different Refresh Token in db: ${_user.refreshToken}`
                    );
                }

                const { accessToken, refreshToken } = generateTokens(_user);

                await prisma.user.update({
                    where: {
                        id: _user.id
                    },
                    data: {
                        refreshToken: refreshToken,
                        expiresIn: REFRESH_TOKEN_EXPIRES,
                    },
                });

                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    maxAge: REFRESH_TOKEN_EXPIRES * 1000,
                });

                return {
                    tokens: {
                        accessToken,
                        // refreshToken,
                        accessTokenExpiry: ACCESS_TOKEN_EXPIRES,
                        refreshTokenExpiry: REFRESH_TOKEN_EXPIRES,
                    },
                    user: _user,
                };
            },
        });
        t.field("logout", {
            type: User,
            async resolve(_root, args, context) {
                const { user, req, prisma, res } = context;
                const cookies = getCookies(req);

                if (!cookies || !cookies["refreshToken"]) {
                    throw new Error(`Refresh Token not in cookie!`);
                }

                const refresh_token = cookies["refreshToken"];

                const _user = await prisma.user.findUnique({
                    where: {
                        id: String(user.id),
                    },
                });

                if (!_user) {
                    throw new Error(`User not found!`);
                }

                if (_user.refreshToken !== refresh_token) {
                    throw new Error(`Invalid Refresh Token in db: ${_user.refreshToken}`);
                }

                await prisma.user.update({
                    where: {
                        id: _user.id
                    },
                    data: {
                        refreshToken: "",
                        expiresIn: REFRESH_TOKEN_EXPIRES,
                    },
                });

                res.cookie("refreshToken", "", {
                    httpOnly: true,
                    secure: false,
                    expires: new Date(0),
                });

                return _user;
            },
        });
        t.field("resetPassword", {
            type: User,
            args: {
                password: nonNull(stringArg()),
            },
            async resolve(_root, args, context) {
                const { user, prisma } = context;
                const { password } = args;

                // existing user changing password
                const _user = await prisma.user.findUnique({
                    where: {
                        id: String(user.id),
                    },
                });

                if (!_user) {
                    throw new Error(`User not found!`);
                }

                const isValid = await isValidPassword(password, _user.password);

                if (!isValid.isValid) {
                    throw new Error(isValid.message);
                }

                const encryptedPassword = await bcrypt.hash(password, 10);

                await prisma.user.update({
                    where: {
                        id: _user.id,
                    },
                    data: {
                        password: encryptedPassword,
                    },
                });

                return _user;
            },
        });
    },
});