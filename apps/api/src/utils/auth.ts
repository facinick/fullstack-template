import {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES,
} from "../constants/authConstants";
import * as jwt from "jsonwebtoken";
import * as express from 'express';
import { User } from "@fullstack/prisma-client";

type TokenUserData = Pick<User, 'id' | 'role'>;
export type DecodedTokenUserData = TokenUserData & { iat: number; exp: number; };

export function verifyAccessToken(
    accessToken: string
): DecodedTokenUserData {
    try {
        let decodedToken = null;
        decodedToken = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
        return decodedToken;
    } catch (error) {
        console.log(error);
        throw new Error("Not authenticated: Access Token Expired or Invalid!");
    }
}

export function verifyRefreshToken(
    refreshToken: string
): DecodedTokenUserData {
    try {
        let decodedToken = null;
        decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        return decodedToken;
    } catch (error) {
        throw new Error("Not authenticated: Refresh Token Expired or Invalid!");
    }
}

export const getCookies = (
    request: express.Request
): Record<string, string> => {
    const cookies = {};

    try {
        request.headers &&
            request.headers.cookie.split(";").forEach((cookie) => {
                const parts = cookie.match(/(.*?)=(.*)$/);
                cookies[parts[1].trim()] = (parts[2] || "").trim();
            });
    } catch (error) {
        // console.log(`[ERROR] failed to parse cookie`);
        return null;
    }

    return cookies;
};

export function getAuthenticatedUser(
    req: express.Request
): DecodedTokenUserData | null {
    if (req) {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace("Bearer ", "");
            if (!token) {
                throw new Error("Not authenticated: No Acess token found");
            }
            const user = verifyAccessToken(token);
            return user;
        } else {
            return null;
        }
    }

    throw new Error("Not authenticated: Invalid Request");
}

function getDataToSign(user: TokenUserData): TokenUserData {
    return {
        id: user.id,
        role: user.role,
    };
}

export function generateTokens(user: TokenUserData): {
    accessToken: string;
    refreshToken: string;
} {
    if (!user || !user.id || !user.role) {
        throw new Error("Supply id and role in user to generate tokens");
    }

    const accessToken = jwt.sign(getDataToSign(user), ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES,
    });
    const refreshToken = jwt.sign(getDataToSign(user), REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES,
    });

    return {
        accessToken,
        refreshToken,
    };
}