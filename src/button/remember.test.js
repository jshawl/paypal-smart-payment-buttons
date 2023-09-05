/* @flow */

import { describe, it, expect, vi } from "vitest";
import { FUNDING } from "@paypal/sdk-constants/src";

import { setupRemember } from "./remember";

const rememberMock = vi.fn();

describe("setupRemember", () => {
  it("should call xprops.remember with venmo if venmo is eligible", () => {
    setupRemember({
      rememberFunding: rememberMock,
      fundingEligibility: {
        [FUNDING.VENMO]: { eligible: true, branded: false },
      },
    });
    expect(rememberMock).toHaveBeenCalledWith([FUNDING.VENMO]);
  });
});
