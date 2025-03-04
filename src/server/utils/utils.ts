// Utility from https://stackoverflow.com/questions/27117337/exclude-route-from-express-middleware to exclude routes cleanly
import { Request, Response, NextFunction } from "express";


// --- Express Middlewares
export const unless = (paths: ( string | RegExp )[], middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    const isExcluded = paths.some((pattern) => req.url.match(pattern));
    if (isExcluded) return next();
    return middleware(req, res, next);
};
