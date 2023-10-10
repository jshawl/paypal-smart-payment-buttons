/* @flow */
import { describe, test, expect, vi } from "vitest";

import { loadFraudnet } from "../../api";
import { getCardProps } from "../props";

import { setupCard } from "./page";

window.xprops = {
  createOrder: vi.fn(),
  clientMetadataID: "test-id",
  env: "local",
  xport: vi.fn(),
  locale: {
    country: "US",
    lang: "en",
  },
};

const mockSetupCardOptions = {
  cspNonce: "nonce",
  facilitatorAccessToken: "token",
  featureFlags: {},
  buyerCountry: "US",
  metadata: {
    correlationID: "ABCXYZ",
    spbVersion: "v3",
  },
  experiments: {
    hostedCardFields: true,
    useIDToken: true,
  },
};

vi.mock("../logger", () => ({
  setupCardLogger: vi.fn().mockResolvedValue(),
}));

vi.mock("../props", () => {
  return {
    getCardProps: vi.fn(() => {
      return {
        env: "local",
        clientMetadataID: "test-id",
        cspNonce: mockSetupCardOptions.cspNonce,
        xport: vi.fn(),
      };
    }),
  };
});

vi.mock("../../api", () => ({
  // $FlowIssue jest mock
  loadFraudnet: vi.fn().mockResolvedValue(),
}));

describe.skip("setupCard", () => {
  test("renders the Page component with the correct props", async () => {
    const getBodyMock = vi.fn();
    getBodyMock.mockReturnValue(document.createElement("div"));

    await setupCard(mockSetupCardOptions);

    /* Add assertion for render*/
  });

  test("should load fraudnet before render", async () => {
    await setupCard(mockSetupCardOptions);

    expect(getCardProps).toHaveBeenCalledWith({
      facilitatorAccessToken: "token",
      featureFlags: {},
      experiments: {
        hostedCardFields: true,
      },
    });

    expect(loadFraudnet).toBeCalledWith({
      env: "local",
      clientMetadataID: "test-id",
      cspNonce: mockSetupCardOptions.cspNonce,
    });

    /* Add assertion for render*/
  });
  test("calls loadFraudnet and renders even if loadFraudnet fails", async () => {
    // $FlowIssue jest mock
    loadFraudnet.mockRejectedValueOnce(new Error("Fake error"));
    const getBodyMock = vi.fn();
    getBodyMock.mockReturnValue(document.createElement("div"));

    await setupCard(mockSetupCardOptions);

    expect(loadFraudnet).toBeCalledTimes(1);
    expect(loadFraudnet).toBeCalledWith({
      env: "local",
      clientMetadataID: "test-id",
      cspNonce: "nonce",
    });
    expect(getCardProps).toHaveBeenCalledWith({
      facilitatorAccessToken: "token",
      featureFlags: {},
      experiments: {
        hostedCardFields: true,
      },
    });
    /* Add assertion for render*/
  });
});
