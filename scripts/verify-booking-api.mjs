import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { assertLocalDatabase } from "./local-database.mjs";

assertLocalDatabase(process.env.DATABASE_URL);
const baseUrl = process.env.AURELLE_LOCAL_BASE_URL ?? "http://127.0.0.1:3210";
const base = new URL(baseUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw new Error("The API verifier requires a loopback URL.");
const prisma = new PrismaClient();
const token = randomUUID();
const startsAt = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
startsAt.setUTCSeconds(0, 0);
let clientId;
let serviceId;
const appointmentIds = [];
const baselineCounts = await Promise.all([prisma.client.count(), prisma.service.count(), prisma.appointment.count()]);
let verified = false;

try {
  const client = await prisma.client.create({
    data: { name: `Booking API ${token.slice(0, 8)}`, email: `booking-api-${token}@example.invalid` },
    select: { id: true },
  });
  clientId = client.id;
  const service = await prisma.service.create({
    data: { name: `Booking API ${token.slice(0, 8)}`, description: "Disposable booking API smoke fixture.", durationMinutes: 50, priceCents: 0 },
    select: { id: true },
  });
  serviceId = service.id;

  const post = (start) => fetch(new URL("/api/appointments", base), {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base.origin },
    body: JSON.stringify({ clientId, serviceId, startsAt: start }),
  });
  const createdResponse = await post(startsAt.toISOString());
  if (createdResponse.status !== 201 || createdResponse.headers.get("cache-control") !== "no-store") {
    throw new Error(`Expected local API booking creation to return 201/no-store; got ${createdResponse.status}.`);
  }
  const createdBody = await createdResponse.json();
  if (typeof createdBody.appointment?.id === "string") appointmentIds.push(createdBody.appointment.id);
  if (createdBody.appointment?.service?.durationMinutes !== 50) throw new Error("The API did not use the selected service duration.");
  if (!appointmentIds.length) throw new Error("The API response did not contain the created appointment ID.");
  const actualEnd = new Date(createdBody.appointment.endsAt).getTime();
  if (actualEnd !== startsAt.getTime() + 50 * 60_000) throw new Error("The API returned an end time that does not match the service duration.");

  const overlapResponse = await post(new Date(startsAt.getTime() + 49 * 60_000).toISOString());
  if (overlapResponse.status !== 409) throw new Error(`Expected an overlapping booking to return 409; got ${overlapResponse.status}.`);
  const ambiguousResponse = await post(startsAt.toISOString().slice(0, -1));
  if (ambiguousResponse.status !== 400) throw new Error(`Expected a timezone-ambiguous booking to return 400; got ${ambiguousResponse.status}.`);

  verified = true;
} finally {
  if (appointmentIds.length) await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
  if (serviceId) await prisma.service.delete({ where: { id: serviceId } });
  if (clientId) await prisma.client.delete({ where: { id: clientId } });
  const finalCounts = await Promise.all([prisma.client.count(), prisma.service.count(), prisma.appointment.count()]);
  await prisma.$disconnect();
  if (JSON.stringify(finalCounts) !== JSON.stringify(baselineCounts)) throw new Error("Booking API verification changed database record counts.");
}

if (verified) console.log("Local appointment API passed: service-derived UTC end, no-store response, overlap conflict, explicit timezone offset required; fixture counts are restored.");
