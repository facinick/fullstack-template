import { PrismaClient } from '@fullstack/prisma-client';
import { DecodedTokenUserData, getAuthenticatedUser } from "../utils/auth";
import { prisma } from './prisma';
import * as express from "express";

export interface Context {
  prisma: PrismaClient;
  req: express.Request;
  res: express.Response;
  user: DecodedTokenUserData | null;
}

// need prisma for accessing database, response (res) for setting https cookie on client side
// and request for acessing headers to get access-token if any.
// if token exist and is valid, user fiels is populated with id, email, name, etc about user.
// so if user is not null and user.id exists, we can assume the requester is authenticated!
export const createContext = ({
  req,
  res,
}: {
  req: express.Request;
  res: express.Response;
}): Context => {

  let user = null;
  try {
    user = req && req.headers && req.headers.authorization ? getAuthenticatedUser(req) : null;
  } catch (error) {

  }

  return {
    req,
    res,
    prisma,
    user,
  };
};