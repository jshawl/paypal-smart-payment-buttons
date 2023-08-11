/* @flow */

import { describe, expect, it, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

const callRestAPI = vi.fn(() =>
  ZalgoPromise.reject({
    response: {
      headers: {},
    },
  })
);
const callSmartAPI = vi.fn(() =>
  ZalgoPromise.resolve({
    data: {},
    headers: {},
  })
);

// eslint-disable-next-line import/first
import { getOrder, authorizeOrder, captureOrder, patchOrder } from "./order";

vi.mock("./api", async () => {
  const actual = await vi.importActual("./api");
  return {
    ...actual,
    callRestAPI,
    callSmartAPI,
  };
});

const orderAPIOptions = {
  facilitatorAccessToken: "",
  partnerAttributionID: "",
};

const orderID = "abc123";

describe("actions smart api fallback cases", () => {
  describe("getOrder calls the smart api", () => {
    it("by default", async () => {
      await getOrder(orderID, orderAPIOptions);
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_get" })
      );
    });
    it("when forceRestAPI is true and callRestAPI throws", async () => {
      await getOrder(orderID, {
        ...orderAPIOptions,
        forceRestAPI: true,
      });
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_get" })
      );
    });
  });

  describe("captureOrder calls the smart api", () => {
    it("by default", async () => {
      await captureOrder(orderID, orderAPIOptions);
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_capture" })
      );
    });
    it("when forceRestAPI is true and callRestAPI throws", async () => {
      await captureOrder(orderID, {
        ...orderAPIOptions,
        forceRestAPI: true,
      });
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_capture" })
      );
    });
  });

  describe("authorizeOrder calls the smart api", () => {
    it("by default", async () => {
      await authorizeOrder(orderID, orderAPIOptions);
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_authorize" })
      );
    });
    it("when forceRestAPI is true and callRestAPI throws", async () => {
      await authorizeOrder(orderID, {
        ...orderAPIOptions,
        forceRestAPI: true,
      });
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_authorize" })
      );
    });
  });

  describe("patchOrder calls the smart api", () => {
    it("by default", async () => {
      await patchOrder(orderID, {}, orderAPIOptions);
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_patch" })
      );
    });
    it("when forceRestAPI is true and callRestAPI throws", async () => {
      await patchOrder(
        orderID,
        {},
        {
          ...orderAPIOptions,
          forceRestAPI: true,
        }
      );
      expect(callSmartAPI).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: "order_patch" })
      );
    });
  });
});
