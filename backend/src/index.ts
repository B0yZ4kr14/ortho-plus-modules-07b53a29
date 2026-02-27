import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth";
import restRoutes from './routes/rest';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(helmet());
app.use(express.json());

// Auth implementation route
app.use("/auth/v1", authRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Generic REST routes (mirroring Supabase /rest/v1)
app.use('/rest/v1', restRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
