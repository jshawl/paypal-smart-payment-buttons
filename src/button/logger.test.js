/* @flow */

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { COUNTRY } from "@paypal/sdk-constants/src";
import { uniqueID } from "@krakenjs/belter/src";

import { getLogger } from "../lib/logger";

import { setupButtonLogger } from "./logger";

vi.mock("../lib/logger", () => ({
  getLogger: vi.fn(),
  setupLogger: vi.fn(),
  sendMetric: vi.fn(),
}));

const buttonLoggerProps = {
  env: "test",
  sessionID: uniqueID(),
  clientID: uniqueID(),
  commit: true,
  sdkCorrelationID: uniqueID(),
  buttonCorrelationID: uniqueID(),
  partnerAttributionID: uniqueID(),
  fundingSource: "applepay",
  buttonSessionID: uniqueID(),
  merchantDomain: "mock://www.paypal.com",
  sdkVersion: "1.2.3",
  stickinessID: uniqueID(),
  buyerCountry: COUNTRY.US,
  onShippingChange: vi.fn(),
  // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
  getQueriedEligibleFunding: () => Promise.resolve([]),
  style: { tagline: true, shape: "", layout: "", label: "", color: "" },
  locale: {
    country: "US",
    lang: "en",
  },
  merchantID: ["XYZ12345"],
};

describe("setupButtonLogger", () => {
  const infoMock = vi.fn();
  const trackMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();

    // $FlowIssue .mockImplementation
    getLogger.mockImplementation(() => ({
      addTrackingBuilder: vi.fn(),
      addPayloadBuilder: vi.fn(),
      info: infoMock,
      track: trackMock,
      warn: vi.fn(),
      error: vi.fn(),
      flush: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should send logs for CPL", async () => {
    const timeNow = new Date(1608357600000);
    const twoSecondsAgo = new Date(timeNow);
    twoSecondsAgo.setSeconds(timeNow.getSeconds() - 2);
    const threeSecondsAgo = new Date(timeNow);
    threeSecondsAgo.setSeconds(timeNow.getSeconds() - 3);

    vi.setSystemTime(new Date(1608357600000));

    window.performance = {
      now: vi.fn(() => threeSecondsAgo.getMilliseconds()),
      timing: {
        navigationStart: threeSecondsAgo.getMilliseconds(),
      },
      getEntriesByName: vi.fn(() => [
        { startTime: twoSecondsAgo.getMilliseconds() },
      ]),
    };

    // $FlowIssue wants getQueriedEligibleFunding to be a ZalgoPromise
    await setupButtonLogger(buttonLoggerProps);
    expect(infoMock).toHaveBeenCalledTimes(12);
    expect(infoMock).toHaveBeenLastCalledWith(
      "CPL_LATENCY_METRICS_SECOND_RENDER"
    );
    expect(trackMock).toHaveBeenCalledTimes(2);
    expect(trackMock).toHaveBeenNthCalledWith(1, {
      state_name: "CPL_LATENCY_METRICS",
      transition_name: "process_client_metrics",
      page_name: "main:xo:paypal-components:smart-payment-buttons",
      cpl_comp_metrics:
        '{"second-render-response":{"start":0,"tt":1608357600000},"second-render-body":{"start":1608357600000,"tt":0}}',
    });
  });

  it("should fail to get performance marks", async () => {
    window.performance = {};
    await setupButtonLogger(buttonLoggerProps);
    expect(infoMock).toHaveBeenCalledWith(
      "button_render_CPL_instrumentation_log_error"
    );
  });

  it("should not execute cpl instrumentation", async () => {
    window.performance = null;
    await setupButtonLogger(buttonLoggerProps);
    expect(infoMock).toHaveBeenCalledWith(
      "button_render_CPL_instrumentation_not_executed"
    );
  });
});
