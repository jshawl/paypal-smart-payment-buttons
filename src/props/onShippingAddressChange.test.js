/* @flow */

import { vi, test, describe, expect, beforeEach } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { getShippingOrderInfo } from "../api";

vi.mock("../api", () => ({
  getShippingOrderInfo: vi.fn(() => ZalgoPromise.resolve({})),
}));

import { buildXOnShippingAddressChangeActions } from "./onShippingAddressChange";

describe("onShippingOptionsChange", () => {
  let actions;
  describe("buildXOnShippingAddressChangeActions", () => {
    beforeEach(() => {
      actions = buildXOnShippingAddressChangeActions({
        actions: {
          // $FlowFixMe
          reject: () => ZalgoPromise.resolve({}),
          // $FlowFixMe
          resolve: () => ZalgoPromise.resolve({}),
        },
        data: {
          amount: {
            currencyCode: "USD",
            value: "1",
            breakdown: {
              discount: {
                currencyCode: "USD",
                value: "1",
              },
            },
          },
        },
        orderID: "",
      });
    });

    test("transforms queries for options", async () => {
      expect(
        await actions.buildPatchPayload({
          options: [
            {
              amount: {
                currencyCode: "USD",
                value: "1",
              },
              label: "label",
              selected: true,
              type: "SHIPPING",
            },
          ],
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
              shipping: {
                currency_code: "USD",
                value: "1",
              },
            },
            currency_code: "USD",
            value: "0.00",
          },
        },
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/shipping/options",
          value: [
            {
              amount: {
                currency_code: "USD",
                value: "1",
              },
              label: "label",
              selected: true,
              type: "SHIPPING",
            },
          ],
        },
      ]);
    });

    test("transforms queries for discount", async () => {
      expect(
        await actions.buildPatchPayload({
          discount: "0.5",
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
                value: "0.50",
              },
            },
            currency_code: "USD",
            value: "-1.50",
          },
        },
      ]);
    });

    test("transforms queries for tax", async () => {
      expect(
        await actions.buildPatchPayload({
          tax: "0.10",
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
              tax_total: {
                currency_code: "USD",
                value: "0.10",
              },
            },
            currency_code: "USD",
            value: "-0.90",
          },
        },
      ]);
    });
  });
});
