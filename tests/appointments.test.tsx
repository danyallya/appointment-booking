import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const transaction = {
  client: { findUnique: vi.fn() },
  service: { findUnique: vi.fn() },
  appointment: { findFirst: vi.fn(), create: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: vi.fn((callback: (tx: typeof transaction) => unknown) => callback(transaction)) },
}));

import { POST } from "@/app/api/appointments/route";
import { prisma } from "@/lib/prisma";

const previousDatabaseUrl = process.env.DATABASE_URL;

function request(body: unknown, options: { url?: string; origin?: string } = {}) {
  return new Request(options.url ?? "http://localhost/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.origin ? { Origin: options.origin } : {}),
    },
    body: JSON.stringify(body),
  });
}

const body = { clientId: "client-demo", serviceId: "service-demo", startsAt: "2026-11-02T12:30:00+03:30" };

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  process.env.DATABASE_URL = "postgresql://127.0.0.1:5432/aurelle_dev?schema=public";
  transaction.client.findUnique.mockResolvedValue({ id: "client-demo" });
  transaction.service.findUnique.mockResolvedValue({ id: "service-demo", name: "Signature facial", durationMinutes: 50, active: true });
  transaction.appointment.findFirst.mockResolvedValue(null);
  transaction.appointment.create.mockResolvedValue({
    id: "appointment-demo",
    startsAt: new Date("2026-11-02T09:00:00.000Z"),
    endsAt: new Date("2026-11-02T09:50:00.000Z"),
    status: "REQUESTED",
    service: { name: "Signature facial", durationMinutes: 50 },
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previousDatabaseUrl;
});

describe("local appointment creation", () => {
  it("uses the active service duration and stores the explicit-offset instant as UTC", async () => {
    const response = await POST(request({ ...body, endsAt: "2099-01-01T00:00:00Z" }));

    expect(response.status).toBe(201);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(transaction.appointment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        clientId: "client-demo",
        serviceId: "service-demo",
        startsAt: new Date("2026-11-02T09:00:00.000Z"),
        endsAt: new Date("2026-11-02T09:50:00.000Z"),
        status: "REQUESTED",
      },
    }));
  });

  it.each([
    ["missing timezone offset", { ...body, startsAt: "2026-11-02T09:00:00" }],
    ["invalid date", { ...body, startsAt: "not-a-date" }],
    ["missing client", { ...body, clientId: "" }],
  ])("rejects %s before opening a transaction", async (_label, input) => {
    const response = await POST(request(input));
    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects requests from non-loopback hosts and origins", async () => {
    expect((await POST(request(body, { url: "http://studio.example.com/api/appointments" }))).status).toBe(404);
    expect((await POST(request(body, { origin: "https://studio.example.com" }))).status).toBe(404);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("requires an existing client and an active service", async () => {
    transaction.client.findUnique.mockResolvedValueOnce(null);
    expect((await POST(request(body))).status).toBe(404);
    expect(transaction.appointment.create).not.toHaveBeenCalled();

    transaction.service.findUnique.mockResolvedValueOnce({ id: "service-demo", durationMinutes: 50, active: false });
    expect((await POST(request(body))).status).toBe(422);
    expect(transaction.appointment.create).not.toHaveBeenCalled();
  });

  it("rejects a stored service duration outside the supported bound", async () => {
    transaction.service.findUnique.mockResolvedValueOnce({ id: "service-demo", durationMinutes: 900, active: true });
    expect((await POST(request(body))).status).toBe(503);
    expect(transaction.appointment.create).not.toHaveBeenCalled();
  });

  it("returns a conflict without inserting when an active appointment overlaps", async () => {
    transaction.appointment.findFirst.mockResolvedValueOnce({ id: "existing-appointment" });
    const response = await POST(request(body));

    expect(response.status).toBe(409);
    expect(transaction.appointment.create).not.toHaveBeenCalled();
    expect(transaction.appointment.findFirst).toHaveBeenCalledWith({
      where: {
        status: { in: ["REQUESTED", "CONFIRMED"] },
        startsAt: { lt: new Date("2026-11-02T09:50:00.000Z") },
        endsAt: { gt: new Date("2026-11-02T09:00:00.000Z") },
      },
      select: { id: true },
    });
  });

  it("maps a concurrent database exclusion violation to a safe conflict", async () => {
    transaction.appointment.create.mockRejectedValueOnce({
      code: "P2004",
      meta: { database_error: "constraint Appointment_active_no_overlap violated" },
    });
    const response = await POST(request(body));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "That time overlaps another active appointment." });
  });

  it("returns a generic response when the database is unavailable", async () => {
    transaction.service.findUnique.mockRejectedValueOnce(new Error("private database detail"));
    const response = await POST(request(body));

    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private database detail");
  });
});
