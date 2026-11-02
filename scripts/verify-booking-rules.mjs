import { randomUUID } from "node:crypto";
import { AppointmentStatus, PrismaClient } from "@prisma/client";
import { assertLocalDatabase } from "./local-database.mjs";

assertLocalDatabase(process.env.DATABASE_URL);
const prisma = new PrismaClient();
const token = randomUUID();
const startsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
startsAt.setUTCSeconds(0, 0);
const endAt = new Date(startsAt.getTime() + 50 * 60_000);
let clientId;
let serviceId;
const baselineCounts = await Promise.all([prisma.client.count(), prisma.service.count(), prisma.appointment.count()]);
const appointmentIds = [];
let verified = false;

try {
  const client = await prisma.client.create({
    data: { name: `Booking rules ${token.slice(0, 8)}`, email: `booking-rules-${token}@example.invalid` },
    select: { id: true },
  });
  clientId = client.id;
  const service = await prisma.service.create({
    data: { name: `Booking rules ${token.slice(0, 8)}`, description: "Disposable booking-rule verification fixture.", durationMinutes: 50, priceCents: 0 },
    select: { id: true },
  });
  serviceId = service.id;

  const first = await prisma.appointment.create({
    data: { clientId, serviceId, startsAt, endsAt: endAt, status: AppointmentStatus.REQUESTED },
    select: { id: true },
  });
  appointmentIds.push(first.id);

  let overlapRejected = false;
  try {
    const overlapping = await prisma.appointment.create({
      data: {
        clientId,
        serviceId,
        startsAt: new Date(startsAt.getTime() + 49 * 60_000),
        endsAt: new Date(startsAt.getTime() + 99 * 60_000),
        status: AppointmentStatus.CONFIRMED,
      },
      select: { id: true },
    });
    appointmentIds.push(overlapping.id);
  } catch (error) {
    const detail = error?.meta?.database_error ?? "";
    overlapRejected = detail.includes("Appointment_active_no_overlap") || String(error?.message ?? "").includes("Appointment_active_no_overlap");
  }
  if (!overlapRejected) throw new Error("PostgreSQL did not reject an overlapping active appointment.");

  const adjacent = await prisma.appointment.create({
    data: { clientId, serviceId, startsAt: endAt, endsAt: new Date(endAt.getTime() + 50 * 60_000), status: AppointmentStatus.CONFIRMED },
    select: { id: true },
  });
  appointmentIds.push(adjacent.id);

  const cancelledOverlap = await prisma.appointment.create({
    data: {
      clientId,
      serviceId,
      startsAt: new Date(startsAt.getTime() + 10 * 60_000),
      endsAt: new Date(startsAt.getTime() + 60 * 60_000),
      status: AppointmentStatus.CANCELLED,
    },
    select: { id: true },
  });
  appointmentIds.push(cancelledOverlap.id);

  let invalidIntervalRejected = false;
  try {
    const invalid = await prisma.appointment.create({
      data: { clientId, serviceId, startsAt, endsAt: startsAt, status: AppointmentStatus.CANCELLED },
      select: { id: true },
    });
    appointmentIds.push(invalid.id);
  } catch (error) {
    invalidIntervalRejected = error?.code === "P2004" || String(error?.message ?? "").includes("Appointment_interval_positive");
  }
  if (!invalidIntervalRejected) throw new Error("PostgreSQL did not reject an empty appointment interval.");

  verified = true;
} finally {
  if (appointmentIds.length) await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
  if (serviceId) await prisma.service.delete({ where: { id: serviceId } });
  if (clientId) await prisma.client.delete({ where: { id: clientId } });
  const finalCounts = await Promise.all([prisma.client.count(), prisma.service.count(), prisma.appointment.count()]);
  await prisma.$disconnect();
  if (JSON.stringify(finalCounts) !== JSON.stringify(baselineCounts)) throw new Error("Booking-rule verification changed database record counts.");
}

if (verified) console.log("PostgreSQL booking rules passed: overlaps rejected, adjacent and cancelled overlaps allowed, invalid intervals rejected; fixture counts are restored.");
