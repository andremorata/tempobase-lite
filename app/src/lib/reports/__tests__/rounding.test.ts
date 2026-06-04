import { describe, it, expect } from "vitest";
import { roundUpToTenMin, applyRoundup, ROUNDUP_GRANULARITY_MINUTES } from "@/lib/reports/rounding";

describe("roundUpToTenMin", () => {
  it("returns 0 for zero duration", () => {
    expect(roundUpToTenMin(0)).toBe(0);
   });

  it("returns null for null input", () => {
    expect(roundUpToTenMin(null)).toBeNull();
   });

  it("returns undefined for undefined input", () => {
    expect(roundUpToTenMin(undefined)).toBeUndefined();
   });

  it("rounds up sub-minute values to 10 minutes (minimum floor)", () => {
     // 0.05 hours = 3 minutes → rounds to 10 min = 0.1667 hours
    expect(roundUpToTenMin(0.05)).toBeCloseTo(10 / 60, 4);
   });

  it("rounds up values between 0 and 10 minutes to 10 minutes", () => {
     // 0.1 hours = 6 minutes → rounds to 10 min
    expect(roundUpToTenMin(0.1)).toBeCloseTo(10 / 60, 4);
   });

  it("returns exact 10-minute boundary unchanged", () => {
     // 10 min = 1/6 hours → stays at 10 min
    const tenMin = 1 / 6;
    expect(roundUpToTenMin(tenMin)).toBeCloseTo(10 / 60, 4);
   });

  it("rounds up values between 10 and 20 minutes to 20 minutes", () => {
     // 15 min = 0.25 hours → rounds to 20 min
    expect(roundUpToTenMin(0.25)).toBeCloseTo(20 / 60, 4);
   });

  it("returns exact 20-minute boundary unchanged", () => {
     // 20 min = 1/3 hours → stays at 20 min
    expect(roundUpToTenMin(1 / 3)).toBeCloseTo(20 / 60, 4);
   });

  it("rounds up multi-hour values correctly", () => {
     // 1.5 hours = 90 min → rounds to 90 min (exact multiple)
    expect(roundUpToTenMin(1.5)).toBeCloseTo(1.5, 4);
   });

  it("rounds up multi-hour values with remainder", () => {
     // 1.75 hours = 105 min → rounds to 110 min
    expect(roundUpToTenMin(1.75)).toBeCloseTo(110 / 60, 4);
   });

  it("rounds up small fractions of an hour", () => {
     // 0.33 hours = 19.8 min → rounds to 20 min
    expect(roundUpToTenMin(0.33)).toBeCloseTo(20 / 60, 4);
   });

  it("handles exact half-hour boundary", () => {
     // 0.5 hours = 30 min (exact multiple of 10)
    expect(roundUpToTenMin(0.5)).toBeCloseTo(0.5, 4);
   });

  it("handles whole hour values unchanged", () => {
    expect(roundUpToTenMin(1)).toBeCloseTo(1, 4);
    expect(roundUpToTenMin(3)).toBeCloseTo(3, 4);
   });

  it("handles ~8h20m rounding (floating-point ceiling)", () => {
      // 500/60 = 8.333... hours → floating-point gives ~499.999 min → ceil to 510 min
    expect(roundUpToTenMin(500 / 60)).toBeCloseTo(510 / 60, 4);
   });

  it("handles 8:25 (505 min) rounding up to 510 min", () => {
     // 505/60 = 8.4167 hours → rounds to 510/60
    expect(roundUpToTenMin(505 / 60)).toBeCloseTo(510 / 60, 4);
   });
});

describe("applyRoundup", () => {
  it("returns original values for zero duration", () => {
    const entry = { durationDecimal: 0, billedAmount: 0 };
    const result = applyRoundup(entry);
    expect(result.durationDecimal).toBe(0);
    expect(result.billedAmount).toBe(0);
   });

  it("returns original values for null duration", () => {
    const entry = { durationDecimal: null, billedAmount: null };
    const result = applyRoundup(entry);
    expect(result.durationDecimal).toBeNull();
    expect(result.billedAmount).toBeNull();
   });

  it("rounds up small durations and preserves billed amount when null", () => {
     // 0.05 hours = 3 min → rounds to 10 min
    const entry = { durationDecimal: 0.05, billedAmount: null };
    const result = applyRoundup(entry);
    expect(result.durationDecimal).toBeCloseTo(10 / 60, 4);
    expect(result.billedAmount).toBeNull();
   });

  it("scales billed amount proportionally when rounding up duration", () => {
     // 0.25 hours = 15 min → rounds to 10/60 hours
     // Billed $10 at 15 min → should scale proportionally
    const entry = { durationDecimal: 0.25, billedAmount: 10 };
    const result = applyRoundup(entry);
    const expectedDuration = roundUpToTenMin(0.25);
    expect(result.durationDecimal).toBeCloseTo(expectedDuration, 4);
     // Proportional scale: (10 / 0.25) * rounded
    expect(result.billedAmount).toBeCloseTo((10 / 0.25) * expectedDuration, 2);
   });

  it("leaves billed amount unchanged when duration is exact 10-min boundary", () => {
     // 1/6 hours = 10 min (exact boundary, no rounding needed)
    const entry = { durationDecimal: 1 / 6, billedAmount: 5 };
    const result = applyRoundup(entry);
    expect(result.durationDecimal).toBeCloseTo(1 / 6, 4);
    expect(result.billedAmount).toBeCloseTo((5 / (1 / 6)) * roundUpToTenMin(1 / 6), 2);
   });

  it("handles undefined billed amount", () => {
    const entry = { durationDecimal: 0.3, billedAmount: undefined };
    const result = applyRoundup(entry);
    expect(result.billedAmount).toBeUndefined();
   });

  it("preserves non-roundable entry when duration is undefined", () => {
    const entry = { durationDecimal: undefined, billedAmount: 10 };
    const result = applyRoundup(entry);
    expect(result.durationDecimal).toBeUndefined();
    expect(result.billedAmount).toBe(10);
   });
});

describe("ROUNDUP_GRANULARITY_MINUTES", () => {
  it("equals 10 minutes", () => {
    expect(ROUNDUP_GRANULARITY_MINUTES).toBe(10);
   });
});
