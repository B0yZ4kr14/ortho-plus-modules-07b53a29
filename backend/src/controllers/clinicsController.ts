import { Request, Response } from 'express';
import prisma from '../prisma';

export const getClinics = async (req: Request, res: Response) => {
    try {
        const clinics = await prisma.clinics.findMany();
        res.json(clinics);
    } catch (error) {
        console.error('Error fetching clinics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getClinicById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const clinic = await prisma.clinics.findUnique({
            where: { id }
        });
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found' });
        }
        res.json(clinic);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
