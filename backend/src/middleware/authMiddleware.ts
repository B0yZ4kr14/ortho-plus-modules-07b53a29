import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Auth middleware that extracts JWT from Authorization header
 * and populates req.clinicId for downstream controllers.
 *
 * Falls through silently if no token is present (non-protected routes).
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretmockjwt",
    );

    // Set clinicId from token or fallback to mock-clinic-id (E2E compat)
    req.clinicId = decoded.clinicId || "mock-clinic-id";

    // Also set userId for controllers that need it
    if (decoded.sub) {
      (req as any).userId = decoded.sub;
    }
  } catch {
    // Invalid token — fall through without setting clinicId
    // Controllers will return 401 if they require it
  }

  return next();
}
