/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { callGraphQL } from "../api/api";
import { captureOrder } from "../api/order";

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
    captureOrder: vi.fn(() => ZalgoPromise.resolve()),
  };
});

const commonOptions = {
  intent: "capture",
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

describe("getOnApproveOrder capture action", () => {
  test("invoke callGraphQL from onApprove capture action if treatment is present", async () => {
    const buildXApproveOrderActionsResult = buildXApproveOrderActions({
      ...commonOptions,
      experiments: { upgradeLSATWithIgnoreCache: true },
    });
    const { order } = buildXApproveOrderActionsResult;

    await order.capture();

    expect(callGraphQL).toHaveBeenCalled();
  });

  test("invoke captureOrder from onApprove capture action if treatment is not present", async () => {
    const buildXApproveOrderActionsResult = buildXApproveOrderActions({
      ...commonOptions,
      intent: "capture",
    });
    const { order } = buildXApproveOrderActionsResult;

    await order.capture();

    expect(callGraphQL).not.toHaveBeenCalled();
    expect(captureOrder).toHaveBeenCalled();
  });
});
