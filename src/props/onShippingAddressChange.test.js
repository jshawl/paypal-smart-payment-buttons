/* @flow */

import { vi, test, describe, expect, beforeEach } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import {
  buildXOnShippingAddressChangeActions,
  buildXOnShippingAddressChangeData,
} from "./onShippingAddressChange";

vi.mock("../api", () => ({
  getShippingOrderInfo: vi.fn(() => ZalgoPromise.resolve({})),
}));

describe("onShippingAddressChange", () => {
  let actions;
  let data;
  describe("build onShippingAddressChange actions and data", () => {
    beforeEach(() => {
      const rypData = {
        amount: {
          currencyCode: "USD",
          value: "200.00",
          breakdown: {
            itemTotal: {
              currencyCode: "USD",
              value: "180.00",
            },
            shipping: {
              currencyCode: "USD",
              value: "5.00",
            },
            handling: {
              currencyCode: "USD",
              value: "1.00",
            },
            taxTotal: {
              currencyCode: "USD",
              value: "20.00",
            },
            discount: {
              currencyCode: "USD",
              value: "10.00",
            },
          },
        },
        shippingAddress: {
          city: "New York",
          state: "New York",
          countryCode: "US",
          postalCode: "10111",
        },
      };
      actions = buildXOnShippingAddressChangeActions({
        actions: {
          reject: () => ZalgoPromise.resolve(),
          resolve: () => ZalgoPromise.resolve(),
        },
        data: rypData,
        orderID: "",
      });
      data = buildXOnShippingAddressChangeData(rypData);
    });

    test("returns undefined when passing data.errors to actions.reject()", async () => {
      expect(await actions.reject(data.errors.ADDRESS_ERROR)).toEqual(
        ZalgoPromise.resolve().value
      );
      expect(await actions.reject(data.errors.COUNTRY_ERROR)).toEqual(
        ZalgoPromise.resolve().value
      );
      expect(await actions.reject(data.errors.STATE_ERROR)).toEqual(
        ZalgoPromise.resolve().value
      );
      expect(await actions.reject(data.errors.ZIP_ERROR)).toEqual(
        ZalgoPromise.resolve().value
      );
    });

    test("returns queries as an empty array", async () => {
      expect(await actions.buildOrderPatchPayload()).toEqual([]);
    });

    test("transforms queries for discount", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          discount: "5.00",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "5.00",
              },
              handling: {
                currency_code: "USD",
                value: "1.00",
              },
              item_total: {
                currency_code: "USD",
                value: "180.00",
              },
              shipping: {
                currency_code: "USD",
                value: "5.00",
              },
              tax_total: {
                currency_code: "USD",
                value: "20.00",
              },
            },
            currency_code: "USD",
            value: "201.00",
          },
        },
      ]);
    });

    test("transforms queries for handling", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          handling: "7.50",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "10.00",
              },
              handling: {
                currency_code: "USD",
                value: "7.50",
              },
              item_total: {
                currency_code: "USD",
                value: "180.00",
              },
              shipping: {
                currency_code: "USD",
                value: "5.00",
              },
              tax_total: {
                currency_code: "USD",
                value: "20.00",
              },
            },
            currency_code: "USD",
            value: "202.50",
          },
        },
      ]);
    });

    test("transforms queries for insurance", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          insurance: "12.00",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "10.00",
              },
              handling: {
                currency_code: "USD",
                value: "1.00",
              },
              insurance: {
                currency_code: "USD",
                value: "12.00",
              },
              item_total: {
                currency_code: "USD",
                value: "180.00",
              },
              shipping: {
                currency_code: "USD",
                value: "5.00",
              },
              tax_total: {
                currency_code: "USD",
                value: "20.00",
              },
            },
            currency_code: "USD",
            value: "208.00",
          },
        },
      ]);
    });

    test("transforms queries for itemTotal", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          itemTotal: "120.00",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "10.00",
              },
              handling: {
                currency_code: "USD",
                value: "1.00",
              },
              item_total: {
                currency_code: "USD",
                value: "120.00",
              },
              shipping: {
                currency_code: "USD",
                value: "5.00",
              },
              tax_total: {
                currency_code: "USD",
                value: "20.00",
              },
            },
            currency_code: "USD",
            value: "136.00",
          },
        },
      ]);
    });

    test("transforms queries for shippingOptions", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          shippingOptions: [
            {
              amount: {
                currencyCode: "USD",
                value: "10.47",
              },
              label: "3 Day Shipping",
              selected: true,
              type: "SHIPPING",
            },
            {
              amount: {
                currencyCode: "USD",
                value: "110.89",
              },
              label: "Overnight Shipping",
              selected: false,
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
                value: "10.00",
              },
              handling: {
                currency_code: "USD",
                value: "1.00",
              },
              item_total: {
                currency_code: "USD",
                value: "180.00",
              },
              shipping: {
                currency_code: "USD",
                value: "10.47",
              },
              tax_total: {
                currency_code: "USD",
                value: "20.00",
              },
            },
            currency_code: "USD",
            value: "201.47",
          },
        },
        {
          op: "add",
          path: "/purchase_units/@reference_id=='default'/shipping/options",
          value: [
            {
              amount: {
                currency_code: "USD",
                value: "10.47",
              },
              label: "3 Day Shipping",
              selected: true,
              type: "SHIPPING",
            },
            {
              amount: {
                currency_code: "USD",
                value: "110.89",
              },
              label: "Overnight Shipping",
              selected: false,
              type: "SHIPPING",
            },
          ],
        },
      ]);
    });

    test("transforms queries for shippingDiscount", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          shippingDiscount: "0.50",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "10.00",
              },
              handling: {
                currency_code: "USD",
                value: "1.00",
              },
              item_total: {
                currency_code: "USD",
                value: "180.00",
              },
              shipping: {
                currency_code: "USD",
                value: "5.00",
              },
              shipping_discount: {
                currency_code: "USD",
                value: "0.50",
              },
              tax_total: {
                currency_code: "USD",
                value: "20.00",
              },
            },
            currency_code: "USD",
            value: "195.50",
          },
        },
      ]);
    });

    test("transforms queries for taxTotal", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          taxTotal: "0.10",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "10.00",
              },
              handling: {
                currency_code: "USD",
                value: "1.00",
              },
              item_total: {
                currency_code: "USD",
                value: "180.00",
              },
              shipping: {
                currency_code: "USD",
                value: "5.00",
              },
              tax_total: {
                currency_code: "USD",
                value: "0.10",
              },
            },
            currency_code: "USD",
            value: "176.10",
          },
        },
      ]);
    });

    test("transforms queries for discount, handling, insurance, itemTotal, shippingOptions, shippingDiscount, and taxTotal", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          discount: "5.00",
          handling: "7.00",
          insurance: "9.00",
          itemTotal: "135.00",
          shippingOptions: [
            {
              amount: {
                currencyCode: "USD",
                value: "10.47",
              },
              label: "3 Day Shipping",
              selected: true,
              type: "SHIPPING",
            },
            {
              amount: {
                currencyCode: "USD",
                value: "110.89",
              },
              label: "Overnight Shipping",
              selected: false,
              type: "SHIPPING",
            },
          ],
          shippingDiscount: "1.50",
          taxTotal: "10.00",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "5.00",
              },
              handling: {
                currency_code: "USD",
                value: "7.00",
              },
              insurance: {
                currency_code: "USD",
                value: "9.00",
              },
              item_total: {
                currency_code: "USD",
                value: "135.00",
              },
              shipping: {
                currency_code: "USD",
                value: "10.47",
              },
              shipping_discount: {
                currency_code: "USD",
                value: "1.50",
              },
              tax_total: {
                currency_code: "USD",
                value: "10.00",
              },
            },
            currency_code: "USD",
            value: "164.97",
          },
        },
        {
          op: "add",
          path: "/purchase_units/@reference_id=='default'/shipping/options",
          value: [
            {
              amount: {
                currency_code: "USD",
                value: "10.47",
              },
              label: "3 Day Shipping",
              selected: true,
              type: "SHIPPING",
            },
            {
              amount: {
                currency_code: "USD",
                value: "110.89",
              },
              label: "Overnight Shipping",
              selected: false,
              type: "SHIPPING",
            },
          ],
        },
      ]);
    });
  });
});
