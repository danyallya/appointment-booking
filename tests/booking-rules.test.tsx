import { describe, expect, it } from "vitest";
import { createBookingInterval, intervalsOverlap, isBookingConflictConstraint, isLoopbackHostname } from "@/lib/booking-rules";

describe("booking interval rules", () => {
  const start = new Date("2026-11-02T09:00:00.000Z");

  it("derives the end from the selected service duration", () => {
    expect(createBookingInterval(start, 50)).toEqual({
      startsAt: start,
      endsAt: new Date("2026-11-02T09:50:00.000Z"),
    });
  });

  it.each([0, -1, 1.5, 721, Number.NaN])("rejects an invalid or unbounded duration: %s", (duration) => {
    expect(createBookingInterval(start, duration)).toBeNull();
  });

  it("rejects invalid start dates", () => {
    expect(createBookingInterval(new Date("invalid"), 30)).toBeNull();
  });

  it("treats adjacent appointments as non-overlapping half-open intervals", () => {
    const first = createBookingInterval(start, 50)!;
    const next = createBookingInterval(new Date("2026-11-02T09:50:00.000Z"), 30)!;
    expect(intervalsOverlap(first, next)).toBe(false);
    expect(intervalsOverlap(first, { startsAt: new Date("2026-11-02T09:49:59.999Z"), endsAt: new Date("2026-11-02T10:20:00.000Z") })).toBe(true);
  });

  it("accepts only loopback hostnames for the local preview", () => {
    expect(isLoopbackHostname("localhost")).toBe(true);
    expect(isLoopbackHostname("127.0.0.1")).toBe(true);
    expect(isLoopbackHostname("[::1]")).toBe(true);
    expect(isLoopbackHostname("studio.example.com")).toBe(false);
  });

  it("identifies only the database exclusion violation used for race-safe conflict responses", () => {
    expect(isBookingConflictConstraint({ code: "P2004", meta: { database_error: "constraint Appointment_active_no_overlap violated" } })).toBe(true);
    expect(isBookingConflictConstraint({ message: "conflicting key value violates exclusion constraint Appointment_active_no_overlap" })).toBe(true);
    expect(isBookingConflictConstraint({ code: "P2004", meta: { database_error: "Appointment_interval_positive" } })).toBe(false);
    expect(isBookingConflictConstraint({ code: "P2002" })).toBe(false);
  });
});
