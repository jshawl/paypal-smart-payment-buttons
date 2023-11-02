/* @flow */
import { describe, it, expect, vi } from "vitest";

import {
  getBuyerAccessToken,
  setBuyerAccessToken,
  getSessionID,
  getSessionState,
  getStickinessID,
  getStorageState,
} from "./session";

vi.mock("get-browser-fingerprint", () => ({
  default: () => "browser fingerprinted",
}));

describe("getSessionId", () => {
  it("returns a session id", () => {
    expect(getSessionID()).toMatch(/uid_.*/);
  });
});

describe("getSessionState", () => {
  it("invokes the handler with a state object", () => {
    const mockFn = vi.fn();
    getSessionState(mockFn);
    expect(mockFn).toHaveBeenCalledWith({});
  });
});

describe("getStorageState", () => {
  it("invokes the handler with session info", () => {
    const mockFn = vi.fn();
    getStorageState(mockFn);
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        __session__: expect.any(Object),
      }),
    );
  });
});

describe("getStickinessID", () => {
  it("returns a number in string form", () => {
    expect(getStickinessID()).toMatch(/\d+/);
  });
});

describe("getBuyerAccessToken", () => {
  it("is undefined by default", () => {
    expect(getBuyerAccessToken()).toBe(undefined);
  });
  it("setBuyerAccessToken() updates the access token", () => {
    const accessToken = new Date().toUTCString();
    setBuyerAccessToken(accessToken);
    expect(getBuyerAccessToken()).toBe(accessToken);
  });
});
