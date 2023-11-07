/* @flow */
import type {
  Breakdown,
  CheckoutBreakdown,
  CheckoutShippingOption,
  ShippingOption,
} from "../types";

import { type Query, ON_SHIPPING_CHANGE_PATHS } from "./onShippingChange";

export const calculateTotalFromShippingBreakdownAmounts = ({
  breakdown,
  updatedAmounts,
}: {|
  breakdown: Breakdown,
  updatedAmounts: {| [string]: ?string |},
|}): string => {
  let newAmount = 0;
  const updatedAmountKeys = Object.keys(updatedAmounts) || [];
  const discountKeys = ["shipping_discount", "discount"];

  Object.keys(breakdown).forEach((item) => {
    if (updatedAmountKeys.indexOf(item) !== -1) {
      if (discountKeys.includes(item)) {
        newAmount -= Math.abs(parseFloat(updatedAmounts[item]));
      } else {
        newAmount += parseFloat(updatedAmounts[item]);
      }
    } else {
      if (discountKeys.includes(item)) {
        newAmount -= Math.abs(parseFloat(breakdown[item]?.value));
      } else {
        newAmount += parseFloat(breakdown[item]?.value);
      }
    }
  });

  updatedAmountKeys.forEach((key) => {
    if (!breakdown[key]) {
      if (updatedAmounts[key]) {
        if (discountKeys.includes(key)) {
          newAmount -= Math.abs(parseFloat(updatedAmounts[key]));
        } else {
          newAmount += parseFloat(updatedAmounts[key]);
        }
      }
    }
  });

  return newAmount.toFixed(2);
};

export const optionsKeyChanges = (
  options: $ReadOnlyArray<CheckoutShippingOption>,
): $ReadOnlyArray<ShippingOption> => {
  const ordersV2Options = [];

  options.forEach((element) => {
    const shippingOption = {
      ...element,
      amount: {
        value: element.amount.value,
        currency_code: element.amount.currencyCode,
      },
    };

    ordersV2Options.push(shippingOption);
  });

  return ordersV2Options;
};

export const breakdownKeyChanges = (
  breakdown: CheckoutBreakdown,
): Breakdown => {
  const ordersV2Transform = {
    ...(breakdown.discount
      ? {
          discount: {
            value: breakdown.discount.value,
            currency_code: breakdown.discount.currencyCode,
          },
        }
      : undefined),
    ...(breakdown.handling
      ? {
          handling: {
            value: breakdown.handling.value,
            currency_code: breakdown.handling.currencyCode,
          },
        }
      : undefined),
    ...(breakdown.insurance
      ? {
          insurance: {
            value: breakdown.insurance.value,
            currency_code: breakdown.insurance.currencyCode,
          },
        }
      : undefined),
    ...(breakdown.itemTotal
      ? {
          item_total: {
            value: breakdown.itemTotal.value,
            currency_code: breakdown.itemTotal.currencyCode,
          },
        }
      : undefined),
    ...(breakdown.shipping
      ? {
          shipping: {
            value: breakdown.shipping.value,
            currency_code: breakdown.shipping.currencyCode,
          },
        }
      : undefined),
    // $FlowFixMe
    ...(breakdown.shippingDiscount
      ? {
          shipping_discount: {
            value: breakdown.shippingDiscount.value,
            currency_code: breakdown.shippingDiscount.currencyCode,
          },
        }
      : undefined),
    ...(breakdown.taxTotal
      ? {
          tax_total: {
            value: breakdown.taxTotal.value,
            currency_code: breakdown.taxTotal.currencyCode,
          },
        }
      : undefined),
  };

  return ordersV2Transform;
};

export const buildBreakdown = ({
  breakdown = {},
  updatedAmounts = {},
}: {|
  breakdown: Breakdown,
  updatedAmounts: {| [string]: ?string |},
|}): Breakdown => {
  const discountKeys = ["shipping_discount", "discount"];
  const updatedAmountKeys = Object.keys(updatedAmounts);

  // $FlowFixMe
  const currency_code = Object.values(breakdown)[0]?.currency_code;

  updatedAmountKeys.forEach((key) => {
    if (!breakdown[key]) {
      if (updatedAmounts[key]) {
        breakdown[key] = {
          currency_code,
          value:
            updatedAmounts[key] && discountKeys.includes(key)
              ? Math.abs(parseFloat(updatedAmounts[key])).toFixed(2)
              : updatedAmounts[key],
        };
      }
    } else {
      breakdown[key].value = updatedAmounts[key];
    }
  });

  return breakdown;
};

export const convertQueriesToArray = ({
  queries,
}: {|
  queries: {| [$Values<typeof ON_SHIPPING_CHANGE_PATHS>]: Query |},
|}): $ReadOnlyArray<Query> => {
  // $FlowFixMe
  return Object.values(queries) || [];
};

export const updateShippingOptions = ({
  option,
  options,
}: {|
  option: CheckoutShippingOption,
  options: $ReadOnlyArray<CheckoutShippingOption>,
|}): $ReadOnlyArray<CheckoutShippingOption> => {
  const updatedOptions = [];

  options.forEach((opt) => {
    if (!opt.id) {
      throw new Error(`Must provide an id with each shipping option.`);
    }

    if (opt.id === option.id) {
      option.selected = true;
      updatedOptions.push(option);
    } else {
      opt.selected = false;
      updatedOptions.push(opt);
    }
  });

  return updatedOptions;
};

export const updateOperationForShippingOptions = ({
  queries,
}: {|
  queries: {| [$Values<typeof ON_SHIPPING_CHANGE_PATHS>]: Query |},
|}): $ReadOnlyArray<Query> => {
  if (queries[ON_SHIPPING_CHANGE_PATHS.OPTIONS]) {
    queries[ON_SHIPPING_CHANGE_PATHS.OPTIONS].op = "replace";
  }

  return convertQueriesToArray({ queries });
};
