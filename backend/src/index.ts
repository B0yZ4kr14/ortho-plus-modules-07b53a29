import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import cryptoRoutes from "./routes/crypto";
import estoqueRoutes from "./routes/estoque";
import financeiroRoutes from "./routes/financeiro";
import fiscalRoutes from "./routes/fiscal";
import paymentRoutes from "./routes/payments";
import restRoutes from "./routes/rest";

// Modules API Routers
import agendaRouter from "./modules/agenda/api/router";
import analyticsRouter from "./modules/analytics/api/router";
import backupsRouter from "./modules/backups/api/router";
import { commRouter } from "./modules/comm/api/router";
import { createCryptoConfigRouter } from "./modules/crypto_config/api/router";
import databaseRouter from "./modules/database_admin/api/router";
import { createFaturamentoRouter } from "./modules/faturamento/api/router";
import filesRouter from "./modules/files/api/router";
import { createGitHubToolsRouter } from "./modules/github_tools/api/router";
import notificationRouter from "./modules/notifications/api/router";
import { pacientesRouter } from "./modules/pacientes/api/router";
import { createTerminalRouter } from "./modules/terminal/api/router";
import usuariosRouter from "./modules/usuarios/api/router";
import { startAllWorkers } from "./workers/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(helmet());
app.use(express.json());

// Auth implementation route
app.use("/auth/v1", authRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// Generic REST routes (mirroring Supabase /rest/v1)
app.use("/rest/v1", restRoutes);

// Admin / System API routes (migrated from Edge Functions)
app.use("/api/db", databaseRouter);
app.use("/api/backups", backupsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/files", filesRouter);
app.use("/api/crypto_config", createCryptoConfigRouter());
app.use("/api/faturamento", createFaturamentoRouter());
app.use("/api/pacientes", pacientesRouter);
app.use("/api/comm", commRouter);
app.use("/api/agenda", agendaRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/terminal", createTerminalRouter());
app.use("/api/github", createGitHubToolsRouter());
app.use("/api/crypto", cryptoRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/fiscal", fiscalRoutes);
app.use("/api/estoque", estoqueRoutes);
app.use("/api/financeiro", financeiroRoutes);

// Start background workers
startAllWorkers();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
