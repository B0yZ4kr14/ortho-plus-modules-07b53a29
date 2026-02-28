import axios from "axios";

const VITE_API_URL = "/api";

const api = axios.create({
  baseURL: VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const sessionStr = localStorage.getItem("supabase.auth.token");
    if (sessionStr) {
        try {
            const session = JSON.parse(sessionStr);
            if (session.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        } catch(e) {}
    }
    return config;
});

class SupabaseQueryBuilder {
  private _table: string;
  private _select = "*";
  private _filters: string[] = [];
  private _order: string = "";
  private _limit: number | null = null;
  private _action: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private _payload: any = null;

  constructor(table: string) {
    this._table = table;
  }

  select(query = "*") {
    this._select = query;
    return this;
  }

  eq(column: string, value: any) {
    this._filters.push(`eq.${column}=${value}`);
    return this;
  }

  ilike(column: string, pattern: string) {
    this._filters.push(`ilike.*${pattern}*`);
    return this;
  }

  in(column: string, values: any[]) {
    this._filters.push(`in.(${values.join(",")})`);
    return this;
  }

  gte(column: string, value: any) {
    this._filters.push(`gte.${column}=${value}`);
    return this;
  }

  lte(column: string, value: any) {
    this._filters.push(`lte.${column}=${value}`);
    return this;
  }

  or(query: string) {
    this._filters.push(`or=(${query})`);
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    const dir = opts?.ascending === false ? "desc" : "asc";
    this._order = `order=${field}.${dir}`;
    return this;
  }

  limit(num: number) {
    this._limit = num;
    return this;
  }

  insert(data: any) {
    this._action = "POST";
    this._payload = data;
    return this;
  }

  update(data: any) {
    this._action = "PATCH";
    this._payload = data;
    return this;
  }

  delete() {
    this._action = "DELETE";
    return this;
  }

  async then(resolve: any, reject: any) {
    try {
        const queryParams = [`select=${this._select}`, ...this._filters].join("&");
        const fullQuery = [queryParams, this._order].filter(Boolean).join("&") + (this._limit ? `&limit=${this._limit}` : "");

        let res;

        if (this._action === "GET") {
            res = await api.get(`/${this._table}?${fullQuery}`);
        } else if (this._action === "POST") {
            res = await api.post(`/${this._table}`, this._payload);
        } else if (this._action === "PATCH") {
            const idFilter = this._filters.find(f => f.startsWith("eq.id="));
            const id = idFilter ? idFilter.split("=")[1] : "";
            res = await api.patch(`/${this._table}/${id}`, this._payload);
        } else if (this._action === "DELETE") {
            const idFilter = this._filters.find(f => f.startsWith("eq.id="));
            const id = idFilter ? idFilter.split("=")[1] : "";
            res = await api.delete(`/${this._table}/${id}`);
        }

        resolve({ data: res?.data || null, error: null });
    } catch (err) {
        resolve({ data: null, error: err });
    }
  }

  maybeSingle() { this._isSingle = true; return this; } async single() {
     const result: any = await new Promise((res, rej) => this.then(res, rej));
     if (result.data && Array.isArray(result.data)) {
        return { data: result.data[0], error: result.error };
     }
     return result;
  }
}

type AuthListener = (event: string, session: any) => void;
const authListeners: AuthListener[] = [];
const notifyAuthListeners = (event: string, session: any) => {
    authListeners.forEach(listener => listener(event, session));
};

export const supabase = {
  from: (table: string) => {
    return new SupabaseQueryBuilder(table);
  },
  auth: {
    getSession: async () => {
        const tokenString = localStorage.getItem("supabase.auth.token");
        if (!tokenString) return { data: { session: null }, error: null };
        try {
            const session = JSON.parse(tokenString);
            return { data: { session }, error: null };
        } catch(e) {
            return { data: { session: null }, error: null };
        }
    },
    getUser: async () => {
       try {
           const res = await api.get("/auth/user");
           return { data: { user: res.data.user }, error: null };
       } catch (err) {
           return { data: { user: null }, error: err };
       }
    },
    signInWithPassword: async ({ email, password }: any) => {
        try {
            const res = await api.post("/auth/signin", { email, password });
            
            // The backend returns { data: { user, session } }
            console.log("AUTH PAYLOAD:", res.data); const payload = res.data.data || res.data; console.log("EXTRACTED PAYLOAD:", payload);
            const session = payload.session;
            if (session) {
                session.user = payload.user; // attach user object to session
                localStorage.setItem("supabase.auth.token", JSON.stringify(session));
                notifyAuthListeners("SIGNED_IN", session);
            }
            
            return { data: { session, user: payload.user }, error: null };
        } catch (err: any) {
            console.error("Login Error: ", err);
            return { data: { session: null, user: null }, error: new Error(err.response?.data?.error || err.message) };
        }
    },
    signOut: async () => {
        try { await api.post("/auth/signout"); } catch(e) {}
        localStorage.removeItem("supabase.auth.token");
        notifyAuthListeners("SIGNED_OUT", null);
        return { error: null };
    },
    onAuthStateChange: (callback: AuthListener) => {
       authListeners.push(callback);
       return { data: { subscription: { unsubscribe: () => {
           const idx = authListeners.indexOf(callback);
           if(idx !== -1) authListeners.splice(idx, 1);
       } } } };
    }
  },
  channel: (name: string) => ({
      on: () => ({ subscribe: () => {} })
  }),
  functions: {
      invoke: async (name: string, options: any) => {
          try {
              const res = await api.post(`/functions/${name}`, options.body);
              return { data: res.data, error: null };
          } catch(e: any) {
              return { data: null, error: e.response?.data || e };
          }
      }
  }
};
