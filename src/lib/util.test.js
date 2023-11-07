/* @flow */
import { describe, it, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { isAndroid, isIos } from "@krakenjs/belter/src";

import {
  createExperiment,
  getBody,
  getNavigationTimeOrigin,
  isClient,
  isEmailAddress,
  isAndroidChrome,
  isIOSSafari,
  isServer,
  loadScript,
  onCloseProxyWindow,
  promiseNoop,
  promiseOne,
  sendBeacon,
  sleep,
  unresolvedPromise,
} from "./util";

vi.mock("@krakenjs/belter/src", async () => {
  const actual = await vi.importActual("@krakenjs/belter/src");

  return {
    ...actual,
    isIos: vi.fn(),
    isAndroid: vi.fn(),
  };
});

describe("utils", () => {
  it("has a helper for noop unresolved promises,", () => {
    const mockFn = vi.fn();
    const promise = unresolvedPromise();
    promise.then(mockFn);
    promise.resolve();
    expect(mockFn).toHaveBeenCalled();
  });

  it("has a promiseNoop", () => {
    expect(() => promiseNoop()).not.toThrowError();
  });

  it("gets the body", () => {
    expect(getBody()).toBeTruthy();
    const body = document.body;
    Object.defineProperty(document, "body", {
      // $FlowFixMe
      value: false,
      writable: true,
    });
    expect(() => getBody()).toThrowError("Document body not found");
    Object.defineProperty(document, "body", {
      value: body,
      writable: true,
    });
  });

  it("sends beacons", () => {
    const url = "http://example.com/";
    const { body } = document;
    Object.defineProperty(document, "body", {
      // $FlowFixMe
      value: false,
      writable: true,
    });
    sendBeacon("http://example.com/");
    expect(document.querySelector(`img[src="${url}"]`)).toBe(null);
    Object.defineProperty(document, "body", {
      value: body,
      writable: true,
    });
    sendBeacon(url);
    expect(document.querySelector(`img[src="${url}"]`)).not.toBe(null);
  });

  it("sleeps", async () => {
    await sleep(1).then(() => {
      expect(1).toBe(1);
    });
  });

  it("loadsScript", async () => {
    const url = "http://example.com/";
    expect(document.querySelector(`script[src="${url}"]`)).toBe(null);
    loadScript(url);
    expect(document.querySelector(`script[src="${url}"]`)).not.toBe(null);
    const { head, body } = document;
    Object.defineProperty(document, "body", {
      // $FlowFixMe
      value: false,
      writable: true,
    });
    Object.defineProperty(document, "head", {
      // $FlowFixMe
      value: false,
      writable: true,
    });
    const onErr = vi.fn();
    await loadScript(url).catch(onErr);
    expect(onErr).toHaveBeenCalled();
    Object.defineProperty(document, "body", {
      value: body,
      writable: true,
    });
    Object.defineProperty(document, "head", {
      value: head,
      writable: true,
    });
  });

  it("promiseOne", () => {
    const mockFn = vi.fn();
    promiseOne([ZalgoPromise.resolve("ok")]).then(mockFn);
    expect(mockFn).toHaveBeenCalledWith("ok");
  });

  it("has helper methods for isClient and isServer", () => {
    expect(isServer()).toBe(false);
    expect(isClient()).toBe(true);
  });

  it("creates experiments", () => {
    expect(() => {
      const exp = createExperiment("name", { sample: 0 });
      exp.logStart({ starting: "true" });
      exp.log("logging");
    }).not.toThrowError();
  });

  it("getNavigationTimeOrigin()", () => {
    expect(() => getNavigationTimeOrigin()).not.toThrowError();
    Object.defineProperty(window.performance, "timeOrigin", {
      value: false,
    });
    Object.defineProperty(window.performance, "timing", {
      value: {},
    });
    expect(() => getNavigationTimeOrigin()).not.toThrowError();
    Object.defineProperty(window, "performance", {
      value: false,
    });
    expect(() => getNavigationTimeOrigin()).toThrowError(
      "window.performance not supported",
    );
  });

  it("validates email addresses", () => {
    expect(isEmailAddress("example@example.com")).toBe(true);
    expect(isEmailAddress("@@.comexampleexample")).toBe(false);
  });

  it("detects android / ios", () => {
    expect(isAndroid()).toBeFalsy();
    // $FlowFixMe
    isAndroid.mockImplementationOnce(() => true);
    expect(isAndroidChrome()).toBe(false);
    expect(isIos()).toBeFalsy();
    // $FlowFixMe
    isIos.mockImplementationOnce(() => true);
    expect(isIOSSafari()).toBe(false);
  });

  it("onCloseProxyWindow()", async () => {
    const mockFn = vi.fn();
    await onCloseProxyWindow(
      // $FlowFixMe
      { awaitWindow: () => ZalgoPromise.resolve(window) },
      mockFn,
    ).cancel();
    // $FlowFixMe
    onCloseProxyWindow({
      callback: vi.fn(),
      awaitWindow: () => ({ then: mockFn }),
    }).cancel();
  });
});
