import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocalClientDirectoryEnabled, normalizeClientPhone, normalizePhoneSearch } from "@/lib/client-directory";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const noStore = { headers: { "Cache-Control": "no-store" } };

const clientInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(254).email().transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(40).optional().nullable(),
}).superRefine((client, context) => {
  const phone = client.phone?.trim() ?? "";
  if (!phone) return;

  if (!/^\+?[\d\s().-]+$/.test(phone)) {
    context.addIssue({ code: "custom", path: ["phone"], message: "Use digits and common phone separators." });
    return;
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    context.addIssue({ code: "custom", path: ["phone"], message: "Phone number must contain 7 to 15 digits." });
  }
}).transform((client) => ({
  name: client.name,
  email: client.email,
  phone: normalizeClientPhone(client.phone),
}));

const clientRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  email: z.string().email().refine((email) => email === email.trim().toLowerCase()),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/).nullable(),
  createdAt: z.date(),
});

const clientSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
} as const;

function unavailable() {
  return NextResponse.json({ error: "Client directory is temporarily unavailable." }, { ...noStore, status: 503 });
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function GET(request: Request) {
  if (!isLocalClientDirectoryEnabled()) {
    return NextResponse.json({ error: "Not found." }, { ...noStore, status: 404 });
  }

  const rawQuery = new URL(request.url).searchParams.get("q") ?? "";
  const parsedQuery = z.string().trim().max(80).safeParse(rawQuery);
  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Search must be 80 characters or fewer." }, { ...noStore, status: 400 });
  }

  const query = parsedQuery.data;
  try {
    const rows = await prisma.client.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: normalizePhoneSearch(query) || query } },
        ],
      } : undefined,
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: clientSelect,
    });
    const clients = z.array(clientRecordSchema).parse(rows);

    return NextResponse.json({ clients }, noStore);
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request) {
  if (!isLocalClientDirectoryEnabled()) {
    return NextResponse.json({ error: "Not found." }, { ...noStore, status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Client details must be valid JSON." }, { ...noStore, status: 400 });
  }

  const parsed = clientInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a name, valid email, and optional phone with 7 to 15 digits." }, { ...noStore, status: 400 });
  }

  try {
    const client = clientRecordSchema.parse(await prisma.client.create({
      data: parsed.data,
      select: clientSelect,
    }));
    return NextResponse.json({ client }, { ...noStore, status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "A client with these details already exists." }, { ...noStore, status: 409 });
    }
    return unavailable();
  }
}
