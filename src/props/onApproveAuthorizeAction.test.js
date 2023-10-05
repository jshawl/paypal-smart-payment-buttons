/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { callGraphQL } from "../api/api";
import { authorizeOrder } from "../api/order";

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
    authorizeOrder: vi.fn(() => ZalgoPromise.resolve()),
  };
});

const commonOptions = {
  intent: "authorize",
  orderID: "EC-abc123",
  paymentID: "abc123",
  payerID: "",
  restart,
  facilitatorAccessToken: "A21_A.AA",
  buyerAccessToken: "S23_A.AA",
  partnerAttributionID: "",
  forceRestAPI: true,
  onError: () => ZalgoPromise.try(() => undefined),
  experiments: {
    btSdkOrdersV2Migration: true,
    upgradeLSATWithIgnoreCache: false,
  },
};

describe("getOnApproveOrder authorize action", () => {
  test("invoke callGraphQL from onApprove authorize action if treatment is present", async () => {
    const buildXApproveOrderActionsResult = buildXApproveOrderActions({
      ...commonOptions,
      experiments: { upgradeLSATWithIgnoreCache: true },
    });
    const { order } = buildXApproveOrderActionsResult;

    await order.authorize();

    expect(callGraphQL).toHaveBeenCalled();
  });

  test("invoke authorizeOrder from onApprove authorize action if treatment is not present", async () => {
    const buildXApproveOrderActionsResult = buildXApproveOrderActions({
      ...commonOptions,
      intent: "authorize",
    });
    const { order } = buildXApproveOrderActionsResult;

    await order.authorize();

    expect(callGraphQL).not.toHaveBeenCalled();
    expect(authorizeOrder).toHaveBeenCalled();
  });
});
