/* @flow */
import { vi, describe, test, expect } from "vitest";
import { INTENT, FUNDING } from "@paypal/sdk-constants/src";

import { getCallbackProps } from "./callbackProps";

// something in callbackProps is making an api request
vi.mock("../api");

describe("callbackProps", () => {
  test("should return list of legacy props", () => {
    const expectedProps = {
      createBillingAgreement: expect.any(Function),
      createSubscription: expect.any(Function),
      createOrder: expect.any(Function),
      onApprove: expect.any(Function),
      onComplete: expect.any(Function),
      onCancel: expect.any(Function),
      onShippingChange: expect.any(Function),
      onShippingAddressChange: expect.any(Function),
      onShippingOptionsChange: expect.any(Function),
      onAuth: expect.any(Function),
    };
    const inputs = {
      paymentSource: FUNDING.CARD,
      partnerAttributionID: "a-partner-attribution-id",
      merchantID: ["totes-a-merchant-id"],
      clientID: "client-id-is-me",
      facilitatorAccessToken: "facilitator-access-token",
      currency: "USD",
      enableOrdersApprovalSmartWallet: false, // uhh is this correct?
      smartWalletOrderID: "some-smart-wallet-id",
      intent: INTENT.CAPTURE,
      branded: false,
      vault: false,
      clientAccessToken: "some access token",
      featureFlags: {},
      experiments: {},
      createBillingAgreement: vi.fn(),
      createSubscription: vi.fn(),
      createOrder: vi.fn(),
      onError: vi.fn(),
      onApprove: vi.fn(),
      onComplete: vi.fn(),
      onCancel: vi.fn(),
      onShippingChange: vi.fn(),
      onShippingAddressChange: vi.fn(),
      onShippingOptionsChange: vi.fn(),
      createVaultSetupToken: vi.fn(),
      flow: null,
    };

    const result = getCallbackProps(inputs);
    expect(result).toEqual(expectedProps);
  });
});
