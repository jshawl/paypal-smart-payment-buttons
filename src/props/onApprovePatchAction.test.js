/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { ORDERS_API_URL } from "../config";
import { callGraphQL, callRestAPI } from "../api/api";
import { HEADERS, PREFER } from "../constants";

import { getOnApproveOrder } from "./onApprove";

const onApprove = async (data, actions) => {
  return await actions.order.patch();
};
const restart = () => ZalgoPromise.try(vi.fn());

vi.mock("../api/api", async () => {
  const actual = await vi.importActual("../api/api");
  return {
    ...actual,
    callGraphQL: vi.fn(() => {
      return ZalgoPromise.resolve({
        createUpgradedLowScopeAccessToken: "newToken",
      });
    }),
    callRestAPI: vi.fn(() => ZalgoPromise.resolve()),
  };
});

const buyerAccessToken = "S23_A.AA";
const orderID = "EC-abc123";
const facilitatorAccessToken = "A21_A.AA";
const partnerAttributionID = "";

const commonOptions = {
  branded: false,
  clientAccessToken: "",
  createOrder: () => ZalgoPromise.try(() => orderID),
  experiments: {
    upgradeLSATWithIgnoreCache: false,
  },
  intent: "capture",
  facilitatorAccessToken,
  featureFlags: { isLsatUpgradable: true },
  onApprove,
  onError: () => ZalgoPromise.try(() => undefined),
  paymentSource: "paypal",
  vault: false,
  beforeOnApprove: vi.fn(),
  partnerAttributionID,
  orderID,
  paymentID: "",
  payerID: "",
  restart,
  buyerAccessToken,
  forceRestAPI: true,
};

describe("getOnApproveOrder patch action", () => {
  test("invoke callGraphQL from onApprove patch action if treatment is present", async () => {
    const newOptions = {
      ...commonOptions,
      experiments: {
        upgradeLSATWithIgnoreCache: true,
      },
    };
    // $FlowFixMe
    const getOnApproveOrderResult = getOnApproveOrder(newOptions);
    await getOnApproveOrderResult({ buyerAccessToken }, { restart });

    expect(callGraphQL).toHaveBeenNthCalledWith(1, {
      name: "GetCheckoutDetails",
      query: `
        query GetCheckoutDetails($orderID: String!) {
            checkoutSession(token: $orderID) {
                cart {
                    billingType
                    intent
                    paymentId
                    billingToken
                    amounts {
                        total {
                            currencyValue
                            currencyCode
                            currencyFormatSymbolISOCurrency
                        }
                    }
                    supplementary {
                        initiationIntent
                    }
                    category
                }
                flags {
                    isChangeShippingAddressAllowed
                }
                payees {
                    merchantId
                    email {
                        stringValue
                    }
                }
            }
        }
        `,
      variables: { orderID },
      headers: {
        [HEADERS.CLIENT_CONTEXT]: orderID,
      },
    });

    expect(callGraphQL)
      .toHaveBeenNthCalledWith(2, {
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

    // check patchOrder v2 order api call
    expect(callRestAPI).toHaveBeenCalledWith({
      accessToken: "newToken",
      method: "PATCH",
      eventName: "v2_checkout_orders_patch",
      url: `${ORDERS_API_URL}/${orderID}`,
      data: {},
      headers: {
        [HEADERS.PARTNER_ATTRIBUTION_ID]: partnerAttributionID || "",
        [HEADERS.PREFER]: PREFER.REPRESENTATION,
      },
      metricDimensions: {
        lsatUpgrade: "with_ignore_cache_success"
      },
    });
  });

  test("invoke patchOrder from onApprove patch action if treatment is not present", async () => {
    // $FlowFixMe
    const getOnApproveOrderResult = getOnApproveOrder(commonOptions);
    await getOnApproveOrderResult({}, { restart });

    // check patchOrder v2 order api call
    expect(callRestAPI).toHaveBeenCalledWith({
      accessToken: facilitatorAccessToken,
      method: "PATCH",
      eventName: "v2_checkout_orders_patch",
      url: `${ORDERS_API_URL}/${orderID}`,
      data: {},
      headers: {
        [HEADERS.PARTNER_ATTRIBUTION_ID]: partnerAttributionID || "",
        [HEADERS.PREFER]: PREFER.REPRESENTATION,
      },
      metricDimensions: {
        lsatUpgrade: "with_ignore_cache_success"
      },
  });
  });
});
