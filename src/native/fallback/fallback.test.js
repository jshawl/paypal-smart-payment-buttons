/* @flow */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { setupNativeFallback } from "./fallback";
import { setupWindowPayPal, setupWindowXprops } from "./test-utilities";

describe("Native fallback cases", () => {
  const postRobotSend = vi.fn().mockResolvedValue({
    source: window,
    origin: window.location.origin,
    data: null,
  });

  const windowOpener = {};
  let nativeFallback;

  beforeEach(() => {
    setupWindowPayPal({
      postRobot: {
        send: postRobotSend,
      },
    });

    setupWindowXprops();
    window.opener = windowOpener;
  });

  afterEach(() => {
    delete window.opener;
    nativeFallback?.destroy();
  });

  it("should open the native fallback and send a detect web switch message", async () => {
    const parentDomain = "foo.paypal.com";

    nativeFallback = await setupNativeFallback({ parentDomain });

    expect(postRobotSend).toHaveBeenCalledWith(
      windowOpener,
      "detectWebSwitch",
      expect.any(Object),
      { domain: parentDomain },
    );
  });
});
