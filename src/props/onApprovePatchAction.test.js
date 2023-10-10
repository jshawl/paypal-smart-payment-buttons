/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { ORDERS_API_URL } from "../config";
import { callGraphQL, callRestAPI } from "../api/api";
import { HEADERS, PREFER } from "../constants";

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
    callRestAPI: vi.fn(() => ZalgoPromise.resolve()),
  };
});

const buyerAccessToken = "S23_A.AA";
const orderID = "EC-abc123";
const facilitatorAccessToken = "A21_A.AA";
const partnerAttributionID = "";

const experiments = {
  btSdkOrdersV2Migration: true,
  upgradeLSATWithIgnoreCache: false,
};

const commonOptions = {
  intent: "capture",
  orderID,
  paymentID: "abc123",
  payerID: "",
  restart,
  facilitatorAccessToken,
  buyerAccessToken,
  partnerAttributionID,
  forceRestAPI: true,
  onError: () => ZalgoPromise.try(() => undefined),
  experiments,
};

describe("getOnApproveOrder patch action", () => {
  test("invoke callGraphQL from onApprove patch action if treatment is present", async () => {
    const buildXApproveOrderActionsResult = buildXApproveOrderActions({
      ...commonOptions,
      experiments: { upgradeLSATWithIgnoreCache: true },
    });
    const { order } = buildXApproveOrderActionsResult;

    await order.patch();

    expect(callGraphQL)
      .toHaveBeenCalledWith({
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
        data: {
          createUpgradedLowScopeAccessToken: "newToken",
        },
      });

    // check patchOrder v2 order api call
    expect(callRestAPI).toHaveBeenCalledWith({
      method: "PATCH",
      eventName: "v2_checkout_orders_patch",
      url: `${ORDERS_API_URL}/${orderID}`,
      data: {},
      headers: {
        [HEADERS.PARTNER_ATTRIBUTION_ID]: partnerAttributionID || "",
        [HEADERS.PREFER]: PREFER.REPRESENTATION,
      },
      metricDimensions: {
        lsatUpgradeCalled: true,
        lsatUpgradeError: false,
        lsatUpgradeIgnoreCache: true
      },
    });
  });

  test("invoke patchOrder from onApprove patch action if treatment is not present", async () => {
    // $FlowFixMe
    const buildXApproveOrderActionsResult = buildXApproveOrderActions({
      ...commonOptions,
      intent: "capture",
    });
    const { order } = buildXApproveOrderActionsResult;

    await order.patch();

    // check CreateUpgradedLowScopeAccessToken not be called
    expect(callGraphQL).not.toHaveBeenCalled();
    // check patchOrder v2 order api call
    expect(callRestAPI).toHaveBeenCalledWith({
      accessToken: "A21_A.AA",
      method: "PATCH",
      eventName: "v2_checkout_orders_patch",
      url: `${ORDERS_API_URL}/${orderID}`,
      data: {},
      headers: {
        [HEADERS.PARTNER_ATTRIBUTION_ID]: partnerAttributionID || "",
        [HEADERS.PREFER]: PREFER.REPRESENTATION,
      },
      metricDimensions: {
        lsatUpgradeCalled: true,
        lsatUpgradeError: false,
        lsatUpgradeIgnoreCache: true
      },
  });
  });
});
