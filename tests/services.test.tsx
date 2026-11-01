import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { service: { findMany: vi.fn() } },
}));

import { GET } from "@/app/api/services/route";
import { prisma } from "@/lib/prisma";

const serviceRow = (overrides: Record<string, unknown> = {}) => ({
  id: "service-demo",
  name: "Signature facial",
  description: "A restorative facial treatment.",
  durationMinutes: 50,
  priceCents: 12500,
  active: true,
  ...overrides,
});

const findServices = vi.mocked(prisma.service.findMany);

afterEach(() => vi.clearAllMocks());

describe("public service catalog", () => {
  it("returns only active, safe catalog fields in name order", async () => {
    findServices.mockResolvedValue([serviceRow()] as never);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ services: [serviceRow()] });
    expect(findServices).toHaveBeenCalledWith({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        durationMinutes: true,
        priceCents: true,
        active: true,
      },
    });
  });

  it.each([
    ["negative price", { priceCents: -1 }],
    ["fractional price", { priceCents: 125.5 }],
    ["zero duration", { durationMinutes: 0 }],
    ["fractional duration", { durationMinutes: 50.5 }],
    ["inactive service", { active: false }],
  ])("rejects invalid service data: %s", async (_label, overrides) => {
    findServices.mockResolvedValue([serviceRow(overrides)] as never);

    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({
      error: "Service catalog is temporarily unavailable.",
    });
  });

  it("returns a generic unavailable response when the database read fails", async () => {
    findServices.mockRejectedValue(new Error("private database detail"));

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Service catalog is temporarily unavailable.",
    });
  });
});
