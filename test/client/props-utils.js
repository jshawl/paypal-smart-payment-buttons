/* @flow */

import {
  buildBreakdown,
  calculateTotalFromShippingBreakdownAmounts,
  convertQueriesToArray,
  updateOperationForShippingOptions,
  updateShippingOptions,
  breakdownKeyChanges,
  optionsKeyChanges,
} from "../../src/props/shippingChangeUtils";
import { ON_SHIPPING_CHANGE_PATHS } from "../../src/props/onShippingChange";

import { areObjectsIdentical } from "./util";

describe("onShippingChange utils", () => {
  describe("calculateTotalFromShippingBreakdownAmounts", () => {
    it("should calculate correct amount from current breakdown and updated amount when update amount is in breakdown", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
        handling: {
          value: "1.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        handling: "5.0",
      };

      const result = calculateTotalFromShippingBreakdownAmounts({
        breakdown,
        updatedAmounts,
      });
      if (result !== "115.00") {
        throw new Error(`Expected result to be 115.0, but got ${result}`);
      }
    });

    it("should calculate correct amount from current breakdown and updated amount when update amount is not in breakdown", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        handling: "5.0",
      };

      const result = calculateTotalFromShippingBreakdownAmounts({
        breakdown,
        updatedAmounts,
      });
      if (result !== "115.00") {
        throw new Error(`Expected result to be 115.0, but got ${result}`);
      }
    });

    it("should calculate correct amount when shipping_discount is updated with a positive number", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        shipping_discount: "5.0",
      };

      const result = calculateTotalFromShippingBreakdownAmounts({
        breakdown,
        updatedAmounts,
      });
      if (result !== "105.00") {
        throw new Error(`Expected result to be 105.00, but got ${result}`);
      }
    });

    it("should calculate correct amount when shipping_discount is updated with a negative number", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        shipping_discount: "-5.0",
      };

      const result = calculateTotalFromShippingBreakdownAmounts({
        breakdown,
        updatedAmounts,
      });
      if (result !== "105.00") {
        throw new Error(`Expected result to be 105.00, but got ${result}`);
      }
    });

    it("should calculate correct amount when discount is updated with a positive number", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        discount: "5.0",
      };

      const result = calculateTotalFromShippingBreakdownAmounts({
        breakdown,
        updatedAmounts,
      });
      if (result !== "105.00") {
        throw new Error(`Expected result to be 105.00, but got ${result}`);
      }
    });

    it("should calculate correct amount when shipping_discount is updated with a negative number", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        discount: "-5.0",
      };

      const result = calculateTotalFromShippingBreakdownAmounts({
        breakdown,
        updatedAmounts,
      });
      if (result !== "105.00") {
        throw new Error(`Expected result to be 105.00, but got ${result}`);
      }
    });
  });

  describe("buildBreakdown", () => {
    it("should build breakdown for shipping_discount to be positive if sent as negative", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        shipping_discount: "-5.0",
      };

      const expectedResult = {
        item_total: { value: "100.0", currency_code: "USD" },
        shipping: { value: "10.0", currency_code: "USD" },
        shipping_discount: { currency_code: "USD", value: "5.00" },
      };
      const result = buildBreakdown({ breakdown, updatedAmounts });

      if (!areObjectsIdentical(expectedResult, result)) {
        throw new Error(
          `Expected result, ${JSON.stringify(result)}, to be, ${JSON.stringify(
            expectedResult,
          )}`,
        );
      }
    });

    it("should build breakdown for discount to be positive if sent as negative", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        discount: "-5.0",
      };

      const expectedResult = {
        item_total: { value: "100.0", currency_code: "USD" },
        shipping: { value: "10.0", currency_code: "USD" },
        discount: { currency_code: "USD", value: "5.00" },
      };
      const result = buildBreakdown({ breakdown, updatedAmounts });

      if (!areObjectsIdentical(expectedResult, result)) {
        throw new Error(
          `Expected result, ${JSON.stringify(result)}, to be, ${JSON.stringify(
            expectedResult,
          )}`,
        );
      }
    });

    it("should build the breakdown request for shipping change patch call with updated amounts present in breakdown", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        handling: "5.0",
      };

      const expectedResult = {
        item_total: { value: "100.0", currency_code: "USD" },
        shipping: { value: "10.0", currency_code: "USD" },
        handling: { currency_code: "USD", value: "5.0" },
      };
      const result = buildBreakdown({ breakdown, updatedAmounts });

      if (!areObjectsIdentical(expectedResult, result)) {
        throw new Error(
          `Expected result, ${JSON.stringify(result)}, to be, ${JSON.stringify(
            expectedResult,
          )}`,
        );
      }
    });

    it("should build the breakdown request for shipping change patch call with updated amounts not present in breakdown", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "USD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "USD",
        },
      });
      const updatedAmounts = {
        handling: "5.0",
      };

      const expectedResult = {
        item_total: { value: "100.0", currency_code: "USD" },
        shipping: { value: "10.0", currency_code: "USD" },
        handling: { currency_code: "USD", value: "5.0" },
      };
      const result = buildBreakdown({ breakdown, updatedAmounts });

      if (!areObjectsIdentical(expectedResult, result)) {
        throw new Error(
          `Expected result, ${JSON.stringify(result)}, to be, ${JSON.stringify(
            expectedResult,
          )}`,
        );
      }
    });

    it("should build the breakdown request for shipping change patch call with updated amounts present in breakdown with correct currency code", () => {
      const breakdown = breakdownKeyChanges({
        itemTotal: {
          value: "100.0",
          currencyCode: "CAD",
        },
        shipping: {
          value: "10.0",
          currencyCode: "CAD",
        },
        handling: {
          value: "1.0",
          currencyCode: "CAD",
        },
      });
      const updatedAmounts = {
        handling: "5.0",
      };

      const expectedResult = {
        item_total: { value: "100.0", currency_code: "CAD" },
        shipping: { value: "10.0", currency_code: "CAD" },
        handling: { value: "5.0", currency_code: "CAD" },
      };
      const result = buildBreakdown({ breakdown, updatedAmounts });

      if (!areObjectsIdentical(expectedResult, result)) {
        throw new Error(
          `Expected result, ${JSON.stringify(result)}, to be, ${JSON.stringify(
            expectedResult,
          )}`,
        );
      }
    });
  });

  describe("convertQueriesToArray", () => {
    const shippingOptions = optionsKeyChanges([
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
    ]);
    const breakdown = breakdownKeyChanges({
      itemTotal: {
        value: "100.0",
        currencyCode: "USD",
      },
      shipping: {
        value: "10.0",
        currencyCode: "USD",
      },
    });

    it("should convert object amount queries to array", () => {
      const queries = {
        [ON_SHIPPING_CHANGE_PATHS.AMOUNT]: {
          op: "replace",
          path: ON_SHIPPING_CHANGE_PATHS.AMOUNT,
          value: {
            value: "110.0",
            currency_code: "USD",
            breakdown,
          },
        },
      };

      const expectedResult = JSON.stringify([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            value: "110.0",
            currency_code: "USD",
            breakdown: {
              item_total: { value: "100.0", currency_code: "USD" },
              shipping: { value: "10.0", currency_code: "USD" },
            },
          },
        },
      ]);
      const result = JSON.stringify(convertQueriesToArray({ queries }));

      if (result !== expectedResult) {
        throw new Error(
          `Expected result to match result. ${JSON.stringify(result)}`,
        );
      }
    });

    it("should convert object options queries to array", () => {
      const queries = {
        [ON_SHIPPING_CHANGE_PATHS.OPTIONS]: {
          op: "replace",
          path: ON_SHIPPING_CHANGE_PATHS.OPTIONS,
          value: shippingOptions,
        },
      };

      const expectedResult = JSON.stringify([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/shipping/options",
          value: [
            {
              id: "SHIP_1234",
              label: "Free Shipping",
              type: "SHIPPING",
              selected: true,
              amount: { value: "0.00", currency_code: "USD" },
            },
            {
              id: "SHIP_123",
              label: "Shipping",
              type: "SHIPPING",
              selected: false,
              amount: { value: "20.00", currency_code: "USD" },
            },
            {
              id: "SHIP_124",
              label: "Overnight",
              type: "SHIPPING",
              selected: false,
              amount: { value: "40.00", currency_code: "USD" },
            },
          ],
        },
      ]);
      const result = JSON.stringify(convertQueriesToArray({ queries }));

      if (result !== expectedResult) {
        throw new Error(
          `Expected result to match result. ${JSON.stringify(result)}`,
        );
      }
    });

    it("should convert object amount and options queries to array", () => {
      const queries = {
        [ON_SHIPPING_CHANGE_PATHS.AMOUNT]: {
          op: "replace",
          path: ON_SHIPPING_CHANGE_PATHS.AMOUNT,
          value: {
            value: "110.0",
            currency_code: "USD",
            breakdown,
          },
        },
        [ON_SHIPPING_CHANGE_PATHS.OPTIONS]: {
          op: "replace",
          path: ON_SHIPPING_CHANGE_PATHS.OPTIONS,
          value: shippingOptions,
        },
      };

      const expectedResult = JSON.stringify([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            value: "110.0",
            currency_code: "USD",
            breakdown: {
              item_total: { value: "100.0", currency_code: "USD" },
              shipping: { value: "10.0", currency_code: "USD" },
            },
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
              selected: true,
              amount: { value: "0.00", currency_code: "USD" },
            },
            {
              id: "SHIP_123",
              label: "Shipping",
              type: "SHIPPING",
              selected: false,
              amount: { value: "20.00", currency_code: "USD" },
            },
            {
              id: "SHIP_124",
              label: "Overnight",
              type: "SHIPPING",
              selected: false,
              amount: { value: "40.00", currency_code: "USD" },
            },
          ],
        },
      ]);
      const result = JSON.stringify(convertQueriesToArray({ queries }));

      if (result !== expectedResult) {
        throw new Error(
          `Expected result to match result. ${JSON.stringify(result)}`,
        );
      }
    });

    it("should update op to replace if add and convert object amount and options queries to array", () => {
      const queries = {
        [ON_SHIPPING_CHANGE_PATHS.AMOUNT]: {
          op: "replace",
          path: ON_SHIPPING_CHANGE_PATHS.AMOUNT,
          value: {
            value: "110.0",
            currency_code: "USD",
            breakdown,
          },
        },
        [ON_SHIPPING_CHANGE_PATHS.OPTIONS]: {
          op: "add",
          path: ON_SHIPPING_CHANGE_PATHS.OPTIONS,
          value: shippingOptions,
        },
      };

      const expectedResult = JSON.stringify([
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            value: "110.0",
            currency_code: "USD",
            breakdown: {
              item_total: { value: "100.0", currency_code: "USD" },
              shipping: { value: "10.0", currency_code: "USD" },
            },
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
              selected: true,
              amount: { value: "0.00", currency_code: "USD" },
            },
            {
              id: "SHIP_123",
              label: "Shipping",
              type: "SHIPPING",
              selected: false,
              amount: { value: "20.00", currency_code: "USD" },
            },
            {
              id: "SHIP_124",
              label: "Overnight",
              type: "SHIPPING",
              selected: false,
              amount: { value: "40.00", currency_code: "USD" },
            },
          ],
        },
      ]);
      const result = JSON.stringify(
        updateOperationForShippingOptions({ queries }),
      );

      if (result !== expectedResult) {
        throw new Error(
          `Expected result to match result. ${JSON.stringify(result)}`,
        );
      }
    });
  });

  describe("updateOptions", () => {
    const shippingOptions = [
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
    ];

    it("should update options with selected option", () => {
      const selectedShippingOption = {
        id: "SHIP_123",
        label: "Shipping",
        type: "SHIPPING",
        selected: true,
        amount: {
          value: "20.00",
          currencyCode: "USD",
        },
      };

      const result = updateShippingOptions({
        option: selectedShippingOption,
        options: shippingOptions,
      });
      result.forEach((option) => {
        if (option.selected && option.label !== "Shipping") {
          throw new Error(`Expected selected option to be SHIP_123.`);
        }
      });
    });
  });
});
