/* @flow */

import { vi, test, describe, expect, beforeEach } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { getShippingOrderInfo } from "../api";

vi.mock("../api", () => ({
  getShippingOrderInfo: vi.fn(() => ZalgoPromise.resolve({})),
}));

import { buildXOnShippingOptionsChangeActions } from "./onShippingOptionsChange";

describe("onShippingOptionsChange", () => {
  let actions;
  describe("buildXOnShippingOptionsChangeActions", () => {
    beforeEach(() => {
      actions = buildXOnShippingOptionsChangeActions({
        actions: {
          // $FlowFixMe
          reject: () => ZalgoPromise.resolve({}),
          // $FlowFixMe
          resolve: () => ZalgoPromise.resolve({}),
        },
        data: {
          amount: {
            currencyCode: "USD",
            value: "",
            breakdown: {
              discount: {
                currencyCode: "USD",
                value: "1",
              },
            },
          },
          options: [
            {
              id: "123",
              label: "",
              selected: true,
              type: "SHIPPING",
              amount: {
                currencyCode: "USD",
                value: "1",
              },
            },
          ],
        },
        orderID: "",
      });
    });

    test("transforms queries for options", async () => {
      expect(
        await actions.buildPatchPayload({
          option: {
            amount: {
              currencyCode: "USD",
              value: "1",
            },
            label: "label",
            selected: true,
            type: "SHIPPING",
          },
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/shipping/options",
          value: [
            {
              amount: {
                currency_code: "USD",
                value: "1",
              },
              id: "123",
              label: "",
              selected: false,
              type: "SHIPPING",
            },
          ],
        },
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "1",
              },
              shipping: {
                currency_code: "USD",
                value: "1",
              },
            },
            currency_code: "USD",
            value: "0.00",
          },
        },
      ]);
    });

    test("transforms queries for discount", async () => {
      expect(
        await actions.buildPatchPayload({
          discount: "1",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "1",
              },
              shipping_discount: {
                currency_code: "USD",
                value: "1.00",
              },
            },
            currency_code: "USD",
            value: "0.00",
          },
        },
      ]);
    });
  });
});
