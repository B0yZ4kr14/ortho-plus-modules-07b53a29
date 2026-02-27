import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
  }
  
  const dummyId = "00000000-0000-0000-0000-000000000000";
  const profile = { id: dummyId, email: email, name: "Admin", role: "admin" } as any; 

  const token = jwt.sign(
    { sub: profile.id, email: profile.email, role: "authenticated" },
    process.env.JWT_SECRET || "supersecretmockjwt",
    { expiresIn: "1h" }
  );

  res.json({
    access_token: token,
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: token,
    user: {
      id: profile.id,
      aud: "authenticated",
      role: "authenticated",
      email: profile.email,
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {}
    }
  });
};

export const getUser = async (req: Request, res: Response) => {
   const authHeader = req.headers.authorization;
   if (!authHeader) {
       res.status(401).json({ error: "Unauthorized" });
       return;
   }

   try {
     const token = authHeader.split(" ")[1];
     const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "supersecretmockjwt");
     
     res.json({
       user: {
         id: decoded.sub,
         aud: "authenticated",
         role: decoded.role,
         email: decoded.email,
         app_metadata: { provider: "email", providers: ["email"] },
         user_metadata: {}
       }
     });
   } catch(e) {
     res.status(401).json({ error: "Invalid token" });
   }
};

export const logout = async (_req: Request, res: Response) => {
    res.status(204).send();
};
