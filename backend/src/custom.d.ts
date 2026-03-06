import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: any;
  clinicId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
      clinicId?: string;
    }
  }
}
