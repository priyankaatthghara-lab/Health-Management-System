import 'express';

export interface AuthUser {
  _id: string;
  email: string;
  role: string;
  name: string;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
