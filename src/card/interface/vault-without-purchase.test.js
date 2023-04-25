/* @flow */
import { describe, afterEach, vi, test, expect, beforeEach } from "vitest";

import { updateVaultSetupToken } from "../../api/vault";
import {
  vaultWithoutPurchaseSuccess,
  vaultWithoutPurchaseFailure,
} from "../logger";

import { savePaymentSource } from "./vault-without-purchase";

vi.mock("../logger");

vi.mock("../../../src/api/vault");

describe("savePaymentSource", () => {
  beforeEach(() => {
    // $FlowIssue
    updateVaultSetupToken.mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultVaultSetupToken = "vault-setup-token";

  // $FlowIssue
  const defaultSave = (options = {}): Object => ({
    createVaultSetupToken: vi.fn().mockResolvedValue(defaultVaultSetupToken),
    onApprove: vi.fn(),
    ...options,
  });

  const defaultOptions = {
    ...defaultSave(),
    clientID: "client-id",
    paymentSource: {
      card: {
        expiry: "01/24",
        name: "John Doe",
        number: "4111111111111111",
        securityCode: "123",
      },
    },
    onError: vi.fn(),
  };

  test("should handle failure from merchant-supplied createVaultSetupToken", async () => {
    const createVaultSetupTokenError = new Error(
      "error with create vault setup token"
    );
    const rejectCreateVaultSetupToken = vi
      .fn()
      .mockRejectedValue(createVaultSetupTokenError);

    expect.assertions(4);
    await expect(
      savePaymentSource({
        ...defaultOptions,
        ...defaultSave({ createVaultSetupToken: rejectCreateVaultSetupToken }),
      })
    ).rejects.toThrow(createVaultSetupTokenError);
    expect(vaultWithoutPurchaseSuccess).not.toHaveBeenCalled();
    expect(vaultWithoutPurchaseFailure).toHaveBeenCalledWith({
      error: createVaultSetupTokenError,
    });
    expect(defaultOptions.onError).toBeCalledWith(createVaultSetupTokenError);
  });

  test("should handle failure from performing POST on a setup vault token", async () => {
    const updateVaultSetupTokenError = new Error(
      "error with update vault setup token"
    );

    // $FlowIssue
    updateVaultSetupToken.mockRejectedValue(updateVaultSetupTokenError);

    expect.assertions(4);
    await expect(savePaymentSource(defaultOptions)).rejects.toBe(
      updateVaultSetupTokenError
    );
    expect(vaultWithoutPurchaseSuccess).not.toHaveBeenCalled();
    expect(vaultWithoutPurchaseFailure).toHaveBeenCalledWith({
      error: updateVaultSetupTokenError,
      vaultToken: defaultVaultSetupToken,
    });
    expect(defaultOptions.onError).toBeCalledWith(updateVaultSetupTokenError);
  });

  test("should handle failure from merchant-supplied onApprove", async () => {
    const onApproveError = new Error("error with on approve");
    const rejectOnApprove = vi.fn().mockRejectedValue(onApproveError);

    expect.assertions(4);
    await expect(
      savePaymentSource({
        ...defaultOptions,
        ...defaultSave({ onApprove: rejectOnApprove }),
      })
    ).rejects.toThrow(onApproveError);
    expect(vaultWithoutPurchaseSuccess).not.toHaveBeenCalled();
    expect(vaultWithoutPurchaseFailure).toHaveBeenCalledWith({
      error: onApproveError,
      vaultToken: defaultVaultSetupToken,
    });
    expect(defaultOptions.onError).toBeCalledWith(onApproveError);
  });

  test("should handle successful vault without purchase", async () => {
    await savePaymentSource(defaultOptions);

    expect.assertions(4);
    expect(defaultOptions.createVaultSetupToken).toHaveBeenCalled();
    expect(updateVaultSetupToken).toHaveBeenCalledWith({
      vaultSetupToken: "vault-setup-token",
      clientID: "client-id",
      paymentSource: {
        card: {
          expiry: "01/24",
          name: "John Doe",
          number: "4111111111111111",
          securityCode: "123",
        },
      },
    });
    expect(defaultOptions.onApprove).toHaveBeenCalledWith({
      vaultSetupToken: "vault-setup-token",
    });
    expect(vaultWithoutPurchaseSuccess).toHaveBeenCalledWith({
      vaultToken: defaultVaultSetupToken,
    });
  });
});
