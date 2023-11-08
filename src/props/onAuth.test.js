/* @flow */

import { describe, expect, vi, it } from "vitest";
import { uniqueID } from "@krakenjs/belter/src";

import { setBuyerAccessToken } from "../lib/session";

import { getOnAuth } from "./onAuth";

const logger = {
  warn: vi.fn(() => logger),
  info: vi.fn(() => logger),
};

vi.mock("../lib/logger", () => ({
  getLogger: vi.fn(() => logger),
}));

vi.mock("../lib/session", () => ({
  setBuyerAccessToken: vi.fn(),
}));

describe("getOnAuth", () => {
  it("should call setBuyerAccessToken if there is accessToken", async () => {
    const onAuth = getOnAuth();
    const accessToken = uniqueID();
    const res = await onAuth({ accessToken });

    expect(setBuyerAccessToken).toHaveBeenCalled();
    expect(res).equal(accessToken);

    expect.assertions(2);
  });

  it("should return undefined if there is no accessToken", async () => {
    const onAuth = getOnAuth();
    const res = await onAuth({ accessToken: undefined });

    expect(setBuyerAccessToken).not.toHaveBeenCalled();
    expect(res).equal(undefined);

    expect.assertions(2);
  });
});
