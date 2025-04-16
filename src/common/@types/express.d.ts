import { Request } from "express";

declare module "express-serve-static-core" {
    interface Request {
        user?: UserIdentifier;
        gamePlayer?: GamePlayer;
    }
}
