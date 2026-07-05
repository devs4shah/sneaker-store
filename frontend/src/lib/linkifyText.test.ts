import { describe, expect, it } from "vitest";
import { parseLinkSegments } from "@/lib/linkifyText";

describe("parseLinkSegments", () => {
  it("returns plain text when no URLs are present", () => {
    expect(parseLinkSegments("Comfortable daily runner.")).toEqual([
      { type: "text", value: "Comfortable daily runner." },
    ]);
  });

  it("parses a single URL", () => {
    expect(parseLinkSegments("See https://example.com/details")).toEqual([
      { type: "text", value: "See " },
      { type: "link", value: "https://example.com/details", href: "https://example.com/details" },
    ]);
  });

  it("strips trailing punctuation from URLs", () => {
    expect(parseLinkSegments("Visit https://example.com.")).toEqual([
      { type: "text", value: "Visit " },
      { type: "link", value: "https://example.com", href: "https://example.com" },
      { type: "text", value: "." },
    ]);
  });
});
