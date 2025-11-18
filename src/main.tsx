import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DataSourceProvider } from "@/lib/providers/DataSourceProvider";

// ✅ FASE 1 - SPRINT 1.1: DESACOPLAMENTO DO SUPABASE
// Sistema agora usa 100% REST API modular do backend Node.js
// Supabase usado apenas para autenticação e storage
const DATA_SOURCE: 'supabase' | 'rest-api' = 'rest-api';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataSourceProvider source={DATA_SOURCE}>
      <App />
    </DataSourceProvider>
  </StrictMode>
);
