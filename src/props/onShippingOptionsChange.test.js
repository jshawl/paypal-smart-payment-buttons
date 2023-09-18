/* @flow */

import { vi, test, describe, expect, beforeEach } from "vitest";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { buildXOnShippingOptionsChangeActions } from "./onShippingOptionsChange";

vi.mock("../api", () => ({
  getShippingOrderInfo: vi.fn(() =>
    ZalgoPromise.resolve({
      checkoutSession: {
        cart: {
          shippingMethods: [
            {
              id: "SHIP_1234",
              label: "Free Shipping",
              type: "SHIPPING",
              selected: true,
              amount: {
                value: "0.00",
                currencyCode: "USD",
              },
            },
            {
              id: "SHIP_123",
              label: "Shipping",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "20.00",
                currencyCode: "USD",
              },
            },
            {
              id: "SHIP_124",
              label: "Overnight",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "40.00",
                currencyCode: "USD",
              },
            },
          ],
        },
      },
    })
  ),
}));

describe("onShippingOptionsChange", () => {
  let actions;
  describe("buildXOnShippingOptionsChangeActions", () => {
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
        options: [
          {
            id: "SHIP_1234",
            label: "Free Shipping",
            type: "SHIPPING",
            selected: true,
            amount: {
              value: "0.00",
              currencyCode: "USD",
            },
          },
          {
            id: "SHIP_123",
            label: "Shipping",
            type: "SHIPPING",
            selected: false,
            amount: {
              value: "20.00",
              currencyCode: "USD",
            },
          },
          {
            id: "SHIP_124",
            label: "Overnight",
            type: "SHIPPING",
            selected: false,
            amount: {
              value: "40.00",
              currencyCode: "USD",
            },
          },
        ],
      };
      actions = buildXOnShippingOptionsChangeActions({
        actions: {
          reject: () => ZalgoPromise.resolve(),
          resolve: () => ZalgoPromise.resolve(),
        },
        data: rypData,
        orderID: "",
      });
    });

    test("returns queries as an empty array", async () => {
      expect(await actions.buildOrderPatchPayload()).toEqual([]);
    });

    test("transforms queries for discount", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          discount: "1.00",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "1.00",
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
            value: "205.00",
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
          insurance: "13.00",
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
                value: "13.00",
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
            value: "209.00",
          },
        },
      ]);
    });

    test("transforms queries for itemTotal", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          itemTotal: "130.00",
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
                value: "130.00",
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
            value: "146.00",
          },
        },
      ]);
    });

    test("transforms queries for shippingOption", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          shippingOption: {
            id: "SHIP_123",
            label: "Shipping",
            selected: true,
            type: "SHIPPING",
            amount: {
              currencyCode: "USD",
              value: "27.00",
            },
          },
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
                value: "27.00",
              },
              tax_total: {
                currency_code: "USD",
                value: "20.00",
              },
            },
            currency_code: "USD",
            value: "218.00",
          },
        },
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/shipping/options",
          value: [
            {
              id: "SHIP_1234",
              label: "Free Shipping",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "0.00",
                currency_code: "USD",
              },
            },
            {
              id: "SHIP_123",
              label: "Shipping",
              selected: true,
              type: "SHIPPING",
              amount: {
                currency_code: "USD",
                value: "27.00",
              },
            },
            {
              id: "SHIP_124",
              label: "Overnight",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "40.00",
                currency_code: "USD",
              },
            },
          ],
        },
      ]);
    });

    test("transforms queries for shippingDiscount", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          shippingDiscount: "11.00",
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
                value: "11.00",
              },
              tax_total: {
                currency_code: "USD",
                value: "20.00",
              },
            },
            currency_code: "USD",
            value: "185.00",
          },
        },
      ]);
    });

    test("transforms queries for taxTotal", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          taxTotal: "25.00",
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
                value: "25.00",
              },
            },
            currency_code: "USD",
            value: "201.00",
          },
        },
      ]);
    });

    test("transforms queries for discount, handling, insurance, itemTotal, shippingOption, shippingDiscount, taxTotal", async () => {
      expect(
        await actions.buildOrderPatchPayload({
          discount: "1.00",
          handling: "6.50",
          insurance: "14.00",
          itemTotal: "145.00",
          shippingOption: {
            id: "SHIP_123",
            label: "Shipping",
            selected: true,
            type: "SHIPPING",
            amount: {
              currencyCode: "USD",
              value: "27.00",
            },
          },
          shippingDiscount: "5.00",
          taxTotal: "37.00",
        })
      ).toEqual([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            breakdown: {
              discount: {
                currency_code: "USD",
                value: "1.00",
              },
              handling: {
                currency_code: "USD",
                value: "6.50",
              },
              insurance: {
                currency_code: "USD",
                value: "14.00",
              },
              item_total: {
                currency_code: "USD",
                value: "145.00",
              },
              shipping: {
                currency_code: "USD",
                value: "27.00",
              },
              shipping_discount: {
                currency_code: "USD",
                value: "5.00",
              },
              tax_total: {
                currency_code: "USD",
                value: "37.00",
              },
            },
            currency_code: "USD",
            value: "223.50",
          },
        },
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/shipping/options",
          value: [
            {
              id: "SHIP_1234",
              label: "Free Shipping",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "0.00",
                currency_code: "USD",
              },
            },
            {
              id: "SHIP_123",
              label: "Shipping",
              selected: true,
              type: "SHIPPING",
              amount: {
                currency_code: "USD",
                value: "27.00",
              },
            },
            {
              id: "SHIP_124",
              label: "Overnight",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "40.00",
                currency_code: "USD",
              },
            },
          ],
        },
      ]);
    });
  });
});
