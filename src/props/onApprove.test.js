/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

const sendMetricSpy = vi.fn();

vi.mock("../lib", async () => {
  const actual = await vi.importActual("../lib");
  return {
    ...actual,
    sendMetric: sendMetricSpy,
  };
});

vi.mock("../api", async () => {
  const actual = await vi.importActual("../lib");
  return {
    ...actual,
    getSupplementalOrderInfo: () => ZalgoPromise.try(vi.fn()),
  };
});

// eslint-disable-next-line import/first
import { getOnApprove } from "./onApprove";

describe("onApprove", () => {
  describe("tracking button click success count", () => {
    test("is invoked before onApprove for the checkout flow", () => {
      const onApprove = getOnApprove({
        branded: false,
        clientAccessToken: "",
        clientID: "",
        createBillingAgreement: vi.fn(),
        createSubscription: vi.fn(),
        createOrder: () => ZalgoPromise.try(() => ""),
        createVaultSetupToken: vi.fn(),
        experiments: {
          useShippingChangeCallbackMutation: true,
        },
        facilitatorAccessToken: "",
        featureFlags: { isLsatUpgradable: true },
        flow: "checkout",
        intent: "capture",
        onApprove: () => ZalgoPromise.try(vi.fn()),
        onError: vi.fn(),
        partnerAttributionID: "",
        paymentSource: "paypal",
        vault: false,
      });
      onApprove(
        {
          payerID: "",
        },
        { restart: vi.fn() }
      );
      expect(sendMetricSpy).toHaveBeenCalledWith({
        dimensions: {
          spbPaymentFlow: "checkout",
          useShippingChangeCallbackMutation: true,
        },
        name: "pp.app.paypal_sdk.buttons.click.success.count",
      });
    });
  });
});
