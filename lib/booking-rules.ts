export const MAX_BOOKING_DURATION_MINUTES = 12 * 60;

export type BookingInterval = { startsAt: Date; endsAt: Date };

export function isLoopbackHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

export function createBookingInterval(startsAt: Date, durationMinutes: number): BookingInterval | null {
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > MAX_BOOKING_DURATION_MINUTES) {
    return null;
  }
  if (!Number.isFinite(startsAt.getTime())) return null;

  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
  if (!Number.isFinite(endsAt.getTime())) return null;
  return { startsAt, endsAt };
}

/** Half-open intervals let one appointment begin exactly when another ends. */
export function intervalsOverlap(left: BookingInterval, right: BookingInterval) {
  return left.startsAt < right.endsAt && left.endsAt > right.startsAt;
}

export function isBookingConflictConstraint(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const metadata = "meta" in error && typeof error.meta === "object" && error.meta !== null ? error.meta : null;
  const databaseError = metadata && "database_error" in metadata && typeof metadata.database_error === "string"
    ? metadata.database_error
    : "";
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  // Prisma reports PostgreSQL exclusion violations as an unknown request error;
  // the stable, named constraint distinguishes this case from other DB failures.
  return databaseError.includes("Appointment_active_no_overlap") || message.includes("Appointment_active_no_overlap");
}
