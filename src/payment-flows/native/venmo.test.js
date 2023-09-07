/* @flow */
import { describe, it, expect } from "vitest";

import { getDimensions } from "./venmo";

describe("venmo payment flow", () => {
  it("has a specific popup size", () => {
    expect(getDimensions("venmo")).toStrictEqual({
      height: 692,
      width: 500,
    });
  });
});
