import { Router } from "express";
import { getAppointments } from "./agendaController";

const router = Router();

// Used by useAgendaSupabase.ts (mapped frontend interface)
router.get("/appointments", getAppointments);

export default router;
