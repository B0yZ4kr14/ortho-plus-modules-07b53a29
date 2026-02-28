import { Request, Response } from 'express';
import prisma from '../prisma';

export const getPatients = async (req: Request, res: Response) => {
    try {
        const patients = await prisma.patients.findMany({
            // Normally we'd filter by clinic_id drawn from user Context (JWT)
            // Just fetching all for demo until Auth is wired in
            take: 50
        });
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getPatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const patient = await prisma.patients.findUnique({
            where: { id }
        });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createPatient = async (req: Request, res: Response) => {
    try {
        const patientData = req.body;
        // Enforce clinic constraints here based on JWT Context
        // For testing we will just allow the body
        const newPatient = await prisma.patients.create({
            data: patientData
        });
        res.status(201).json(newPatient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create patient', details: String(error) });
    }
};
