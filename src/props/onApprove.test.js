/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

const sendMetricSpy = vi.fn();
const merchantOnApprove = vi
  .fn()
  .mockImplementation(() => ZalgoPromise.try(vi.fn()));
const restart = () => ZalgoPromise.try(vi.fn());

vi.mock("../lib", async () => {
  const actual = await vi.importActual("../lib");
  return {
    ...actual,
    sendMetric: sendMetricSpy,
  };
});

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return {
    ...actual,
    getSupplementalOrderInfo: () => ZalgoPromise.try(vi.fn()),
  };
});

// eslint-disable-next-line import/first
import { getOnApprove, getOnApproveOrder } from "./onApprove";

const orderID = "EC-abc123";

const commonOptions = {
  branded: false,
  clientAccessToken: "",
  createOrder: () => ZalgoPromise.try(() => orderID),
  experiments: {
    useShippingChangeCallbackMutation: true,
  },
  intent: "capture",
  facilitatorAccessToken: "",
  featureFlags: { isLsatUpgradable: true },
  onApprove: merchantOnApprove,
  onError: () => ZalgoPromise.try(() => undefined),
  partnerAttributionID: "",
  paymentSource: "paypal",
  vault: false,
};

const getOnApproveOptions = {
  ...commonOptions,
  clientID: "",
  createBillingAgreement: vi.fn(),
  createSubscription: vi.fn(),
  createVaultSetupToken: vi.fn(),
  flow: "checkout",
};

describe("onApprove", () => {
  describe("tracking button click success count", () => {
    test("is invoked before onApprove for the checkout flow", () => {
      const onApprove = getOnApprove(getOnApproveOptions);
      onApprove({ payerID: "" }, { restart });
      expect(sendMetricSpy).toHaveBeenCalledWith({
        dimensions: {
          spbPaymentFlow: "checkout",
          useShippingChangeCallbackMutation: true,
        },
        name: "pp.app.paypal_sdk.buttons.click.success.count",
      });
    });
  });

  describe("getOnApproveOrder()", () => {
    const getOnApproveOrderOptions = {
      ...commonOptions,
      beforeOnApprove: vi.fn(),
    };
    test("invokes the merchant's onApprove call with an undefined paymentID", async () => {
      const getOnApproveOrderResult = getOnApproveOrder(
        getOnApproveOrderOptions
      );
      await getOnApproveOrderResult({}, { restart });
      expect(merchantOnApprove).toHaveBeenCalledWith(
        expect.objectContaining({
          orderID,
          paymentID: undefined,
        }),
        expect.anything()
      );
    });

    test("invokes the merchant's onApprove call with a paymentID aliased to orderID", async () => {
      const getOnApproveOrderResult = getOnApproveOrder({
        ...getOnApproveOrderOptions,
        experiments: {
          btSdkOrdersV2Migration: true,
        },
      });
      await getOnApproveOrderResult({}, { restart });
      expect(merchantOnApprove).toHaveBeenCalledWith(
        expect.objectContaining({
          orderID,
          paymentID: "abc123",
        }),
        expect.anything()
      );
    });
  });
});
