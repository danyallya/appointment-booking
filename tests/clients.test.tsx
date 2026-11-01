import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { client: { findMany: vi.fn(), create: vi.fn() } },
}));

import { GET, POST } from "@/app/api/clients/route";
import { isLocalClientDirectoryEnabled, normalizeClientPhone, normalizePhoneSearch } from "@/lib/client-directory";
import { prisma } from "@/lib/prisma";
import ClientDirectory from "@/app/clients/client-directory";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const previousDatabaseUrl = process.env.DATABASE_URL;
const findClients = vi.mocked(prisma.client.findMany);
const createClient = vi.mocked(prisma.client.create);

function clientRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "client-demo",
    name: "Alex Example",
    email: "alex@example.com",
    phone: "+12065550142",
    createdAt: new Date("2026-11-01T10:00:00.000Z"),
    ...overrides,
  };
}

function localRequest(url = "http://localhost/api/clients") {
  return new Request(url);
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  process.env.DATABASE_URL = "postgresql://127.0.0.1:5432/aurelle_dev?schema=public";
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previousDatabaseUrl;
});

describe("local client directory boundary", () => {
  it("enables only the development build pointed at Aurelle's loopback database", () => {
    expect(isLocalClientDirectoryEnabled()).toBe(true);
    expect(isLocalClientDirectoryEnabled({ NODE_ENV: "production", DATABASE_URL: process.env.DATABASE_URL })).toBe(false);
    expect(isLocalClientDirectoryEnabled({ NODE_ENV: "development", DATABASE_URL: "postgresql://remote.example/aurelle_dev" })).toBe(false);
    expect(isLocalClientDirectoryEnabled({ NODE_ENV: "development", DATABASE_URL: "postgresql://localhost/another_db" })).toBe(false);
  });

  it("normalizes phone storage and search values", () => {
    expect(normalizeClientPhone(" +1 (206) 555-0142 ")).toBe("+12065550142");
    expect(normalizeClientPhone("(206) 555-0142")).toBe("2065550142");
    expect(normalizeClientPhone("  ")).toBeNull();
    expect(normalizePhoneSearch("+1 (206) 555-0142")).toBe("12065550142");
  });
});

describe("client directory API", () => {
  it("returns ordered, selected client records and searches phone digits", async () => {
    findClients.mockResolvedValue([clientRow()] as never);

    const response = await GET(localRequest("http://localhost/api/clients?q=206-555"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ clients: [{ ...clientRow(), createdAt: "2026-11-01T10:00:00.000Z" }] });
    expect(findClients).toHaveBeenCalledWith({
      where: { OR: [
        { name: { contains: "206-555", mode: "insensitive" } },
        { email: { contains: "206-555", mode: "insensitive" } },
        { phone: { contains: "206555" } },
      ] },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
  });

  it("rejects an overlong search before reading client records", async () => {
    const response = await GET(localRequest(`http://localhost/api/clients?q=${"x".repeat(81)}`));

    expect(response.status).toBe(400);
    expect(findClients).not.toHaveBeenCalled();
  });

  it("hides the route outside a local development database", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const readResponse = await GET(localRequest());
    const writeResponse = await POST(new Request("http://localhost/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alex Example", email: "alex@example.com" }),
    }));

    expect(readResponse.status).toBe(404);
    expect(writeResponse.status).toBe(404);
    expect(findClients).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("normalizes new client fields before storage", async () => {
    createClient.mockResolvedValue(clientRow() as never);

    const response = await POST(new Request("http://localhost/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "  Alex Example  ", email: " ALEX@EXAMPLE.COM ", phone: "+1 (206) 555-0142" }),
    }));

    expect(response.status).toBe(201);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(createClient).toHaveBeenCalledWith({
      data: { name: "Alex Example", email: "alex@example.com", phone: "+12065550142" },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
  });

  it("rejects malformed contacts and reports duplicate email safely", async () => {
    const invalid = await POST(new Request("http://localhost/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alex", email: "alex@example.com", phone: "555" }),
    }));
    expect(invalid.status).toBe(400);
    expect(createClient).not.toHaveBeenCalled();

    createClient.mockRejectedValue({ code: "P2002" });
    const duplicate = await POST(new Request("http://localhost/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alex Example", email: "alex@example.com" }),
    }));
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toEqual({ error: "A client with these details already exists." });
  });

  it("returns a generic error for invalid stored rows and database failures", async () => {
    findClients.mockResolvedValue([clientRow({ email: "NOT-NORMALIZED@example.com" })] as never);
    const invalidRow = await GET(localRequest());
    expect(invalidRow.status).toBe(503);
    expect(await invalidRow.json()).toEqual({ error: "Client directory is temporarily unavailable." });

    findClients.mockRejectedValue(new Error("private database detail"));
    const databaseError = await GET(localRequest());
    expect(databaseError.status).toBe(503);
    expect((await databaseError.text()).includes("private database detail")).toBe(false);
  });
});

describe("client directory interface", () => {
  it("renders searchable fields, clear privacy boundary and accessible controls", () => {
    const markup = renderToStaticMarkup(createElement(ClientDirectory));

    expect(markup).toContain("CLIENT DIRECTORY · LOCAL PREVIEW");
    expect(markup).toContain('aria-label="Toggle theme"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('for="client-search"');
    expect(markup).toContain('for="client-email"');
    expect(markup).toContain("Authentication is required before this directory can handle real client details.");
  });
});
