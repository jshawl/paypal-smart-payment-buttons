/* @flow */
/* eslint import/no-namespace: off */
/* eslint no-empty-function: off */
import { describe, beforeEach, afterEach, test, expect, vi } from "vitest";

import { getCardProps } from "./props";
import { SUBMIT_ERRORS } from "./constants";

const vaultMock = {
  createVaultSetupToken: vi.fn(),
  onApprove: vi.fn(),
};

describe("getCardProps", () => {
  const inputs = {
    facilitatorAccessToken: "some-facilitator-access-token",
    featureFlags: {},
  };

  beforeEach(() => {
    window.xprops = {};
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("throws an error when neither createOrder or createVaultSetupToken is present", () => {
    window.xprops = { intent: "capture" };
    // $FlowIssue
    window.xprops.createOrder = undefined;
    // $FlowIssue
    window.xprops.createVaultSetupToken = undefined;
    expect(() => getCardProps(inputs)).toThrowError(
      SUBMIT_ERRORS.MISSING_BOTH_FUNCTIONS
    );
  });

  describe("standalone vault: createVaultToken", () => {
    test("should throw error without on approve", () => {
      window.xprops = {
        createVaultSetupToken: vi.fn(),
      };

      expect(() => getCardProps(inputs)).toThrowError(
        SUBMIT_ERRORS.MISSING_ONAPPROVE
      );
    });

    test.each([
      ["createOrder", () => {}, "Do not pass createOrder with an action."],
    ])("errors when %s and an action are provided", (prop, propValue) => {
      window.xprops = {
        ...vaultMock,
        [prop]: propValue,
      };

      expect(() => getCardProps(inputs)).toThrow(
        SUBMIT_ERRORS.PASSING_BOTH_FUNCTIONS
      );
    });

    test("should return props with all required methods", () => {
      window.xprops = {
        ...vaultMock,
      };

      expect(getCardProps(inputs)).toEqual(
        expect.objectContaining({
          createVaultSetupToken: expect.any(Function),
          onApprove: expect.any(Function),
        })
      );
    });
  });
});
