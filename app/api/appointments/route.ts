import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";
import { createBookingInterval, isBookingConflictConstraint, isLoopbackHostname } from "@/lib/booking-rules";
import { isLocalClientDirectoryEnabled } from "@/lib/client-directory";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const noStore = { headers: { "Cache-Control": "no-store" } };
const bookingInputSchema = z.object({
  clientId: z.string().trim().min(1).max(64),
  serviceId: z.string().trim().min(1).max(64),
  // Require an explicit offset; local wall-clock strings are ambiguous.
  startsAt: z.string().datetime({ offset: true }),
});

function isLocalRequest(request: Request) {
  try {
    if (!isLoopbackHostname(new URL(request.url).hostname)) return false;
    const origin = request.headers.get("origin");
    return !origin || isLoopbackHostname(new URL(origin).hostname);
  } catch {
    return false;
  }
}

function conflict(message: string) {
  return NextResponse.json({ error: message }, { ...noStore, status: 409 });
}

export async function POST(request: Request) {
  if (!isLocalRequest(request) || !isLocalClientDirectoryEnabled()) {
    return NextResponse.json({ error: "Not found." }, { ...noStore, status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Booking details must be valid JSON." }, { ...noStore, status: 400 });
  }

  const parsed = bookingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Choose a client, an active service, and a start time with an explicit timezone offset." },
      { ...noStore, status: 400 },
    );
  }

  const startsAt = new Date(parsed.data.startsAt);
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const [client, service] = await Promise.all([
        transaction.client.findUnique({ where: { id: parsed.data.clientId }, select: { id: true } }),
        transaction.service.findUnique({
          where: { id: parsed.data.serviceId },
          select: { id: true, name: true, durationMinutes: true, active: true },
        }),
      ]);

      if (!client) return { response: NextResponse.json({ error: "Client was not found." }, { ...noStore, status: 404 }) };
      if (!service?.active) {
        return { response: NextResponse.json({ error: "Choose an active service." }, { ...noStore, status: 422 }) };
      }

      const interval = createBookingInterval(startsAt, service.durationMinutes);
      if (!interval) {
        return { response: NextResponse.json({ error: "This service has an invalid appointment duration." }, { ...noStore, status: 503 }) };
      }

      const existing = await transaction.appointment.findFirst({
        where: {
          status: { in: [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED] },
          startsAt: { lt: interval.endsAt },
          endsAt: { gt: interval.startsAt },
        },
        select: { id: true },
      });
      if (existing) return { response: conflict("That time overlaps another active appointment.") };

      const appointment = await transaction.appointment.create({
        data: {
          clientId: client.id,
          serviceId: service.id,
          startsAt: interval.startsAt,
          endsAt: interval.endsAt,
          status: AppointmentStatus.REQUESTED,
        },
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          status: true,
          service: { select: { name: true, durationMinutes: true } },
        },
      });

      return { appointment };
    });

    if ("response" in result && result.response) return result.response;
    return NextResponse.json({ appointment: result.appointment }, { ...noStore, status: 201 });
  } catch (error) {
    if (isBookingConflictConstraint(error)) return conflict("That time overlaps another active appointment.");
    return NextResponse.json({ error: "Booking is temporarily unavailable." }, { ...noStore, status: 503 });
  }
}
