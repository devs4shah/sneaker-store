import { describe, expect, it } from "vitest";
import { getPrimarySneakerImage, sortSneakerImages } from "@/lib/sneakerImages";

describe("sortSneakerImages", () => {
  it("sorts by displayOrder ascending", () => {
    const sorted = sortSneakerImages([
      { id: "2", imageUrl: "/b.jpg", displayOrder: 2 },
      { id: "0", imageUrl: "/a.jpg", displayOrder: 0 },
      { id: "1", imageUrl: "/c.jpg", displayOrder: 1 },
    ]);

    expect(sorted.map((image) => image.id)).toEqual(["0", "1", "2"]);
  });

  it("returns first ordered image as primary", () => {
    const primary = getPrimarySneakerImage([
      { id: "2", imageUrl: "/b.jpg", displayOrder: 2 },
      { id: "0", imageUrl: "/a.jpg", displayOrder: 0 },
    ]);

    expect(primary?.id).toBe("0");
    expect(primary?.imageUrl).toBe("/a.jpg");
  });
});
