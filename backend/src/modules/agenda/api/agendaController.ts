import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { clinic_id } = req.query;
    if (!clinic_id) {
      res.status(400).json({ error: "Missing clinic_id" });
      return;
    }

    const appointments = await prisma.$queryRaw`
      SELECT
        a.*,
        p.full_name as patient_name,
        d.full_name as dentist_name
      FROM appointments a
      LEFT JOIN prontuarios pr ON a.patient_id = pr.patient_id AND pr.clinic_id = a.clinic_id
      LEFT JOIN profiles p ON pr.patient_id = p.id
      LEFT JOIN profiles d ON a.dentist_id = d.id
      WHERE a.clinic_id = ${clinic_id}
      ORDER BY a.start_time ASC
    `;

    // Map to the nested structure useAgendaSupabase was expecting from Supabase PostgREST
    const formatted = (appointments as any[]).map((apt) => ({
      id: apt.id,
      clinic_id: apt.clinic_id,
      patient_id: apt.patient_id,
      dentist_id: apt.dentist_id,
      title: apt.title,
      description: apt.description,
      start_time: apt.start_time,
      end_time: apt.end_time,
      status: apt.status,
      created_at: apt.created_at,
      updated_at: apt.updated_at,
      patient: {
        patient_id: apt.patient_id,
        profiles: {
          full_name: apt.patient_name,
        },
      },
      dentist: {
        full_name: apt.dentist_name,
      },
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: error.message });
  }
};
