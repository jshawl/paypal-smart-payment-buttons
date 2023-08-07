/* eslint-disable no-empty-function */
/* @flow */
import { describe, test, expect, beforeEach, vi } from "vitest";

import { TARGET_ELEMENT } from "../constants";
import { threeDsAuthStatus } from "../card/logger";

import { handleThreeDomainSecureContingency } from "./3ds";

vi.mock("../card/logger", () => ({
  threeDsAuthStatus: vi.fn(),
}));
describe("3ds.js", () => {
  beforeEach(() => undefined);

  describe("handleThreeDomainSecureContingency()", () => {
    test("should resolve if no 3DS contingency", async () => {
      const inputOpts = {
        status: "something",
        links: [],
        ThreeDomainSecure: vi.fn(),
        createOrder: () => {},
        getParent: () => {},
      };
      // $FlowIssue
      const result = await handleThreeDomainSecureContingency(inputOpts);
      expect(result).toBeUndefined();
      expect(inputOpts.ThreeDomainSecure).not.toBeCalled();
    });

    test("should handle 3DS contingency when present", async () => {
      const mockRenderTo = vi.fn(() => {
        // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
        return Promise.resolve();
      });
      // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
      const mockClose = vi.fn(() => Promise.resolve());
      const mockThreeDomainSecure = vi.fn(({ onSuccess }) => ({
        renderTo: vi.fn(async (param1, param2) => {
          // Need to invoke the `onSuccess` provided to the ThreeDomainSecure object to
          // resolve the ZalgoPromise, so just sneakily invoke it here for the test here
          await onSuccess();
          expect(threeDsAuthStatus).toBeCalledWith({ authStatus: "success" });
          return mockRenderTo(param1, param2);
        }),
        close: mockClose,
      }));

      const mockParent = "some-parent";
      const mockAction = "some-action";
      const mockToken = "some-token";
      const inputOpts = {
        status: "PAYER_ACTION_REQUIRED",
        links: [
          {
            method: "get",
            rel: "payer-action",
            href: `https://somelink.com/helios?flow=3ds&action=${mockAction}&token=${mockToken}`,
          },
        ],
        ThreeDomainSecure: mockThreeDomainSecure,
        createOrder: vi.fn(() => ""),
        getParent: () => {
          return mockParent;
        },
      };
      const expected3DSArgs = {
        vaultToken: mockToken,
        action: mockAction,
        createOrder: inputOpts.createOrder,
        onSuccess: expect.any(Function),
        onCancel: expect.any(Function),
        onError: expect.any(Function),
      };
      // $FlowIssue
      await handleThreeDomainSecureContingency(inputOpts);
      expect(mockThreeDomainSecure).toBeCalledWith(expected3DSArgs);
      expect(mockRenderTo).toBeCalledWith(mockParent, TARGET_ELEMENT.BODY);
    });
  });
});

/* eslint-enable no-empty-function */
