/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { FPTI_KEY } from "@paypal/sdk-constants/src";

import { FPTI_TRANSITION, FPTI_CONTEXT_TYPE } from "../constants";
import { sendCountMetric } from "../lib";
import { getLogger } from "../lib/logger";

import {
  getOnApprove,
  getOnApproveOrder,
  getOnApproveVaultWithoutPurchase,
} from "./onApprove";

const merchantOnApprove = vi
  .fn()
  .mockImplementation(() => ZalgoPromise.try(vi.fn()));
const restart = () => ZalgoPromise.try(vi.fn());

vi.mock("../lib", async () => {
  const actual = await vi.importActual("../lib");
  return {
    ...actual,
    sendCountMetric: vi.fn(),
  };
});

vi.mock("../lib/logger", async () => {
  const actual = await vi.importActual("../lib/logger");
  return {
    ...actual,
    getLogger: vi.fn(() => {
      return {
        track: vi.fn().mockReturnThis(),
        flush: vi.fn().mockReturnThis(),
        info: vi.fn().mockReturnThis(),
      };
    }),
  };
});

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return {
    ...actual,
    getSupplementalOrderInfo: () => ZalgoPromise.try(vi.fn()),
  };
});

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
      expect(sendCountMetric).toHaveBeenCalledWith({
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

    test("invokes the merchant's onApprove call with an undefined paymentID when billingToken is present", async () => {
      const getOnApproveOrderResult = getOnApproveOrder({
        ...getOnApproveOrderOptions,
        experiments: {
          btSdkOrdersV2Migration: true,
        },
      });
      await getOnApproveOrderResult(
        {
          billingToken: "BA-XXXXXX",
        },
        { restart }
      );
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

    test("invoke upgradeFacilitatorAccessTokenWithIgnoreCache call if treatment is present", async () => {
      const getOnApproveOrderResult = getOnApproveOrder({
        ...getOnApproveOrderOptions,
        experiments: {
          upgradeLSATWithIgnoreCache: true,
        },
      });
      await getOnApproveOrderResult({}, { restart });
      expect(merchantOnApprove).toHaveBeenCalledWith(
        expect.objectContaining({
          facilitatorAccessToken: "",
          orderID: "EC-abc123",
          paymentSource: "paypal",
        }),
        expect.anything()
      );
    });

    test("invoke upgradeFacilitatorAccessTokenWithIgnoreCache call if treatment is not present", async () => {
      const getOnApproveOrderResult = getOnApproveOrder({
        ...getOnApproveOrderOptions,
        experiments: {
          upgradeLSATWithIgnoreCache: false,
        },
      });
      await getOnApproveOrderResult({}, { restart });
      expect(merchantOnApprove).toHaveBeenCalledWith(
        expect.objectContaining({
          facilitatorAccessToken: "",
          orderID: "EC-abc123",
          paymentSource: "paypal",
        }),
        expect.anything()
      );
    });
  });

  describe("getOnApproveVaultWithoutPurchase()", () => {
    test("should call onApprove and log success analytics", async () => {
      const trackMock = vi.fn().mockReturnThis();
      // $FlowFixMe
      getLogger.mockImplementation(() => {
        return {
          info: vi.fn().mockReturnThis(),
          flush: vi.fn().mockReturnThis(),
          track: trackMock,
        };
      });
      const mockVaultSetupToken = "23iruewfjkns";
      const mockPayerID = "u3i2rnkwjefs";
      // $FlowFixMe
      const inputArgs = {
        onApprove: vi.fn().mockResolvedValue(),
        onError: vi.fn().mockResolvedValue(),
        facilitatorAccessToken: "some-access-token",
        createOrder: vi.fn().mockResolvedValue("1234ksjndf"),
        paymentSource: "paypal",
        createVaultSetupToken: vi.fn().mockResolvedValue(mockVaultSetupToken),
        beforeOnApprove: vi.fn(),
      };
      // $FlowFixMe
      const onApproveVaultWithoutPurchase =
        getOnApproveVaultWithoutPurchase(inputArgs);

      await onApproveVaultWithoutPurchase(
        { payerID: mockPayerID },
        { restart: vi.fn() }
      );
      expect(inputArgs.createOrder).toBeCalled();
      expect(inputArgs.createVaultSetupToken).toBeCalled();
      expect(inputArgs.onApprove).toBeCalled({
        payerID: mockPayerID,
        facilitatorAccessToken: inputArgs.facilitatorAccessToken,
        paymentSource: inputArgs.paymentSource,
        vaultSetupToken: mockVaultSetupToken,
      });
      expect(trackMock).toBeCalledWith({
        [FPTI_KEY.TRANSITION]: FPTI_TRANSITION.CHECKOUT_APPROVE,
        [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.VAULT_SETUP_TOKEN,
        [FPTI_KEY.TOKEN]: mockVaultSetupToken,
        [FPTI_KEY.CONTEXT_ID]: mockVaultSetupToken,
      });
    });
  });
});
