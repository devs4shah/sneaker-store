import { describe, expect, it } from "vitest";
import { sneakerFormSchema } from "@/lib/validations/adminProduct";

describe("sneakerFormSchema", () => {
  it("accepts valid sneaker input", () => {
    const result = sneakerFormSchema.safeParse({
      name: "Air Runner",
      brand: "ProSneaker",
      description: "Daily trainer",
      price: 4999,
      stockQuantity: 10,
      gender: "MEN",
      color: "Black",
      size: 9,
      categoryId: "11111111-1111-1111-1111-111111111111",
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-positive price", () => {
    const result = sneakerFormSchema.safeParse({
      name: "Air Runner",
      brand: "ProSneaker",
      price: 0,
      stockQuantity: 10,
      gender: "MEN",
      color: "Black",
      size: 9,
      categoryId: "11111111-1111-1111-1111-111111111111",
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative stock", () => {
    const result = sneakerFormSchema.safeParse({
      name: "Air Runner",
      brand: "ProSneaker",
      price: 100,
      stockQuantity: -1,
      gender: "MEN",
      color: "Black",
      size: 9,
      categoryId: "11111111-1111-1111-1111-111111111111",
    });

    expect(result.success).toBe(false);
  });
});
