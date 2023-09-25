/* @flow */

import { describe, expect, vi, it } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { uniqueID } from "@krakenjs/belter/src";

import { upgradeFacilitatorAccessToken } from "../api";

import { getOnAuth } from "./onAuth";

const logger = {
  warn: vi.fn(() => logger),
  info: vi.fn(() => logger),
};

vi.mock("../lib/logger", () => ({
  getLogger: vi.fn(() => logger),
}));

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");

  return {
    ...actual,
    upgradeFacilitatorAccessToken: vi.fn(() =>
      ZalgoPromise.resolve({
        data: {
          upgradeLowScopeAccessToken: true,
        },
      })
    ),
  };
});

describe("getOnAuth", () => {
  const onAuthOptions = {
    experiments: { upgradeLSATWithIgnoreCache: false },
    featureFlags: { isLsatUpgradable: true },
    facilitatorAccessToken: uniqueID(),
    createOrder: vi.fn().mockResolvedValue(uniqueID()),
    createSubscription: undefined,
  };

  it("should call upgradeFacilitatorAccessToken if treatment is not present", async () => {
    const onAuth = getOnAuth(onAuthOptions);
    await onAuth({ accessToken: onAuthOptions.facilitatorAccessToken });

    expect(upgradeFacilitatorAccessToken).toHaveBeenCalled();
    expect(logger.info).toHaveBeenNthCalledWith(2, "upgrade_lsat_success");

    expect.assertions(2);
  });

  it("should not call upgradeFacilitatorAccessToken if treatment is present", async () => {
    const onAuth = getOnAuth({
      ...onAuthOptions,
      experiments: { upgradeLSATWithIgnoreCache: true },
    });
    await onAuth({ accessToken: onAuthOptions.facilitatorAccessToken });

    expect(upgradeFacilitatorAccessToken).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenNthCalledWith(2, "upgrade_lsat_success");

    expect.assertions(2);
  });

  it("should call return the access token for subscriptions case", async () => {
    const onAuth = getOnAuth({
      ...onAuthOptions,
      createSubscription: vi.fn().mockResolvedValue(uniqueID()),
      experiments: { upgradeLSATWithIgnoreCache: true },
    });
    await onAuth({ accessToken: onAuthOptions.facilitatorAccessToken });

    expect(upgradeFacilitatorAccessToken).not.toHaveBeenCalled();

    expect.assertions(1);
  });
});
