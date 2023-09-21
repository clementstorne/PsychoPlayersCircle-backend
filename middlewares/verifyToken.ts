import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
  auth: string | JwtPayload;
}

export interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

// const extractBearer = (authorization: string) => {
//   const matches = authorization.match(/(bearer)\s+(\S+)/i);
//   return matches && matches[2];
// };

const verifyTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const token =
    //   req.headers.authorization && extractBearer(req.headers.authorization);

    const token = req.headers.authorization!.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as Secret);
    req.body.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      error:
        "Access Denied. The requested resource requires authentication. Please provide valid credentials to access this resource.",
    });
  }
};

export default verifyTokenMiddleware;
