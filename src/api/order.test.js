/* @flow */

import { describe, expect, it, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { getOrder, authorizeOrder, captureOrder, patchOrder } from "./order";
import { callSmartAPI } from "./api";

vi.mock("./api", async () => {
  const actual = await vi.importActual("./api");
  return {
    ...actual,
    callRestAPI: vi.fn(() =>
      ZalgoPromise.reject({
        message: "*_call_rest_api_error",
        response: {
          headers: {},
        },
      }),
    ),
    callSmartAPI: vi.fn(() =>
      ZalgoPromise.resolve({
        data: {},
        headers: {},
      }),
    ),
  };
});

const orderAPIOptions = {
  facilitatorAccessToken: "",
  partnerAttributionID: "",
  experiments: {
    disableSmartAPI: false,
  },
};

const orderID = "abc123";

describe("actions smart api fallback cases", () => {
  describe("getOrder calls the smart api", () => {
    it("by default", async () => {
      await getOrder(orderID, orderAPIOptions);
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_get" }),
      );
    });
    it("when forceRestAPI is true and callRestAPI throws", async () => {
      await getOrder(orderID, {
        ...orderAPIOptions,
        forceRestAPI: true,
      });
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_get" }),
      );
    });
    it("unless disableSmartApi is true", async () => {
      await expect(() =>
        getOrder(orderID, {
          ...orderAPIOptions,
          forceRestAPI: true,
          experiments: {
            disableSmartAPI: true,
          },
        }),
      ).rejects.toThrowError("*_call_rest_api_error");
      expect(callSmartAPI).not.toHaveBeenCalled();
    });
  });

  describe("captureOrder calls the smart api", () => {
    it("by default", async () => {
      await captureOrder(orderID, orderAPIOptions);
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_capture" }),
      );
    });
    it("when forceRestAPI is true and callRestAPI throws", async () => {
      await captureOrder(orderID, {
        ...orderAPIOptions,
        forceRestAPI: true,
      });
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_capture" }),
      );
    });
    it("unless disableSmartApi is true", async () => {
      await expect(() =>
        captureOrder(orderID, {
          ...orderAPIOptions,
          forceRestAPI: true,
          experiments: {
            disableSmartAPI: true,
          },
        }),
      ).rejects.toThrowError("*_call_rest_api_error");
      expect(callSmartAPI).not.toHaveBeenCalled();
    });
  });

  describe("authorizeOrder calls the smart api", () => {
    it("by default", async () => {
      await authorizeOrder(orderID, orderAPIOptions);
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_authorize" }),
      );
    });
    it("when forceRestAPI is true and callRestAPI throws", async () => {
      await authorizeOrder(orderID, {
        ...orderAPIOptions,
        forceRestAPI: true,
      });
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_authorize" }),
      );
    });
    it("unless disableSmartApi is true", async () => {
      await expect(() =>
        authorizeOrder(orderID, {
          ...orderAPIOptions,
          forceRestAPI: true,
          experiments: {
            disableSmartAPI: true,
          },
        }),
      ).rejects.toThrowError("*_call_rest_api_error");
      expect(callSmartAPI).not.toHaveBeenCalled();
    });
  });

  describe("patchOrder calls the smart api", () => {
    it("by default", async () => {
      await patchOrder(orderID, {}, orderAPIOptions);
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_patch" }),
      );
    });
    it("when forceRestAPI is true and callRestAPI throws", async () => {
      await patchOrder(
        orderID,
        {},
        {
          ...orderAPIOptions,
          forceRestAPI: true,
        },
      );
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_patch" }),
      );
    });
    it("unless disableSmartApi is true", async () => {
      await expect(() =>
        patchOrder(
          orderID,
          {},
          {
            ...orderAPIOptions,
            forceRestAPI: true,
            experiments: {
              disableSmartAPI: true,
            },
          },
        ),
      ).rejects.toThrowError("*_call_rest_api_error");
      expect(callSmartAPI).not.toHaveBeenCalled();
    });
  });
});
