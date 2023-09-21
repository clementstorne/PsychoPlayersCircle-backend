import { Request } from "express";

export {};

declare global {
  interface CustomRequest extends Request {
    auth: string | JwtPayload;
  }
}
