import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
};

if (typeof global !== "undefined") {
  global.localStorage = createStorageMock() as unknown as Storage;
  global.sessionStorage = createStorageMock() as unknown as Storage;
}

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

// Mock apiClient
vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({ data: [], success: true })),
    post: vi.fn(() => Promise.resolve({ data: {}, success: true })),
    put: vi.fn(() => Promise.resolve({ data: {}, success: true })),
    patch: vi.fn(() => Promise.resolve({ data: {}, success: true })),
    delete: vi.fn(() => Promise.resolve({ success: true })),
  },
}));

// Mock toast notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/" }),
  };
});
