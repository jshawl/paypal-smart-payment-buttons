/** @flow */

import { uniqueID } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { describe, beforeEach, test, expect, vi } from "vitest";

import { patchShipping, patchOrder } from "../api";

import {
  getOnShippingChange,
  isWeasley,
  logInvalidShippingChangePatches,
  sanitizePatch,
} from "./onShippingChange";

vi.mock("../api");
vi.mock("./createOrder");

const logger = {
  error: vi.fn(() => logger),
  info: vi.fn(() => logger),
  track: vi.fn(() => logger),
  flush: vi.fn(),
};

vi.mock("../lib/logger", () => ({
  getLogger: vi.fn(() => logger),
}));

const mockPatchOrder = patchOrder;
const mockPatchShipping = patchShipping;

describe("onShippingChange", () => {
  describe("getOnShippingChange", () => {
    let clientID;
    let facilitatorAccessToken;
    let partnerAttributionID;
    let orderID;
    const createOrder = vi.fn();
    const invocationActions = {
      reject: () => ZalgoPromise.reject(),
      resolve: () => ZalgoPromise.resolve(),
    };
    const featureFlags = { isLsatUpgradable: false };

    beforeEach(() => {
      clientID = uniqueID();
      facilitatorAccessToken = uniqueID();
      partnerAttributionID = uniqueID();
      orderID = uniqueID();
      createOrder.mockImplementation(() => ZalgoPromise.resolve(orderID));
    });

    test("should invoke onShippingChange with a paymentID aliased to orderID", () => {
      const merchantOnShippingChange = vi.fn();
      const fn = getOnShippingChange(
        // $FlowFixMe
        {
          clientID,
          experiments: {
            btSdkOrdersV2Migration: true,
          },
          featureFlags,
          onShippingChange: merchantOnShippingChange,
          partnerAttributionID,
        },
        { facilitatorAccessToken, createOrder }
      );

      if (fn) {
        fn({ orderID: "EC-abc123" }, invocationActions);
      }

      expect(merchantOnShippingChange).toHaveBeenCalledWith(
        expect.objectContaining({
          orderID: "EC-abc123",
          paymentID: "abc123",
          paymentId: "abc123",
        }),
        expect.anything()
      );
    });

    describe("should call patchOrder", () => {
      test("when useShippingChangeCallbackMutation is inactive", async () => {
        // $FlowFixMe
        mockPatchOrder.mockImplementation(() => ZalgoPromise.resolve({}));

        const patchData = [];
        const onShippingChange = vi.fn((data, actions) => {
          return actions.order.patch(patchData);
        });

        const experiments = { useShippingChangeCallbackMutation: false };

        const buyerAccessToken = uniqueID();

        const fn = getOnShippingChange(
          // $FlowFixMe
          {
            onShippingChange,
            partnerAttributionID,
            featureFlags,
            experiments,
            clientID,
          },
          { facilitatorAccessToken, createOrder }
        );

        const data = { buyerAccessToken };

        if (fn) {
          await fn(data, invocationActions);
          expect(patchOrder).toBeCalledWith(orderID, patchData, {
            facilitatorAccessToken,
            buyerAccessToken,
            partnerAttributionID,
            forceRestAPI: featureFlags.isLsatUpgradable,
            experiments,
          });
        }

        expect.assertions(1);
      });

      test("when useShippingChangeCallbackMutation is active, but appName is not weasley", async () => {
        // $FlowFixMe
        mockPatchOrder.mockImplementation(() => ZalgoPromise.resolve({}));

        const patchData = [];
        const onShippingChange = vi.fn((data, actions) => {
          return actions.order.patch(patchData);
        });

        const experiments = { useShippingChangeCallbackMutation: true };

        const buyerAccessToken = uniqueID();

        const fn = getOnShippingChange(
          // $FlowFixMe
          {
            onShippingChange,
            partnerAttributionID,
            featureFlags,
            experiments,
            clientID,
          },
          { facilitatorAccessToken, createOrder }
        );

        const data = { appName: "xoon", buyerAccessToken };

        if (fn) {
          await fn(data, invocationActions);
          expect(patchOrder).toBeCalledWith(orderID, patchData, {
            facilitatorAccessToken,
            buyerAccessToken,
            partnerAttributionID,
            forceRestAPI: featureFlags.isLsatUpgradable,
            experiments,
          });
        }

        expect.assertions(1);
      });

      test("should return generic error if patchOrder fails", async () => {
        // $FlowFixMe
        mockPatchOrder.mockImplementation(() => ZalgoPromise.reject({}));

        const patchData = [];
        const onShippingChange = vi.fn((data, actions) => {
          return actions.order.patch(patchData);
        });

        const experiments = { useShippingChangeCallbackMutation: false };

        const buyerAccessToken = uniqueID();
        const fn = getOnShippingChange(
          // $FlowFixMe
          {
            onShippingChange,
            partnerAttributionID,
            featureFlags,
            experiments,
            clientID,
          },
          { facilitatorAccessToken, createOrder }
        );

        const data = { buyerAccessToken };

        if (fn) {
          await expect(fn(data, invocationActions)).rejects.toThrow(
            "Order could not be patched"
          );
        }

        expect.assertions(1);
      });
    });

    describe("should call patchShipping", () => {
      test("when useShippingChangeCallbackMutation is active, appName is weasley, and there is no access token", async () => {
        // $FlowFixMe
        mockPatchShipping.mockImplementation(() => ZalgoPromise.resolve({}));

        const patchData = [];
        const onShippingChange = vi.fn((data, actions) => {
          return actions.order.patch(patchData);
        });

        const experiments = { useShippingChangeCallbackMutation: true };

        const fn = getOnShippingChange(
          // $FlowFixMe
          {
            onShippingChange,
            partnerAttributionID,
            featureFlags,
            experiments,
            clientID,
          },
          { facilitatorAccessToken, createOrder }
        );
        const data = { appName: "weasley", buyerAccessToken: null };

        if (fn) {
          await fn(data, invocationActions);
        }

        expect(patchShipping).toBeCalledWith({
          clientID,
          data: patchData,
          orderID,
        });

        expect.assertions(1);
      });

      test("should return generic error if patchShipping fails", async () => {
        // $FlowFixMe
        mockPatchShipping.mockImplementation(() => ZalgoPromise.reject({}));

        const patchData = [];
        const onShippingChange = vi.fn((data, actions) => {
          return actions.order.patch(patchData);
        });

        const experiments = { useShippingChangeCallbackMutation: true };

        const fn = getOnShippingChange(
          // $FlowFixMe
          {
            onShippingChange,
            partnerAttributionID,
            featureFlags,
            experiments,
            clientID,
          },
          { facilitatorAccessToken, createOrder }
        );

        if (fn) {
          await expect(fn({}, invocationActions)).rejects.toThrow(
            "Order could not be patched"
          );
        }

        expect.assertions(1);
      });
    });
  });

  describe("sanitizePatch", () => {
    test.each([
      [
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {},
        },
        [],
      ],
      [
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/shipping/options",
          value: {},
        },
        [],
      ],
      [
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/shipping/name",
          value: {},
        },
        [],
      ],
      [
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='d9f80740-38f0-11e8-b467-0ed5f89f718b'/amount",
          value: {},
        },
        [],
      ],
      [
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='d9f80740-38f0-11e8-b467-0ed5f89f718b'/shipping/address",
          value: {},
        },
        [],
      ],
    ])("should not reject valid patch paths %s", (rejected, output) => {
      expect(sanitizePatch([], rejected)).toStrictEqual(output);
    });

    test.each([
      [
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'",
          value: {},
        },
        ["/purchase_units/@reference_id=='default'"],
      ],
      [
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/invoice",
          value: {},
        },
        ["/purchase_units/@reference_id=='default'/invoice"],
      ],
    ])("should reject invalid patch paths %s", (rejected, output) => {
      expect(sanitizePatch([], rejected)).toStrictEqual(output);
    });
  });

  describe("#isWeasley", () => {
    test("returns `true` if appName is `weasley`", () => {
      expect(isWeasley("weasley")).toBe(true);
    });

    test("returns `false` if appName is not `weasley`", () => {
      expect(isWeasley("xoon")).toBe(false);
    });
  });

  describe("#logInvalidShippingChangePatches", () => {
    test("when appName is present and has invalid patches", () => {
      logInvalidShippingChangePatches({
        appName: "xoon",
        buyerAccessToken: "ABC",
        data: [
          {
            op: "replace",
            path: "/purchase_units/@reference_id=='default'",
            value: {},
          },
        ],
        shouldUsePatchShipping: false,
      });

      expect(logger.info).toHaveBeenCalledWith(
        "button_shipping_change_patch_data_has_invalid_path_xoon",
        {
          appName: "xoon",
          rejected: "[\"/purchase_units/@reference_id=='default'\"]",
          hasBuyerAccessToken: "true",
          shouldUsePatchShipping: "false",
        }
      );
    });

    test("when it has valid patches, it should not log", () => {
      logInvalidShippingChangePatches({
        appName: "xoon",
        buyerAccessToken: "ABC",
        data: [
          {
            op: "replace",
            path: "/purchase_units/@reference_id=='default'/amount",
            value: {},
          },
          {
            op: "replace",
            path: "/purchase_units/@reference_id=='default'/shipping/address",
            value: {},
          },
          {
            op: "replace",
            path: "/purchase_units/@reference_id=='default'/shipping/options",
            value: {},
          },
          {
            op: "replace",
            path: "/purchase_units/@reference_id=='d9f80740-38f0-11e8-b467-0ed5f89f718b'/amount",
            value: {},
          },
        ],
        shouldUsePatchShipping: false,
      });

      expect(logger.info).not.toHaveBeenCalled();
    });

    test("when patch `data` is not an array, it should emit an info log", () => {
      logInvalidShippingChangePatches({
        appName: "weasley",
        data: {},
        shouldUsePatchShipping: true,
      });

      expect(logger.info).toHaveBeenCalledWith(
        "button_shipping_change_patch_data_is_object",
        {
          appName: "weasley",
          hasBuyerAccessToken: "false",
          shouldUsePatchShipping: "true",
        }
      );
    });
  });
});
