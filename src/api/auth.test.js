/* @flow */
import { describe, test, expect, vi } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { upgradeFacilitatorAccessTokenWithIgnoreCache } from "./auth";
import { callGraphQL } from "./api";

vi.mock("./api", async () => {
  const actual = await vi.importActual("./api");
  return {
    ...actual,
    callGraphQL: vi.fn(() => {
      return ZalgoPromise.resolve({
        data: {
          createUpgradedLowScopeAccessToken: "newToken",
        },
      });
    }),
  };
});

describe("auth", () => {
  test("invoke callGraphQL from upgradeFacilitatorAccessTokenWithIgnoreCache", async () => {
    const orderID = "EC-abc123";
    const facilitatorAccessToken = "A21_A.AA";
    const buyerAccessToken = "S23_A.AA";

    // Call the function that uses callGraphQL
    await upgradeFacilitatorAccessTokenWithIgnoreCache(
      facilitatorAccessToken,
      buyerAccessToken,
      orderID
    );

    expect(callGraphQL).toHaveBeenCalled();
    // $FlowFixMe
    expect(callGraphQL()).resolves.toEqual({
      data: {
        createUpgradedLowScopeAccessToken: "newToken",
      },
    });
  });
});
