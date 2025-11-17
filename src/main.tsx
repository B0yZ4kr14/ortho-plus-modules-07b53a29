import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DataSourceProvider } from "@/lib/providers/DataSourceProvider";

// 🔄 MIGRAÇÃO GRADUAL: Alterne entre "supabase" e "rest-api"
// "supabase" → Mantém comportamento atual (chamadas diretas ao Supabase)
// "rest-api" → Usa novo backend Node.js REST API
const DATA_SOURCE: 'supabase' | 'rest-api' = 'supabase';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataSourceProvider source={DATA_SOURCE}>
      <App />
    </DataSourceProvider>
  </StrictMode>
);
