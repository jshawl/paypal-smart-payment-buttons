/** @flow */

import { uniqueID } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { describe, beforeEach, test, expect, vi } from "vitest";

import { patchOrder } from "../api/order";
import { callGraphQL } from "../api/api";
import { HEADERS } from "../constants";

import { getOnShippingChange } from "./onShippingChange";

vi.mock("../api/order");
vi.mock("./createOrder");
vi.mock("../api/api", async () => {
  const actual = await vi.importActual("../api/api");
  return {
    ...actual,
    callGraphQL: vi.fn(() => {
      return ZalgoPromise.resolve({
        createUpgradedLowScopeAccessToken: "newToken",
      });
    }),
  };
});

const mockPatchOrder = patchOrder;

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

    describe("should call patchOrder", () => {
      test("should create new access token if not venmo native", async () => {
        // $FlowFixMe
        mockPatchOrder.mockImplementation(() => ZalgoPromise.resolve({}));

        const patchData = [];
        const onShippingChange = vi.fn((data, actions) => {
          return actions.order.patch(patchData);
        });

        const experiments = {
          useShippingChangeCallbackMutation: false,
          upgradeLSATWithIgnoreCache: true,
        };

        const buyerAccessToken = uniqueID();

        const fn = getOnShippingChange(
          {
            paymentSource: "venmo",
            onShippingChange,
            partnerAttributionID,
            featureFlags,
            experiments,
            clientID,
          },
          { facilitatorAccessToken, createOrder },
        );

        const data = { buyerAccessToken };

        if (fn) {
          await fn(data, invocationActions);
          expect(callGraphQL)
            .toHaveBeenNthCalledWith(1, {
              name: "CreateUpgradedLowScopeAccessToken",
              headers: {
                [HEADERS.ACCESS_TOKEN]: buyerAccessToken,
                [HEADERS.CLIENT_CONTEXT]: orderID,
              },
              query: `
            mutation CreateUpgradedLowScopeAccessToken(
                $orderID: String!
                $buyerAccessToken: String!
                $facilitatorAccessToken: String!
            ) {
                createUpgradedLowScopeAccessToken(
                    token: $orderID
                    buyerAccessToken: $buyerAccessToken
                    merchantLSAT: $facilitatorAccessToken
                )
            }
        `,
              variables: { facilitatorAccessToken, buyerAccessToken, orderID },
            })
            .toReturn({
              createUpgradedLowScopeAccessToken: "newToken",
            });

          expect(patchOrder).toBeCalledWith(orderID, patchData, {
            facilitatorAccessToken: "newToken",
            buyerAccessToken,
            partnerAttributionID,
            forceRestAPI: featureFlags.isLsatUpgradable,
            experiments,
          });
        }

        expect.assertions(2);
      });

      test("should not create new access token if venmo native", async () => {
        // $FlowFixMe
        mockPatchOrder.mockImplementation(() => ZalgoPromise.resolve({}));

        const patchData = [];
        const onShippingChange = vi.fn((data, actions) => {
          return actions.order.patch(patchData);
        });

        const experiments = {
          useShippingChangeCallbackMutation: false,
          upgradeLSATWithIgnoreCache: true,
        };

        const buyerAccessToken = undefined;

        const fn = getOnShippingChange(
          {
            paymentSource: "venmo",
            onShippingChange,
            partnerAttributionID,
            featureFlags,
            experiments,
            clientID,
          },
          { facilitatorAccessToken, createOrder },
        );

        const data = { buyerAccessToken };

        if (fn) {
          await fn(data, invocationActions);
          expect(callGraphQL).not.toHaveBeenCalled();
          expect(patchOrder).toBeCalledWith(orderID, patchData, {
            facilitatorAccessToken,
            buyerAccessToken,
            partnerAttributionID,
            forceRestAPI: featureFlags.isLsatUpgradable,
            experiments,
          });
        }

        expect.assertions(2);
      });
    });
  });
});
