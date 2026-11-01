import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const serviceCatalogItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string(),
  durationMinutes: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
  active: z.literal(true),
});

const responseOptions = {
  headers: { "Cache-Control": "no-store" },
};

export async function GET() {
  try {
    const rows = await prisma.service.findMany({
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
    const services = z.array(serviceCatalogItemSchema).parse(rows);

    return NextResponse.json({ services }, responseOptions);
  } catch {
    return NextResponse.json(
      { error: "Service catalog is temporarily unavailable." },
      { ...responseOptions, status: 503 },
    );
  }
}
