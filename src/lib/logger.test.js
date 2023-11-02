/* @flow */
import { describe, it, expect, vi } from "vitest";
import { isAndroid, isIos } from "@krakenjs/belter";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { getLogger, setupLogger } from "./logger";

vi.mock("@krakenjs/belter", async () => {
  const actual = await vi.importActual("@krakenjs/belter");

  return {
    ...actual,
    isIos: vi.fn(),
    isAndroid: vi.fn(),
  };
});

const loggerProps = {
  env: "test",
  locale: {
    lang: "en",
    country: "US",
  },
  buyerCountry: "US",
  clientID: "",
  sdkVersion: "",
  sessionID: "",
  sdkCorrelationID: "",
};

describe("setupLogger", () => {
  it("supports sdk mobile environments", () => {
    // $FlowFixMe
    isIos.mockImplementation(() => true);
    getLogger().track({ tracking: true });
    setupLogger(loggerProps);
    // $FlowFixMe
    isAndroid.mockImplementationOnce(() => true);
    getLogger().info("info about android os");
    setupLogger(loggerProps);
  });

  it("logs unhandled errors", () => {
    vi.spyOn(
      ZalgoPromise,
      "onPossiblyUnhandledException",
    ).mockImplementationOnce((d) => d());
    const mockError = vi.fn();
    vi.spyOn(getLogger(), "error").mockImplementationOnce(mockError);
    setupLogger(loggerProps);
    expect(mockError).toHaveBeenCalledWith(
      "unhandled_error",
      expect.any(Object),
    );
  });
});
