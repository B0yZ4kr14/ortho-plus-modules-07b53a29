import { Router } from "express";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  checkConflict,
  getConfirmations,
  getConfirmationById,
  createConfirmation,
  updateConfirmation,
  deleteConfirmation,
  getBlockedTimes,
  getBlockedTimeById,
  createBlockedTime,
  deleteBlockedTime,
  getDentistSchedules,
  getDentistScheduleById,
  createDentistSchedule,
  updateDentistSchedule,
  deleteDentistSchedule,
} from "./agendaController";

const router = Router();

// Appointments CRUD
router.get("/appointments", getAppointments);
router.get("/appointments/conflict", checkConflict);
router.get("/appointments/:id", getAppointmentById);
router.post("/appointments", createAppointment);
router.patch("/appointments/:id", updateAppointment);
router.delete("/appointments/:id", deleteAppointment);

// Confirmations CRUD
router.get("/confirmations", getConfirmations);
router.get("/confirmations/:id", getConfirmationById);
router.post("/confirmations", createConfirmation);
router.patch("/confirmations/:id", updateConfirmation);
router.delete("/confirmations/:id", deleteConfirmation);

// Blocked Times CRUD
router.get("/blocked-times", getBlockedTimes);
router.get("/blocked-times/:id", getBlockedTimeById);
router.post("/blocked-times", createBlockedTime);
router.delete("/blocked-times/:id", deleteBlockedTime);

// Dentist Schedules CRUD
router.get("/schedules", getDentistSchedules);
router.get("/schedules/:id", getDentistScheduleById);
router.post("/schedules", createDentistSchedule);
router.patch("/schedules/:id", updateDentistSchedule);
router.delete("/schedules/:id", deleteDentistSchedule);

export default router;
