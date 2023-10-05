/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { callGraphQL } from "../api/api";
import { getOrder } from "../api/order";
import { HEADERS } from "../constants";

import { buildXApproveOrderActions } from "./onApprove";

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
const buyerAccessToken = "S23_A.AA";
const orderID = "EC-abc123";
const facilitatorAccessToken = "A21_A.AA";

const commonOptions = {
  intent: "capture",
  orderID,
  paymentID: "abc123",
  payerID: "",
  restart,
  facilitatorAccessToken,
  buyerAccessToken,
  partnerAttributionID: "",
  forceRestAPI: true,
  onError: () => ZalgoPromise.try(() => undefined),
  experiments: {
    btSdkOrdersV2Migration: true,
    upgradeLSATWithIgnoreCache: false,
  },
};

describe("getOnApproveOrder get action", () => {
  test("invoke callGraphQL from onApprove get action if treatment is present", async () => {
    const buildXApproveOrderActionsResult = buildXApproveOrderActions({
      ...commonOptions,
      experiments: { upgradeLSATWithIgnoreCache: true },
    });
    const { order } = buildXApproveOrderActionsResult;

    await order.get();

    expect(callGraphQL).toHaveBeenCalledWith({
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

  test("invoke getOrder from onApprove get action if treatment is not present", async () => {
    // $FlowFixMe
    const buildXApproveOrderActionsResult = buildXApproveOrderActions({
      commonOptions,
    });
    const { order } = buildXApproveOrderActionsResult;

    await order.get();

    expect(callGraphQL).not.toHaveBeenCalled();
    expect(getOrder).toHaveBeenCalled();
  });
});
