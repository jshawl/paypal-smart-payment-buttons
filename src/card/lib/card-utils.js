/* eslint-disable flowtype/require-exact-type */
/* @flow */

import { values } from "@krakenjs/belter";

import type { PaymentSourceInput } from "../../api/vault";
import type {
  InputState,
  FieldValidity,
  Card,
  ExtraFields,
  CardType,
  ParsedCardType,
  PaymentSourceCardInput,
  ReformattedPaymentSourceCardInput,
} from "../types";
import {
  CARD_ERRORS,
  CARD_FIELD_TYPE,
  DEFAULT_STYLE,
  FIELD_STYLE,
  FILTER_CSS_SELECTORS,
  FILTER_CSS_VALUES,
  GQL_ERRORS,
  VALID_EXTRA_FIELDS,
  ALLOWED_ATTRIBUTES,
  OPTIONAL_CARD_FIELDS,
} from "../constants";
import { getLogger } from "../../lib";

export const defaultInputState: InputState = {
  inputValue: "",
  maskedInputValue: "",
  cursorStart: 0,
  cursorEnd: 0,
  isFocused: false,
  keyStrokeCount: 0,
  isPotentiallyValid: true,
  isValid: false,
};

export const initFieldValidity: FieldValidity = {
  isValid: false,
  isPotentiallyValid: true,
};

export function splice(str: string, idx: number, insert: string): string {
  return str.slice(0, idx) + insert + str.slice(idx);
}

export function assertType(
  assertion: () => void,
  errorMsg: string,
): void | TypeError {
  if (!assertion) {
    throw new TypeError(errorMsg);
  }
}

export function assertString<T>(...args: T): void | TypeError {
  // $FlowFixMe
  assertType(
    args.every((s) => typeof s === "string"),
    "Expected a string",
  );
}

export function removeSpaces(value: string): string {
  return value.replace(/\s/g, "");
}

// Return the last 4 digits of a valid card number
export function maskValidCard(number: string): string {
  const trimmedValue = removeSpaces(number);
  const lastFour = trimmedValue.slice(-4);
  const maskedNumber = number.replace(/\d/g, "•").slice(0, -4);

  return maskedNumber + lastFour;
}

export function shouldUseZeroPaddedExpiryPattern(
  value: string,
  key: string,
): boolean {
  if (value.length === 0) {
    return false;
  }
  if (value[0] === "1" && key === "/") {
    return true;
  }
  if (value[0] !== "1" && value[0] !== "0") {
    return true;
  }
  if (value[0] === "1") {
    return false;
  }
  return false;
}

// from https://github.com/braintree/inject-stylesheet/blob/main/src/lib/filter-style-values.ts
function isValidValue(value: string | number): boolean {
  return !FILTER_CSS_VALUES.some((regex) => regex.test(String(value)));
}

// from https://github.com/braintree/inject-stylesheet/blob/main/src/lib/validate-selector.ts
function isValidSelector(selector: string): boolean {
  return !FILTER_CSS_SELECTORS.some((regex) => regex.test(selector));
}

export function isValidAttribute(attribute: string): boolean {
  if (!ALLOWED_ATTRIBUTES.includes(attribute.toLocaleLowerCase())) {
    getLogger().warn("attribute_warning", {
      warn: `HTML Attribute "${attribute}" was ignored. See allowed attribute list.`,
    });
    return false;
  }

  return true;
}

export function filterStyle(style: Object): Object {
  const result = {};
  Object.keys(style).forEach((key) => {
    const value = style[key];
    // if the key is pointing to a string or a number, it must be a CSS property
    if (typeof value === "string" || typeof value === "number") {
      // so normalize the property name and filter based on FIELD_STYLE (allow list)
      let property;
      if (FIELD_STYLE[key]) {
        // normalize from camelCase to kebab-case
        property = FIELD_STYLE[key];
        if (isValidValue(value)) {
          result[property] = value;
        }
      } else if (values(FIELD_STYLE).includes(key.toLowerCase())) {
        // normalize to lower case
        property = key.toLowerCase();
        if (isValidValue(value)) {
          result[property] = value;
        }
      } else {
        getLogger().warn("style_warning", {
          warn: `CSS property "${key}" was ignored. See allowed CSS property list.`,
        });
      }
      // if the key is pointing to an object, it must be a CSS selector
    } else if (typeof value === "object") {
      if (isValidSelector(key)) {
        // so normalize the object it's pointing to
        result[key] = filterStyle(value);
      }
    }
  });
  return result;
}

// Converts style object to valid style string
export function styleToString(style: Object = {}): string {
  const s = [];
  Object.keys(style).forEach((key) => {
    const value = style[key];
    if (typeof value === "string" || typeof value === "number") {
      s.push(` ${key}: ${value};`);
    } else if (typeof value === "object") {
      s.push(`${key} {`);
      s.push(styleToString(value));
      s.push("}");
    }
  });
  return s.join("\n");
}

// convert default and custom styles to CSS text
export function getCSSText(
  cardFieldStyle: Object,
  customStyle: Object,
): string {
  const s = [];
  s.push("/* default style */");
  s.push(styleToString(DEFAULT_STYLE));
  s.push(styleToString(cardFieldStyle));
  s.push("/* custom style */");
  s.push(styleToString(filterStyle(customStyle)));
  return s.join("\n");
}

export function isFieldOptional(element: HTMLInputElement): boolean {
  return OPTIONAL_CARD_FIELDS.includes(element.name);
}

// mark the ref's HTMLElement as valid or invalid
export function markValidity(
  ref: Object,
  validity: FieldValidity,
  hasFocus?: boolean,
  touched?: boolean,
) {
  const element: HTMLInputElement = ref?.current?.base;
  if (element) {
    if (isFieldOptional(element) && element.value.length === 0) {
      element.classList.remove("valid");
      element.classList.remove("invalid");
    } else if (validity.isValid || (validity.isPotentiallyValid && hasFocus)) {
      element.classList.add("valid");
      element.classList.remove("invalid");
    } else if (touched) {
      element.classList.add("invalid");
      element.classList.remove("valid");
    }
  }
}

export function removeNonDigits(value: string): string {
  const trimmedValue = removeSpaces(value);
  return trimmedValue.replace(/\D/g, "");
}

export function checkForNonDigits(value: string): boolean {
  return /\D/g.test(removeSpaces(value));
}

export function setErrors({
  isCardEligible,
  isNumberValid,
  isCvvValid,
  isExpiryValid,
  isNameValid,
  isPostalCodeValid,
  gqlErrorsObject = {},
}: {|
  isCardEligible?: boolean,
  isNumberValid?: boolean,
  isCvvValid?: boolean,
  isExpiryValid?: boolean,
  isNameValid?: boolean,
  isPostalCodeValid?: boolean,
  gqlErrorsObject?: {| field: string, errors: [] |},
|}): [$Values<typeof CARD_ERRORS>] | [] {
  const errors = [];
  const { field, errors: gqlErrors } = gqlErrorsObject;

  if (isCardEligible === false) {
    if (field === CARD_FIELD_TYPE.NUMBER && gqlErrors.length) {
      errors.push(...gqlErrors);
    } else {
      errors.push(CARD_ERRORS.INELIGIBLE_CARD_VENDOR);
    }
  }

  if (isNumberValid === false) {
    if (field === CARD_FIELD_TYPE.NUMBER && gqlErrors.length) {
      errors.push(...gqlErrors);
    } else {
      errors.push(CARD_ERRORS.INVALID_NUMBER);
    }
  }

  if (isExpiryValid === false) {
    if (field === CARD_FIELD_TYPE.EXPIRY && gqlErrors.length) {
      errors.push(...gqlErrors);
    } else {
      errors.push(CARD_ERRORS.INVALID_EXPIRY);
    }
  }

  if (isCvvValid === false) {
    if (field === CARD_FIELD_TYPE.CVV && gqlErrors.length) {
      errors.push(...gqlErrors);
    } else {
      errors.push(CARD_ERRORS.INVALID_CVV);
    }
  }

  if (isNameValid === false) {
    if (field === CARD_FIELD_TYPE.NAME && gqlErrors.length) {
      errors.push(...gqlErrors);
    } else {
      errors.push(CARD_ERRORS.INVALID_NAME);
    }
  }

  if (isPostalCodeValid === false) {
    if (field === CARD_FIELD_TYPE.POSTAL && gqlErrors.length) {
      errors.push(...gqlErrors);
    } else {
      errors.push(CARD_ERRORS.INVALID_POSTAL);
    }
  }

  return errors;
}

// Format expity date to MM/YYYY
export function convertDateFormat(date: string): string {
  const trimmedDate = removeSpaces(date);
  const splittedDate = trimmedDate.split("/");
  let formattedDate = trimmedDate;

  if (splittedDate[1] && splittedDate[1].length === 2) {
    splittedDate[1] = `20${splittedDate[1]}`;
    formattedDate = splittedDate.join("/");
  }

  return formattedDate;
}

// Parse errors from ProcessPayment GQL mutation
export function parseGQLErrors(errorsObject: Object): {|
  parsedErrors: $ReadOnlyArray<string>,
  errors: $ReadOnlyArray<Object>,
  errorsMap: Object,
|} {
  const { data } = errorsObject;

  const parsedErrors = [];
  const errors = [];
  const errorsMap = {};

  if (Array.isArray(data) && data.length) {
    data.forEach((e) => {
      const { details } = e;

      if (Array.isArray(details) && details.length) {
        details.forEach((d) => {
          errors.push(d);

          let parsedError;
          if (d.field && d.issue && d.description) {
            parsedError =
              GQL_ERRORS[d.field][d.issue] ?? `${d.issue}: ${d.description}`;
            const field = d.field.split("/").pop();

            if (!errorsMap[field]) {
              errorsMap[field] = [];
            }

            errorsMap[field].push(parsedError);
          } else if (d.issue && d.description) {
            parsedError = GQL_ERRORS[d.issue] ?? `${d.issue}: ${d.description}`;
          }

          if (parsedError) {
            parsedErrors.push(parsedError);
          }
        });
      }
    });
  }

  return {
    errors,
    parsedErrors,
    errorsMap,
  };
}

export function filterExtraFields(extraData: Object): ExtraFields | Object {
  if (!extraData || typeof extraData !== "object" || Array.isArray(extraData)) {
    return {};
  }

  return Object.keys(extraData).reduce((acc, key) => {
    if (VALID_EXTRA_FIELDS.includes(key)) {
      acc[key] = extraData[key];
    }
    return acc;
  }, {});
}

export function parsedCardType(
  potentialCardTypes: $ReadOnlyArray<CardType>,
): $ReadOnlyArray<ParsedCardType> {
  return potentialCardTypes.map(({ type, niceType, code }) => ({
    type,
    niceType,
    code,
  }));
}

export function getContext(win: Object): string {
  return win.xprops?.parent?.uid || win.xprops?.uid;
}

export function cardExpiryToPaymentSourceExpiry(dateString: string): string {
  if (!dateString || typeof dateString !== "string") {
    throw new Error(`can not convert invalid expiry date: ${dateString}`);
  }

  // "2020-12"
  const YYYYmmRegex = "^[0-9]{4}-([1-9]|0[1-9]|1[0-2])$";
  // 12/20 OR 12/2020
  const mmYYYYRegex = "^([1-9]|0[1-9]|1[0-2])/?([0-9]{4}|[0-9]{2})$";

  if (dateString.match(YYYYmmRegex)) {
    return dateString;
  }

  if (dateString.match(mmYYYYRegex)) {
    const [monthString, yearString] = dateString.split("/");

    const formattedYearString =
      yearString.length === 2 ? `20${yearString}` : yearString;
    const formattedMonthString =
      monthString.length === 1 ? `0${monthString}` : monthString;

    return `${formattedYearString}-${formattedMonthString}`;
  }

  throw new Error(`can not convert invalid expiry date: ${dateString}`);
}

export function convertCardToPaymentSource(
  card: Card,
  extraFields: ?ExtraFields,
): PaymentSourceInput {
  const paymentSource = {
    card: {
      number: card.number,
      securityCode: card.cvv,
      expiry: cardExpiryToPaymentSourceExpiry(card.expiry),
    },
  };

  if (extraFields && Object.keys(extraFields).length !== 0) {
    // $FlowIssue
    paymentSource.card.billingAddress = extraFields.billingAddress;
  }

  if (card.name) {
    // $FlowIssue
    paymentSource.card.name = card.name;
  }

  if (card.postalCode) {
    // $FlowIssue
    paymentSource.card.billingAddress = { postalCode: card.postalCode };
  }

  return paymentSource;
}

export function kebabToCamelCase(field: string): string {
  const camelCase = field.split("-");
  camelCase.forEach((word, i) => {
    camelCase[i] =
      i !== 0
        ? word.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
        : word.toLowerCase();
  });
  return camelCase.join("");
}

// Taken from https://github.com/braintree/braintree-web/blob/main/src/lib/camel-case-to-snake-case.js
export function reformatBillingKeys(str: string): string {
  return str
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/([a-z\d])(\d)/g, "$1_$2")
    .toLowerCase();
}

export function reformatPaymentSource(
  paymentSource: PaymentSourceCardInput,
): ReformattedPaymentSourceCardInput | {} {
  return Object.keys(paymentSource).reduce((newObj, key) => {
    const transformedKey = reformatBillingKeys(key);

    if (key === "billingAddress") {
      if (
        paymentSource.billingAddress &&
        Object.keys(paymentSource.billingAddress).length !== 0
      ) {
        newObj.billing_address = {};
        Object.keys(paymentSource.billingAddress).forEach((billingKey) => {
          const snakeCaseBillingKey = reformatBillingKeys(billingKey);
          // $FlowIssue
          newObj.billing_address[snakeCaseBillingKey] =
            paymentSource.billingAddress[billingKey];
        });
      }
    } else {
      newObj[transformedKey] = paymentSource[key];
    }

    return newObj;
  }, {});
}
/* eslint-enable flowtype/require-exact-type */
