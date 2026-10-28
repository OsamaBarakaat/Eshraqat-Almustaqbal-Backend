import { normalizeSaudiPhone, isEmail } from "./phone.util";

describe("Saudi Phone Number Normalization", () => {
  it("should normalize raw national 9-digit format (565642556) to canonical E.164 (+966565642556)", () => {
    const res = normalizeSaudiPhone("565642556");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+966565642556");
  });

  it("should normalize local format with leading zero (0565642556)", () => {
    const res = normalizeSaudiPhone("0565642556");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+966565642556");
  });

  it("should normalize 966 prefix without plus (966565642556)", () => {
    const res = normalizeSaudiPhone("966565642556");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+966565642556");
  });

  it("should normalize international format (+966565642556)", () => {
    const res = normalizeSaudiPhone("+966565642556");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+966565642556");
  });

  it("should normalize numbers with spaces, hyphens and parentheses (+966 56 564 2556)", () => {
    const res = normalizeSaudiPhone("+966 56-564.2556");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+966565642556");
  });

  it("should normalize international double zero prefix (00966565642556)", () => {
    const res = normalizeSaudiPhone("00966565642556");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+966565642556");
  });

  it("should handle redundant +96605... format safely", () => {
    const res = normalizeSaudiPhone("+9660565642556");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+966565642556");
  });

  it("should reject invalid numbers or wrong digit count", () => {
    expect(normalizeSaudiPhone("12345").isValid).toBe(false);
    expect(normalizeSaudiPhone("0656564255").isValid).toBe(false);
    expect(normalizeSaudiPhone("+12025550199").isValid).toBe(false);
    expect(normalizeSaudiPhone("").isValid).toBe(false);
  });
});

describe("Identifier Detection", () => {
  it("should accurately identify emails", () => {
    expect(isEmail("saad@example.com")).toBe(true);
    expect(isEmail("565642556")).toBe(false);
    expect(isEmail("+966565642556")).toBe(false);
  });
});
