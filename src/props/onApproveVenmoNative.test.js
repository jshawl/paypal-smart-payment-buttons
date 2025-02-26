/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { callGraphQL } from "../api/api";
import { getOrder } from "../api/order";
import { HEADERS } from "../constants";

import { getOnApproveOrder } from "./onApprove";

const onApprove = async (data, actions) => {
  return await actions.order.get();
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
    getOrder: vi.fn(() => ZalgoPromise.resolve()),
  };
});

const buyerAccessToken = undefined;
const orderID = "EC-abc123";
const facilitatorAccessToken = "A21_A.AA";

const commonOptions = {
  branded: false,
  clientAccessToken: "",
  createOrder: () => ZalgoPromise.try(() => orderID),
  experiments: {
    upgradeLSATWithIgnoreCache: true,
  },
  intent: "capture",
  facilitatorAccessToken,
  featureFlags: { isLsatUpgradable: true },
  onApprove,
  onError: () => ZalgoPromise.try(() => undefined),
  paymentSource: "venmo",
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

describe("getOnApproveOrder get action", () => {
  test("Should not create new access token if treatment is present and payment source is venmo native", async () => {
    // $FlowFixMe
    const getOnApproveOrderResult = getOnApproveOrder(commonOptions);
    await getOnApproveOrderResult({}, { restart });

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

    expect(callGraphQL).not.toHaveBeenNthCalledWith(2, {
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

    expect(getOrder).toHaveBeenCalled();
  });
});
