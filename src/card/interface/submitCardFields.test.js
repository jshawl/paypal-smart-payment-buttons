/* @flow */
import { describe, test, expect, beforeEach, vi } from "vitest";
import { INTENT } from "@paypal/sdk-constants";

import { getCardProps } from "../props";
import { confirmOrderAPI } from "../../api";
import { hcfTransactionSuccess, hcfTransactionError } from "../logger";
import { SUBMIT_ERRORS } from "../constants";

import { savePaymentSource } from "./vault-without-purchase";
import { resetGQLErrors } from "./gql";

import { hasCardFields, submitCardFields } from ".";

vi.mock("../props", () => {
  return {
    getCardProps: vi.fn(() => ({})),
  };
});

vi.mock("./hasCardFields", () => {
  return {
    hasCardFields: vi.fn(() => true),
  };
});

const mockGetCardFieldsReturn = {
  name: "John Doe",
  number: "4111111111111111",
  cvv: "123",
  expiry: "01/24",
  postalCode: "91210",
};

vi.mock("../logger");
vi.mock("./getCardFields", () => {
  return {
    getCardFields: vi.fn(() => mockGetCardFieldsReturn),
  };
});

vi.mock("./gql", () => ({
  resetGQLErrors: vi.fn(),
}));

vi.mock("./vault-without-purchase", () => ({
  savePaymentSource: vi.fn(),
}));

vi.mock("../../lib");
vi.mock("../../api", () => ({
  // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
  confirmOrderAPI: vi.fn(() => Promise.resolve({ id: "test-order-id" })),
}));

describe("submitCardFields", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const defaultOptions = {
    facilitatorAccessToken: "test-access-token",
    extraFields: {},
    featureFlags: {},
  };

  test("should throw an error if we do not have card fields", () => {
    // $FlowIssue
    hasCardFields.mockReturnValue(false);

    expect.assertions(1);

    expect(submitCardFields(defaultOptions)).rejects.toThrowError(
      SUBMIT_ERRORS.UNABLE_TO_SUBMIT
    );
  });

  test("should do a vault without purchase", async () => {
    const createVaultSetupToken = vi.fn().mockResolvedValue("setup-token");
    const onApprove = vi.fn();

    const mockGetCardPropsReturn = {
      clientID: "client-id",
      onApprove,
      createVaultSetupToken,
    };
    // $FlowIssue
    getCardProps.mockReturnValueOnce(mockGetCardPropsReturn);

    await submitCardFields(defaultOptions);

    expect.assertions(2);
    expect(resetGQLErrors).toHaveBeenCalledOnce();
    expect(savePaymentSource).toHaveBeenCalledWith({
      ...mockGetCardPropsReturn,
      idToken: "",
      paymentSource: {
        card: {
          billingAddress: {
            postalCode: "91210",
          },
          expiry: "2024-01",
          name: "John Doe",
          number: "4111111111111111",
          securityCode: "123",
        },
      },
    });
  });

  test("should checkout", async () => {
    const mockGetCardPropsReturn = {
      createOrder: vi.fn().mockResolvedValue("test-order-id"),
      onApprove: vi.fn(),
    };

    // $FlowIssue
    getCardProps.mockReturnValueOnce(mockGetCardPropsReturn);

    expect.assertions(4);
    await submitCardFields(defaultOptions);
    expect(mockGetCardPropsReturn.createOrder).toHaveBeenCalled();
    expect(confirmOrderAPI).toHaveBeenCalledWith(
      "test-order-id",
      {
        payment_source: {
          card: {
            expiry: "2024-01",
            billing_address: {
              postal_code: "91210",
            },
            name: "John Doe",
            number: "4111111111111111",
            security_code: "123",
          },
        },
      },
      {
        facilitatorAccessToken: "test-access-token",
        partnerAttributionID: "",
      }
    );
    expect(mockGetCardPropsReturn.onApprove).toHaveBeenCalledWith(
      {
        orderID: "test-order-id",
      },
      {}
    );
    expect(hcfTransactionSuccess).toHaveBeenCalledWith({
      orderID: "test-order-id",
    });
  });

  test("should catch error from merchant-supplied onApprove", async () => {
    const onApproveError = new Error("error with on approve");
    const mockGetCardPropsReturn = {
      createOrder: vi.fn().mockResolvedValue("test-order-id"),
      onApprove: vi.fn().mockRejectedValue(onApproveError),
      onError: vi.fn(),
    };

    // $FlowIssue
    getCardProps.mockReturnValueOnce(mockGetCardPropsReturn);
    await expect(submitCardFields(defaultOptions)).rejects.toThrow(
      "error with on approve"
    );
    expect(mockGetCardPropsReturn.createOrder).toHaveBeenCalled();
    expect(mockGetCardPropsReturn.onApprove).toHaveBeenCalled();
    expect.assertions(6);
    expect(hcfTransactionSuccess).not.toHaveBeenCalled();
    expect(hcfTransactionError).toHaveBeenCalledWith({
      error: onApproveError,
      orderID: "test-order-id",
    });
    expect(mockGetCardPropsReturn.onError).toHaveBeenCalledWith(onApproveError);
  });

  test("should catch any errors from confirmOrderAPI", async () => {
    const error = new Error("confirm order api failure test");
    // $FlowIssue
    confirmOrderAPI.mockImplementationOnce(() => {
      throw error;
    });
    const mockGetCardPropsReturn = {
      intent: INTENT.CAPTURE,
      createOrder: vi.fn().mockResolvedValue("test-order-id"),
      onApprove: vi.fn(),
    };
    // $FlowIssue
    getCardProps.mockReturnValueOnce(mockGetCardPropsReturn);
    await expect(submitCardFields(defaultOptions)).rejects.toThrow(
      "confirm order api failure test"
    );
    expect(mockGetCardPropsReturn.createOrder).toHaveBeenCalled();
    // $FlowIssue
    expect(hcfTransactionError).toHaveBeenCalledWith({
      error,
      orderID: "test-order-id",
    });
    expect(hcfTransactionSuccess).not.toHaveBeenCalled();
    expect.assertions(4);
  });

  test("should catch any errors from createOrder", async () => {
    const error = new Error("create order failure test");

    const mockGetCardPropsReturn = {
      createOrder: vi.fn().mockRejectedValue(error),
      onError: vi.fn(),
    };

    // $FlowIssue
    getCardProps.mockReturnValueOnce(mockGetCardPropsReturn);
    await expect(submitCardFields(defaultOptions)).rejects.toThrow(
      "create order failure test"
    );
    expect(mockGetCardPropsReturn.createOrder).toHaveBeenCalled();
    // $FlowIssue
    expect(hcfTransactionError).toHaveBeenCalledWith({
      error,
    });
    expect(hcfTransactionSuccess).not.toHaveBeenCalled();
    expect(mockGetCardPropsReturn.onError).toHaveBeenCalledWith(error);
    expect.assertions(5);
  });
});
