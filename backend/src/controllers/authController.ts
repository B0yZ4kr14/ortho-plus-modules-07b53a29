import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-ortho-key';

export const signUp = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const existingUser = await prisma.users.findFirst({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate a new UUID-like format for Auth (mocking Supabase logic)
        const id = require('crypto').randomUUID();

        const newUser = await prisma.users.create({
            data: {
                id,
                email,
                encrypted_password: hashedPassword,
                email_confirmed_at: new Date()
            }
        });

        // Mirror Supabase Auth Payload structure
        const token = jwt.sign({ sub: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '8h' });

        res.status(201).json({
            user: { id: newUser.id, email: newUser.email },
            session: { access_token: token }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const signInWithPassword = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.users.findFirst({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.encrypted_password || ''))) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            data: {
                user: { id: user.id, email: user.email },
                session: { access_token: token }
            },
            error: null
        });
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
             return res.status(401).json({ error: 'Missing token' });
        }
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        const user = await prisma.users.findUnique({ where: { id: decoded.sub } });
        if (!user) return res.status(401).json({ error: 'Invalid user' });

        res.json({ data: { user: { id: user.id, email: user.email } }, error: null });
    } catch (error) {
        res.status(401).json({ error: 'Token expired or invalid' });
    }
};

export const signOut = async (req: Request, res: Response) => {
    res.json({ error: null });
};
