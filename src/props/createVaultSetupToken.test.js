/* @flow */
import { describe, expect, test, vi } from "vitest";
import { FUNDING } from "@paypal/sdk-constants/src";

import { getCreateVaultSetupToken } from "./createVaultSetupToken";

vi.mock(`@krakenjs/belter/src`, () => ({
  memoize: vi.fn((value) => value),
}));

const defaultFundingSource = FUNDING.PAYPAL;

describe("decorate createVaultSetupToken", () => {
  test("should fail if createVaultSetupToken does not return a setupToken", () => {
    const createVaultSetupToken = vi.fn().mockResolvedValue(undefined);
    const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
      createVaultSetupToken,
      paymentSource: defaultFundingSource,
    });

    expect(decoratedCreateVaultSetupToken()).rejects.toThrowError(
      "Expected a vault setup token to be returned from createVaultSetupToken"
    );
  });

  test.each([
    ["number", 1234],
    ["object", { token: "token" }],
    ["array", ["token"]],
    ["boolean", true],
    ["null", null],
  ])("should fail if createVaultSetupToken returns a %s", (_, returnValue) => {
    const createVaultSetupToken = vi.fn().mockResolvedValue(returnValue);
    const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
      createVaultSetupToken,
      paymentSource: defaultFundingSource,
    });

    expect(decoratedCreateVaultSetupToken()).rejects.toThrowError(
      "Expected a vault setup token to be returned from createVaultSetupToken"
    );
  });

  test("should succeed with setupToken", () => {
    const createVaultSetupToken = vi
      .fn()
      .mockResolvedValue("vault_setup_token");
    const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
      createVaultSetupToken,
      paymentSource: defaultFundingSource,
    });

    expect(decoratedCreateVaultSetupToken()).resolves.toEqual(
      "vault_setup_token"
    );
  });
});
