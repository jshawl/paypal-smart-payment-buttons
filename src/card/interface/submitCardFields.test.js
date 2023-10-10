/* @flow */
import { describe, test, expect, afterEach, vi } from "vitest";
import { INTENT } from "@paypal/sdk-constants";

import { getCardProps } from "../props";
import { confirmOrderAPI } from "../../api";
import { PAYMENT_FLOWS } from "../../constants";
import { hcfTransactionSuccess, hcfTransactionError } from "../logger";
import { SUBMIT_ERRORS } from "../constants";
import { handleThreeDomainSecureContingency } from "../../lib/3ds";
import { getLogger } from "../../lib/logger";

import { savePaymentSource } from "./vault-without-purchase";
import { resetGQLErrors } from "./gql";

import { hasCardFields, submitCardFields } from ".";

const mockThreeDomainSecure = {};
vi.mock("../props", () => {
  return {
    getCardProps: vi.fn(() => ({})),
    getComponents: vi.fn(() => ({ ThreeDomainSecure: mockThreeDomainSecure })),
  };
});

vi.mock("../../lib/3ds");

vi.mock("../logger");
vi.mock("../../lib/logger", async () => {
  const actual = await vi.importActual("../../lib/logger");
  return {
    ...actual,
    getLogger: vi.fn(() => {
      return {
        info: vi.fn().mockReturnThis(),
      };
    }),
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

vi.mock("../../lib/3ds", () => ({
  handleThreeDomainSecureContingency: vi.fn(),
}));

vi.mock("../../lib");
vi.mock("../../api", () => ({
  // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
  confirmOrderAPI: vi.fn(() => Promise.resolve({ id: "test-order-id" })),
}));

describe("submitCardFields", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultOptions = {
    facilitatorAccessToken: "test-access-token",
    extraFields: {},
    featureFlags: {},
    experiments: {
      hostedCardFields: true,
      useIDToken: false,
    },
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
      onApprove,
      createVaultSetupToken,
      onError: vi.fn(),
      getParent: vi.fn(),
      ThreeDomainSecure: {},
      clientID: "client-id",
    };
    // $FlowIssue
    getCardProps.mockReturnValue({
      ...mockGetCardPropsReturn,
      productAction: PAYMENT_FLOWS.VAULT_WITHOUT_PURCHASE,
    });

    await submitCardFields(defaultOptions);

    expect.assertions(2);
    expect(resetGQLErrors).toHaveBeenCalledOnce();
    expect(savePaymentSource).toHaveBeenCalledWith({
      ...mockGetCardPropsReturn,
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
      productAction: PAYMENT_FLOWS.WITH_PURCHASE,
    };

    // $FlowIssue
    getCardProps.mockReturnValue(mockGetCardPropsReturn);

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
        experiments: {},
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
      productAction: PAYMENT_FLOWS.WITH_PURCHASE,
    };

    // $FlowIssue
    getCardProps.mockReturnValue(mockGetCardPropsReturn);
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
      productAction: PAYMENT_FLOWS.WITH_PURCHASE,
    };
    // $FlowIssue
    getCardProps.mockReturnValue(mockGetCardPropsReturn);
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
    const expectedError = "create order failure test";
    const error = new Error(expectedError);

    const mockGetCardPropsReturn = {
      createOrder: vi.fn().mockRejectedValue(error),
      onError: vi.fn(),
      productAction: PAYMENT_FLOWS.WITH_PURCHASE,
    };

    // $FlowIssue
    getCardProps.mockReturnValue(mockGetCardPropsReturn);
    await expect(submitCardFields(defaultOptions)).rejects.toThrow(
      expectedError
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

  describe("handlePurchaseFlow()", () => {
    test("uses id token for the bearer token if experiment is enabled", async () => {
      const mockOrderId = "12345";
      const mockIdToken = "13orqiehfknwjs";
      const options = {
        ...defaultOptions,
        experiments: {
          hostedCardFields: true,
          useIDToken: true,
        },
      };
      const mockCardProps = {
        // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
        createOrder: vi.fn(() => Promise.resolve(mockOrderId)),
        // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
        onApprove: vi.fn(() => Promise.resolve()),
        // eslint-disable-next-line no-empty-function
        getParent: () => {},
        productAction: PAYMENT_FLOWS.WITH_PURCHASE,
        userIDToken: mockIdToken,
      };
      // $FlowIssue
      getCardProps.mockReturnValue(mockCardProps);

      await submitCardFields(options);

      expect(confirmOrderAPI).toBeCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({ facilitatorAccessToken: mockIdToken })
      );
    });

    test("uses id token for the bearer token if experiment is enabled && userIDToken is present", async () => {
      const mockOrderId = "12345";
      const options = {
        ...defaultOptions,
        experiments: {
          hostedCardFields: true,
          useIDToken: true,
        },
      };
      const mockCardProps = {
        // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
        createOrder: vi.fn(() => Promise.resolve(mockOrderId)),
        // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
        onApprove: vi.fn(() => Promise.resolve()),
        // eslint-disable-next-line no-empty-function
        getParent: () => {},
        productAction: PAYMENT_FLOWS.WITH_PURCHASE,
      };
      const infoMock = vi.fn().mockReturnThis();
      // $FlowIssue
      getLogger.mockReturnValue({ info: infoMock });
      // $FlowIssue
      getCardProps.mockReturnValue(mockCardProps);

      await submitCardFields(options);

      expect(confirmOrderAPI).toBeCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object)
      );
      expect(infoMock).toHaveBeenCalledWith("hcf_userIDToken_present_false");
    });

    test("should handle 3DS contingency for vault with purchase", async () => {
      const mockOrderId = "12345";
      const mock3dsResponse = { liability_shift: "some-value" };
      // $FlowIssue
      handleThreeDomainSecureContingency.mockResolvedValue(
        // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
        Promise.resolve(mock3dsResponse)
      );
      const inputOpts = {
        facilitatorAccessToken: "test-access-token",
        extraFields: {},
        featureFlags: {},
        experiments: {
          hostedCardFields: true,
          useIDToken: false,
        },
      };
      const mockCardProps = {
        // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
        createOrder: vi.fn(() => Promise.resolve(mockOrderId)),
        // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
        onApprove: vi.fn(() => Promise.resolve()),
        // eslint-disable-next-line no-empty-function
        getParent: () => {},
        productAction: PAYMENT_FLOWS.WITH_PURCHASE,
      };
      // $FlowIssue
      getCardProps.mockReturnValue(mockCardProps);
      const mockConfirmOrderReturn = {
        status: "A_STATUS",
        links: [{}],
      };
      // $FlowIssue
      confirmOrderAPI.mockResolvedValue(mockConfirmOrderReturn);
      await submitCardFields(inputOpts);

      expect(handleThreeDomainSecureContingency).toHaveBeenCalledWith({
        status: mockConfirmOrderReturn.status,
        links: mockConfirmOrderReturn.links,
        ThreeDomainSecure: mockThreeDomainSecure,
        createOrder: mockCardProps.createOrder,
        getParent: mockCardProps.getParent,
      });
      expect(mockCardProps.onApprove).toBeCalledWith(
        {
          liabilityShift: mock3dsResponse.liability_shift,
          orderID: mockOrderId,
        },
        {}
      );
    });
  });
});
