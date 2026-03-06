import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useOdontogramaStore } from "./useOdontogramaStore";

describe("useOdontogramaStore", () => {
  const testProntuarioId = "test-prontuario-123";

  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with all teeth as higido", () => {
    const { result } = renderHook(() => useOdontogramaStore(testProntuarioId));

    // Wait for initial load
    expect(result.current.isLoading).toBe(false);
    expect(Object.keys(result.current.teethData)).toHaveLength(32);
    Object.values(result.current.teethData).forEach((tooth) => {
      expect(tooth.status).toBe("higido");
    });
  });

  it("should update tooth status", () => {
    const { result } = renderHook(() => useOdontogramaStore(testProntuarioId));

    act(() => {
      result.current.updateToothStatus(11, "cariado", false);
    });

    expect(result.current.teethData[11].status).toBe("cariado");
  });

  it("should update tooth surface", () => {
    const { result } = renderHook(() => useOdontogramaStore(testProntuarioId));

    act(() => {
      result.current.updateToothSurface(11, "mesial", "obturado", false);
    });

    expect(result.current.teethData[11].surfaces.mesial).toBe("obturado");
  });

  it("should add history entry when updating tooth", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOdontogramaStore(testProntuarioId));

    const initialHistoryLength = result.current.history.length;

    act(() => {
      result.current.updateToothStatus(11, "cariado", true);
      vi.advanceTimersByTime(150);
    });

    expect(result.current.history.length).toBe(initialHistoryLength + 1);
    vi.useRealTimers();
  });

  it("should get status count correctly", () => {
    const { result } = renderHook(() => useOdontogramaStore(testProntuarioId));

    act(() => {
      result.current.updateToothStatus(11, "cariado", false);
      result.current.updateToothStatus(12, "cariado", false);
      result.current.updateToothStatus(13, "obturado", false);
    });

    expect(result.current.getStatusCount("cariado")).toBe(2);
    expect(result.current.getStatusCount("obturado")).toBe(1);
    expect(result.current.getStatusCount("higido")).toBe(29);
  });

  it("should reset odontograma", () => {
    const { result } = renderHook(() => useOdontogramaStore(testProntuarioId));

    act(() => {
      result.current.updateToothStatus(11, "cariado", false);
      result.current.updateToothStatus(12, "obturado", false);
    });

    act(() => {
      result.current.resetOdontograma();
    });

    Object.values(result.current.teethData).forEach((tooth) => {
      expect(tooth.status).toBe("higido");
    });
  });

  it("should persist data to localStorage", () => {
    const { result } = renderHook(() => useOdontogramaStore(testProntuarioId));

    act(() => {
      result.current.updateToothStatus(11, "cariado", false);
    });

    const stored = localStorage.getItem(`odontograma-${testProntuarioId}`);
    expect(stored).toBeDefined();

    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.teeth["11"].status).toBe("cariado");
    }
  });
});
