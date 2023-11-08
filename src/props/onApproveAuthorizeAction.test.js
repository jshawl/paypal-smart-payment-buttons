/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { callGraphQL } from "../api/api";
import { HEADERS } from "../constants";

import { getOnApproveOrder } from "./onApprove";

const onApprove = async (data, actions) => {
  return await actions.order.authorize();
};

const restart = () => ZalgoPromise.try(vi.fn());

vi.mock("../api/api", async () => {
  const actual = await vi.importActual("../api/api");
  return {
    ...actual,
    callGraphQL: vi.fn(() => {
      return ZalgoPromise.resolve({
        data: {
          createUpgradedLowScopeAccessToken: "newToken",
        },
      });
    }),
  };
});

vi.mock("../api/order", async () => {
  const actual = await vi.importActual("../api/order");

  return {
    ...actual,
    authorizeOrder: vi.fn(() => ZalgoPromise.resolve()),
  };
});

const buyerAccessToken = "S23_A.AA";
const orderID = "EC-abc123";
const facilitatorAccessToken = "A21_A.AA";

const commonOptions = {
  branded: false,
  clientAccessToken: "",
  createOrder: () => ZalgoPromise.try(() => orderID),
  experiments: {},
  intent: "authorize",
  facilitatorAccessToken,
  featureFlags: { isLsatUpgradable: true },
  onApprove,
  onError: () => ZalgoPromise.try(() => undefined),
  paymentSource: "paypal",
  vault: false,
  beforeOnApprove: vi.fn(),
  partnerAttributionID: "",
  orderID,
  paymentID: "",
  payerID: "",
  restart,
  buyerAccessToken,
  forceRestAPI: true,
};

describe("getOnApproveOrder authorize action", () => {
  test("invoke callGraphQL from onApprove authorize action", async () => {
    // $FlowFixMe
    const getOnApproveOrderResult = getOnApproveOrder(commonOptions);
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

    expect(callGraphQL).toHaveBeenNthCalledWith(2, {
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
    });
  });
});
