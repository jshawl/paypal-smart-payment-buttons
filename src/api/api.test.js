/* @flow */

import { describe, expect, it, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

const request = vi.fn();
const warn = vi.fn();

vi.mock("@krakenjs/belter/src", async () => ({
  ...(await vi.importActual("@krakenjs/belter/src")),
  request,
}));

vi.mock("../lib", async () => ({
  ...(await vi.importActual("../lib")),
  getLogger: () => ({ warn }),
}));

// eslint-disable-next-line import/first
import { callRestAPI } from "./api";

describe("API", () => {
  describe("callRestAPI", () => {
    it("logs 403 errors", () => {
      request.mockImplementationOnce(() =>
        ZalgoPromise.resolve({
          status: 403,
          headers: {},
        })
      );

      expect(
        callRestAPI({
          accessToken: "accessToken",
          url: "",
          eventName: "order_capture",
        })
      ).rejects.toThrow();

      expect(warn).toHaveBeenCalledWith(
        "rest_api_order_capture_status_403_error"
      );

      expect.assertions(2);
    });
  });
});
