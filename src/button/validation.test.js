/* @flow */
import { describe, test, expect, vi } from "vitest";
import { INTENT, CURRENCY, ENV } from "@paypal/sdk-constants/src";

import { getSupplementalOrderInfo } from "../api";

import { validateOrder } from "./validation";

const logger = {
  warn: vi.fn(() => logger),
  track: vi.fn(() => logger),
  flush: vi.fn(),
};

vi.mock("../api");
vi.mock("../lib/logger", () => ({
  getLogger: vi.fn(() => logger),
}));

describe("validate order", () => {
  describe("vault without purchase", () => {
    test("should validate order", async () => {
      window.xprops = {
        createVaultSetupToken: vi.fn(),
      };

      // $FlowIssue vi mock
      getSupplementalOrderInfo.mockResolvedValue({
        checkoutSession: {
          cart: {
            intent: INTENT.CAPTURE.toUpperCase(),
            billingType: "billing",
          },
          payees: [
            {
              merchantId: "test-merchant-id",
              email: {
                stringValue: "merchant@example.com",
              },
            },
          ],
        },
      });

      await validateOrder("test-order-id", {
        env: ENV.PRODUCTION,
        merchantID: ["test-merchant-id"],
        currency: CURRENCY.USD,
        intent: INTENT.CAPTURE,
        vault: false,
        buttonLabel: "Save",
        featureFlags: {},
      });

      expect(logger.warn).not.toBeCalled();
    });

    test("should error if vault=true", async () => {
      window.xprops = {
        createVaultSetupToken: vi.fn(),
      };

      // $FlowIssue vi mock
      getSupplementalOrderInfo.mockResolvedValue({
        checkoutSession: {
          cart: {
            intent: INTENT.CAPTURE.toUpperCase(),
          },
          payees: [
            {
              merchantId: "test-merchant-id",
              email: {
                stringValue: "merchant@example.com",
              },
            },
          ],
        },
      });

      await validateOrder("test-order-id", {
        env: ENV.PRODUCTION,
        merchantID: ["test-merchant-id"],
        currency: CURRENCY.USD,
        intent: INTENT.CAPTURE,
        vault: true,
        buttonLabel: "Save",
        featureFlags: {},
      });

      expect(logger.warn).toBeCalledWith(
        "smart_button_validation_error_vault_passed_with_create_vault_setup_token",
        expect.any(Object)
      );
    });
  });
});
