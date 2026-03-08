import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { clinic_id, dentist_id, patient_id, status, start_date, end_date } =
      req.query;

    const where: any = {};
    if (clinic_id) where.clinic_id = clinic_id as string;
    if (dentist_id) where.dentist_id = dentist_id as string;
    if (patient_id) where.patient_id = patient_id as string;
    if (status) {
      const statusStr = status as string;
      if (statusStr.startsWith("not.in.")) {
        const excluded = statusStr
          .replace("not.in.(", "")
          .replace(")", "")
          .split(",");
        where.status = { notIn: excluded };
      } else {
        where.status = statusStr;
      }
    }
    if (start_date || end_date) {
      where.start_time = {};
      if (start_date) where.start_time.gte = new Date(start_date as string);
      if (end_date) where.start_time.lte = new Date(end_date as string);
    }

    const appointments = await prisma.appointments.findMany({
      where,
      orderBy: { start_time: "asc" },
    });

    res.json(appointments);
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointments.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await prisma.appointments.create({
      data: req.body,
    });
    res.status(201).json(appointment);
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointments.update({
      where: { id },
      data: { ...req.body, updated_at: new Date() },
    });
    res.json(appointment);
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.appointments.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

export const checkConflict = async (req: Request, res: Response) => {
  try {
    const { dentist_id, start_time, end_time, exclude_id } = req.query;

    if (!dentist_id || !start_time || !end_time) {
      res
        .status(400)
        .json({ error: "dentist_id, start_time, end_time required" });
      return;
    }

    const where: any = {
      dentist_id: dentist_id as string,
      status: { notIn: ["cancelado", "faltou"] },
      OR: [
        {
          start_time: { lte: new Date(start_time as string) },
          end_time: { gte: new Date(start_time as string) },
        },
        {
          start_time: { lte: new Date(end_time as string) },
          end_time: { gte: new Date(end_time as string) },
        },
      ],
    };
    if (exclude_id) where.id = { not: exclude_id as string };

    const conflicts = await prisma.appointments.findMany({
      where,
      select: { id: true },
    });

    res.json({ hasConflict: conflicts.length > 0, count: conflicts.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- Confirmations ---

export const getConfirmations = async (req: Request, res: Response) => {
  try {
    const { appointment_id, status } = req.query;
    const where: any = {};
    if (appointment_id) where.appointment_id = appointment_id as string;
    if (status) where.status = status as string;

    const confirmations = await prisma.appointment_confirmations.findMany({
      where,
      orderBy: { created_at: "asc" },
    });
    res.json(confirmations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConfirmationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const confirmation = await prisma.appointment_confirmations.findUnique({
      where: { id },
    });
    if (!confirmation) {
      res.status(404).json({ error: "Confirmation not found" });
      return;
    }
    res.json(confirmation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createConfirmation = async (req: Request, res: Response) => {
  try {
    const confirmation = await prisma.appointment_confirmations.create({
      data: req.body,
    });
    res.status(201).json(confirmation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateConfirmation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const confirmation = await prisma.appointment_confirmations.update({
      where: { id },
      data: req.body,
    });
    res.json(confirmation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteConfirmation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.appointment_confirmations.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- Blocked Times ---

export const getBlockedTimes = async (req: Request, res: Response) => {
  try {
    const { dentist_id, clinic_id, active, start_date, end_date } = req.query;
    const where: any = {};
    if (dentist_id) where.dentist_id = dentist_id as string;
    if (clinic_id) where.clinic_id = clinic_id as string;
    if (active === "true") {
      where.end_datetime = { gte: new Date() };
    }
    if (start_date || end_date) {
      where.start_datetime = {};
      if (end_date) where.start_datetime.lt = new Date(end_date as string);
      if (!where.end_datetime) where.end_datetime = {};
      if (start_date) where.end_datetime.gt = new Date(start_date as string);
    }

    const items = await prisma.blocked_times.findMany({
      where,
      orderBy: { start_datetime: "asc" },
    });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlockedTimeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.blocked_times.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: "Blocked time not found" });
      return;
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBlockedTime = async (req: Request, res: Response) => {
  try {
    const item = await prisma.blocked_times.create({ data: req.body });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlockedTime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.blocked_times.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- Dentist Schedules ---

export const getDentistSchedules = async (req: Request, res: Response) => {
  try {
    const { dentist_id, clinic_id, day_of_week, is_active } = req.query;
    const where: any = {};
    if (dentist_id) where.dentist_id = dentist_id as string;
    if (clinic_id) where.clinic_id = clinic_id as string;
    if (day_of_week !== undefined) where.day_of_week = Number(day_of_week);
    if (is_active !== undefined) where.is_active = is_active === "true";

    const items = await prisma.dentist_schedules.findMany({
      where,
      orderBy: [{ dentist_id: "asc" }, { day_of_week: "asc" }],
    });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDentistScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.dentist_schedules.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDentistSchedule = async (req: Request, res: Response) => {
  try {
    const item = await prisma.dentist_schedules.create({ data: req.body });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDentistSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.dentist_schedules.update({
      where: { id },
      data: req.body,
    });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDentistSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.dentist_schedules.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
