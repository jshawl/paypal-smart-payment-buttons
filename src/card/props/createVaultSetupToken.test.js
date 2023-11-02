/* @flow */
import { describe, expect, test, vi } from "vitest";

import { getCreateVaultSetupToken } from "./createVaultSetupToken";

describe("decorate createVaultSetupToken", () => {
  test("should return undefined if createVaultSetupToken isn't passed", () => {
    const createVaultSetupToken = undefined;

    const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
      createVaultSetupToken,
    });

    expect(decoratedCreateVaultSetupToken).toEqual(undefined);
  });

  test("should memoize return value", async () => {
    const createVaultSetupToken = vi
      .fn()
      .mockResolvedValue(Math.random().toString());

    const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
      createVaultSetupToken,
    });

    // $FlowIssue
    const firstValue = await decoratedCreateVaultSetupToken();
    // $FlowIssue
    const secondValue = await decoratedCreateVaultSetupToken();

    expect(typeof firstValue).toEqual("string");
    // $FlowIssue Zalgo doesn't work with await types
    expect(firstValue.length).toBeGreaterThan(0);

    expect(firstValue).toEqual(secondValue);
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
    });

    // $FlowIssue
    expect(decoratedCreateVaultSetupToken()).rejects.toThrowError(
      "Expected a vault setup token to be returned from createVaultSetupToken",
    );
  });

  test("should succeed with setupToken", () => {
    const createVaultSetupToken = vi
      .fn()
      .mockResolvedValue("vault_setup_token");
    const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
      createVaultSetupToken,
    });

    // $FlowIssue
    expect(decoratedCreateVaultSetupToken()).resolves.toEqual(
      "vault_setup_token",
    );
  });
});
