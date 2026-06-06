import { describe, expect, test } from "vitest";
import { percentReduction, roughTokens } from "../../src/utils/tokens.js";

describe("token helpers", () => {
  test("roughTokens estimates string length", () => {
    expect(roughTokens("12345678")).toBe(2);
  });

  test("percentReduction computes reduction", () => {
    expect(percentReduction(100, 25)).toBe(75);
  });
});
