/* @flow */
import { describe, expect, test, vi } from "vitest";
import { FUNDING, FPTI_KEY } from "@paypal/sdk-constants/src";

import { FPTI_STATE, FPTI_CONTEXT_TYPE } from "../constants";
import { getLogger } from "../lib/logger";

import { getCreateVaultSetupToken } from "./createVaultSetupToken";

vi.mock(`@krakenjs/belter/src`, async () => {
  const originalLib = await vi.importActual("@krakenjs/belter/src");
  return {
    ...originalLib,
    memoize: vi.fn((value) => value),
  };
});

vi.mock("../lib/logger", async () => {
  const actual = await vi.importActual("../lib/logger");
  return {
    ...actual,
    getLogger: vi.fn(() => {
      return {
        addTrackingBuilder: vi.fn().mockReturnThis(),
        error: vi.fn().mockReturnThis(),
        track: vi.fn().mockReturnThis(),
        flush: vi.fn().mockReturnThis(),
      };
    }),
  };
});

const defaultFundingSource = FUNDING.PAYPAL;

describe("decorate createVaultSetupToken", () => {
  test("should fail if createVaultSetupToken does not return a setupToken", async () => {
    const createVaultSetupToken = vi.fn().mockResolvedValue(undefined);
    const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
      createVaultSetupToken,
      paymentSource: defaultFundingSource,
    });

    await expect(decoratedCreateVaultSetupToken()).rejects.toThrowError(
      "Expected a vault setup token to be returned from createVaultSetupToken"
    );
  });

  test.each([
    ["number", 1234],
    ["object", { token: "token" }],
    ["array", ["token"]],
    ["boolean", true],
    ["null", null],
  ])(
    "should fail if createVaultSetupToken returns a %s and send failure analytics",
    async (_, returnValue) => {
      const trackMock = vi.fn().mockReturnThis();
      // $FlowFixMe
      getLogger.mockImplementation(() => {
        return {
          addTrackingBuilder: vi.fn().mockReturnThis(),
          error: vi.fn().mockReturnThis(),
          flush: vi.fn().mockReturnThis(),
          track: trackMock,
        };
      });

      const expectedTrackPayload = {
        [FPTI_KEY.STATE]: FPTI_STATE.BUTTON,
        [FPTI_KEY.ERROR_CODE]: "smart_buttons_create_vault_setup_token",
        [FPTI_KEY.ERROR_DESC]: expect.any(String),
      };

      const createVaultSetupToken = vi.fn().mockResolvedValue(returnValue);
      const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
        createVaultSetupToken,
        paymentSource: defaultFundingSource,
      });

      await expect(decoratedCreateVaultSetupToken()).rejects.toThrowError(
        "Expected a vault setup token to be returned from createVaultSetupToken"
      );

      expect(trackMock).toBeCalledWith(expectedTrackPayload);
    }
  );

  test("should succeed with setupToken and send success analytics", async () => {
    const mockSetupToken = "vault_setup_token";
    const trackingBuilderMock = vi.fn().mockReturnThis();
    // $FlowFixMe
    getLogger.mockImplementation(() => {
      return {
        track: vi.fn().mockReturnThis(),
        addTrackingBuilder: trackingBuilderMock,
        flush: vi.fn().mockReturnThis(),
      };
    });
    const createVaultSetupToken = vi.fn().mockResolvedValue(mockSetupToken);
    const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
      createVaultSetupToken,
      paymentSource: defaultFundingSource,
    });

    const result = await decoratedCreateVaultSetupToken();
    expect(result).toEqual(mockSetupToken);

    expect(trackingBuilderMock).toBeCalledWith(expect.any(Function));

    const trackingCallback = trackingBuilderMock.mock.calls[0][0];
    const trackingResult = trackingCallback();
    expect(trackingResult).toEqual({
      [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.VAULT_SETUP_TOKEN,
      [FPTI_KEY.CONTEXT_ID]: mockSetupToken,
    });
  });

  test("should log analytics if create setup token fails and rethrow error", async () => {
    const mockError = "some error...thing failed";
    const errorMock = vi.fn().mockReturnThis();
    const trackMock = vi.fn().mockReturnThis();
    // $FlowFixMe
    getLogger.mockImplementation(() => {
      return {
        track: trackMock,
        addTrackingBuilder: vi.fn().mockReturnThis(),
        flush: vi.fn().mockReturnThis(),
        error: errorMock,
      };
    });

    const createVaultSetupToken = vi.fn().mockRejectedValue(mockError);
    const decoratedCreateVaultSetupToken = getCreateVaultSetupToken({
      createVaultSetupToken,
      paymentSource: defaultFundingSource,
    });

    await expect(decoratedCreateVaultSetupToken()).rejects.toThrow(mockError);
    expect(errorMock).toBeCalledWith("create_vault_setup_token_error", {
      err: expect.any(String),
    });
    expect(trackMock).toBeCalledWith({
      [FPTI_KEY.STATE]: FPTI_STATE.BUTTON,
      [FPTI_KEY.ERROR_CODE]: "smart_buttons_create_vault_setup_token_error",
      [FPTI_KEY.ERROR_DESC]: expect.any(String),
    });
  });
});
