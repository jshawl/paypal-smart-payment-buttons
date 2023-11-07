/* @flow */

import { describe, expect, it, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { callRestAPI } from "./api";

vi.mock("@krakenjs/belter/src", async () => ({
  ...(await vi.importActual("@krakenjs/belter/src")),
  request: vi.fn().mockImplementationOnce(() =>
    ZalgoPromise.resolve({
      status: 403,
      headers: {},
    }),
  ),
}));

const warn = vi.fn();
vi.mock("../lib", async () => ({
  ...(await vi.importActual("../lib")),
  getLogger: vi.fn().mockImplementationOnce(() => ({ warn })),
}));

describe("API", () => {
  describe("callRestAPI", () => {
    it("logs 403 errors", () => {
      expect(
        callRestAPI({
          accessToken: "accessToken",
          url: "",
          eventName: "order_capture",
        }),
      ).rejects.toThrow();

      expect(warn).toHaveBeenCalledWith(
        "rest_api_order_capture_status_403_error",
      );

      expect.assertions(2);
    });
  });
});
