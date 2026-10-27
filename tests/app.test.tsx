import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../app/page";

describe("appointment-booking workspace", () => {
  it("renders its initial workspace content", () => {
    const markup = renderToStaticMarkup(createElement(HomePage));
    expect(markup).toContain("AURELLE");
    expect(markup).toContain("TUESDAY, 27 OCTOBER 2026");
    expect(markup).toContain("New appointment");
    expect(markup).toContain('aria-label="Toggle theme"');
  });
});
