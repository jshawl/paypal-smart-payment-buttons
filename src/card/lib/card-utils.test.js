/* @flow */
import { describe, beforeEach, it, expect, vi, test } from "vitest";

import { getLogger } from "../../lib";

import {
  maskValidCard,
  parseGQLErrors,
  filterStyle,
  styleToString,
  filterExtraFields,
  isValidAttribute,
  removeNonDigits,
  checkForNonDigits,
  convertDateFormat,
  getContext,
  markValidity,
  assertType,
  shouldUseZeroPaddedExpiryPattern,
  parsedCardType,
  kebabToCamelCase,
  reformatPaymentSource,
  reformatBillingKeys,
  convertCardToPaymentSource,
  cardExpiryToPaymentSourceExpiry,
} from "./card-utils";

const testCard = "4111111111111111";
const testSecurityCode = "100";
const testName = "Lewis Hamilton";
const testPostalCode = "60647";

const goodShortDate = "03/23";
const goodLongDate = "03/23";
const goodFormattedDate = "2023-03";
const badDate = "030/023";

vi.mock("../../lib/dom");

describe("card utils", () => {
  describe("assertType", () => {
    it("throws an error with the provided message when the assertion criteria is not met", () => {
      function assertNumber() {
        // $FlowFixMe
        assertType(typeof "5" === "number", "Expected a number");
      }

      expect(assertNumber).toThrow(/Expected a number/);
    });
  });

  describe("reformatBillingKeys", () => {
    it("converts single word", () => {
      const input1 = "word";
      const input2 = "Word";
      expect(reformatBillingKeys(input1)).toEqual(input1);
      expect(reformatBillingKeys(input2)).toEqual(input1);
    });

    it("converts multiple words", () => {
      const input1 = "wordToConvert";
      const expectedOutput = "word_to_convert";
      expect(reformatBillingKeys(input1)).toEqual(expectedOutput);
    });

    it("converts word with number", () => {
      const input1 = "addressLine1";
      const expectedOutput = "address_line_1";
      expect(reformatBillingKeys(input1)).toEqual(expectedOutput);
    });
  });

  describe("maskValidCard", () => {
    it("masks all but the last 4 of the card number with •", () => {
      const masked = maskValidCard("12345678901234");

      expect(masked).toBe("••••••••••1234");
    });

    it("retains white space", () => {
      const masked = maskValidCard("1234 5678 901234");

      expect(masked).toBe("•••• •••• ••1234");
    });

    it("does not mask when card number is less than 5 digits", () => {
      expect(maskValidCard("1234")).toBe("1234");
      expect(maskValidCard("123")).toBe("123");
      expect(maskValidCard("12")).toBe("12");
      expect(maskValidCard("1")).toBe("1");
      expect(maskValidCard("")).toBe("");
    });
  });

  describe("convertCardToPaymentSource", () => {
    test.each([
      [
        "basic card",
        { number: testCard, expiry: goodShortDate, cvv: "100" },
        {
          card: {
            number: testCard,
            expiry: goodFormattedDate,
            securityCode: testSecurityCode,
          },
        },
      ],
      [
        "with all fields",
        {
          number: testCard,
          expiry: goodLongDate,
          cvv: "100",
          name: testName,
          postalCode: testPostalCode,
        },
        {
          card: {
            number: testCard,
            expiry: goodFormattedDate,
            securityCode: testSecurityCode,
            name: testName,
            billingAddress: {
              postalCode: testPostalCode,
            },
          },
        },
      ],
    ])(
      "should convert card object to payment source: %s",
      (_, card, paymentSource) => {
        expect(convertCardToPaymentSource(card)).toEqual(paymentSource);
      },
    );

    test("should throw error for bad date", () => {
      expect(() =>
        convertCardToPaymentSource({
          number: testCard,
          expiry: badDate,
          cvv: testSecurityCode,
        }),
      ).toThrowError(`can not convert invalid expiry date: ${badDate}`);
    });
  });

  describe("cardExpiryToPaymentSourceExpiry", () => {
    test("returns the same input string when the input string is already in YYYY-mm format", () => {
      const input = "2023-02";
      expect(cardExpiryToPaymentSourceExpiry(input)).toEqual(input);
    });

    test("converts mm/YYYY input to YYYY-mm format for first month", () => {
      const input1 = "01/2024";
      const input2 = "1/24";
      const expectedOutput = "2024-01";
      expect(cardExpiryToPaymentSourceExpiry(input1)).toEqual(expectedOutput);
      expect(cardExpiryToPaymentSourceExpiry(input2)).toEqual(expectedOutput);
    });

    test("converts mm/YYYY input to YYYY-mm format for a middle month", () => {
      const input1 = "04/2024";
      const input2 = "4/24";
      const expectedOutput = "2024-04";
      expect(cardExpiryToPaymentSourceExpiry(input1)).toEqual(expectedOutput);
      expect(cardExpiryToPaymentSourceExpiry(input2)).toEqual(expectedOutput);
    });

    test("converts mm/YYYY input to YYYY-mm format for last month", () => {
      const input1 = "12/2024";
      const input2 = "12/24";
      const expectedOutput = "2024-12";
      expect(cardExpiryToPaymentSourceExpiry(input1)).toEqual(expectedOutput);
      expect(cardExpiryToPaymentSourceExpiry(input2)).toEqual(expectedOutput);
    });

    test("throws an error when the input string is not in the expected format", () => {
      const input = "2023/02";
      expect(() => {
        cardExpiryToPaymentSourceExpiry(input);
      }).toThrowError(`can not convert invalid expiry date: ${input}`);
    });

    test("throws an error when the input is empty", () => {
      const input = "";
      expect(() => {
        cardExpiryToPaymentSourceExpiry(input);
      }).toThrowError(`can not convert invalid expiry date: ${input}`);
    });
  });

  describe("parseGQLErrors", () => {
    it("should parse an invalid card number error", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "UNPROCESSABLE_ENTITY",
            details: [
              {
                field: "/payment_source/card/number",
                location: "body",
                issue: "VALIDATION_ERROR",
                description: "Invalid card number",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(1);
      expect(parsedErrors[0]).toBe("INVALID_NUMBER");

      expect(errors.length).toBe(1);
      expect(errors[0]?.issue).toBe("VALIDATION_ERROR");

      expect(errorsMap.number).not.toEqual(undefined);
      expect(errorsMap.number.length).toBe(1);
    });

    it("should parse an invalid expiry syntax error", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "INVALID_REQUEST",
            details: [
              {
                field: "/payment_source/card/expiry",
                value: "22-01",
                location: "body",
                issue: "INVALID_PARAMETER_SYNTAX",
                description:
                  "The value of a field does not conform to the expected format.",
              },
              {
                field: "/payment_source/card/expiry",
                value: "22-01",
                location: "body",
                issue: "INVALID_STRING_LENGTH",
                description:
                  "The value of a field is either too short or too long.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(2);
      expect(parsedErrors[0]).toBe("INVALID_EXPIRATION_DATE_FORMAT");
      expect(parsedErrors[1]).toBe("INVALID_EXPIRATION_DATE_LENGTH");

      expect(errors.length).toBe(2);
      expect(errors[0]?.issue).toBe("INVALID_PARAMETER_SYNTAX");
      expect(errors[1]?.issue).toBe("INVALID_STRING_LENGTH");

      expect(errorsMap.expiry).not.toEqual(undefined);
      expect(errorsMap.expiry.length).toBe(2);
    });

    it("should parse an expired card error", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "UNPROCESSABLE_ENTITY",
            details: [
              {
                field: "/payment_source/card/expiry",
                location: "body",
                issue: "CARD_EXPIRED",
                description: "The card is expired.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(1);
      expect(parsedErrors[0]).toBe("CARD_EXPIRED");

      expect(errors.length).toBe(1);
      expect(errors[0]?.issue).toBe("CARD_EXPIRED");

      expect(errorsMap.expiry).not.toEqual(undefined);
      expect(errorsMap.expiry.length).toBe(1);
    });

    it("should parse a missing required field error", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "INVALID_REQUEST",
            details: [
              {
                field: "/payment_source/card/number",
                value: "",
                location: "body",
                issue: "MISSING_REQUIRED_PARAMETER",
                description: "A required field / parameter is missing.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(1);
      expect(parsedErrors[0]).toBe("MISSING_NUMBER");

      expect(errors.length).toBe(1);
      expect(errors[0]?.issue).toBe("MISSING_REQUIRED_PARAMETER");

      expect(errorsMap.number).not.toEqual(undefined);
      expect(errorsMap.number.length).toBe(1);
    });

    it("should parse refused transaction error", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "UNPROCESSABLE_ENTITY",
            details: [
              {
                issue: "TRANSACTION_REFUSED",
                description: "The request was refused.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(1);
      expect(parsedErrors[0]).toBe("TRANSACTION_REJECTED");

      expect(errors.length).toBe(1);
      expect(errors[0]?.issue).toBe("TRANSACTION_REFUSED");

      expect(Object.keys(errorsMap).length).toEqual(0);
    });

    it("should return errors for unhandled (not defined on the constants) cases", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "INVALID_REQUEST",
            details: [
              {
                issue: "PERMISSION_DENIED",
                description:
                  "You do not have permission to access or perform operations on this resource.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(1);
      expect(parsedErrors[0]).toBe(
        "PERMISSION_DENIED: You do not have permission to access or perform operations on this resource.",
      );

      expect(errors.length).toBe(1);
      expect(errors[0]?.issue).toBe("PERMISSION_DENIED");

      expect(Object.keys(errorsMap).length).toEqual(0);
    });
  });

  describe("filterStyle", () => {
    it("normalizes css properties from camelCase to kebab-case", () => {
      const styles = {
        input: {
          paddingTop: "20px",
        },
      };
      const filteredStyles = filterStyle(styles);
      const expectedStyles = {
        input: {
          "padding-top": "20px",
        },
      };
      expect(filteredStyles).toEqual(expectedStyles);
    });
    it("normalizes all css properties to lower case", () => {
      const styles = {
        input: {
          "pAdDiNg-ToP": "20px",
        },
      };
      const filteredStyles = filterStyle(styles);
      const expectedStyles = {
        input: {
          "padding-top": "20px",
        },
      };
      expect(filteredStyles).toEqual(expectedStyles);
    });
    it("excludes css properties that are not on the allowlist and log a warning", () => {
      const styles = {
        input: {
          boxShadow: "20px",
          paddingTop: "20px",
        },
      };
      const originalLoggerWarn = getLogger().warn;
      getLogger().warn = vi.fn();
      const filteredStyles = filterStyle(styles);
      const expectedStyles = {
        input: {
          "padding-top": "20px",
        },
      };
      expect(filteredStyles).toEqual(expectedStyles);
      expect(getLogger().warn).toHaveBeenCalledWith("style_warning", {
        warn: 'CSS property "boxShadow" was ignored. See allowed CSS property list.',
      });
      getLogger().warn = originalLoggerWarn;
    });
  });

  describe("styleToString", () => {
    it("converts a style object to a valid style string", () => {
      const styleObject = {
        input: {
          "font-size": "16 px",
          "font-color": "red",
        },
      };

      const targetString = `input {\n font-size: 16 px;\n font-color: red;\n}`;

      expect(typeof styleObject).toBe("object");

      const styleString = styleToString(styleObject);
      expect(typeof styleString).toBe("string");
      expect(styleString).toBe(targetString);
    });
  });

  describe("filterExtraFields", () => {
    it("should return empty object for invalid data", () => {
      const extraFields = filterExtraFields(123);

      expect(typeof extraFields).toBe("object");
      expect(Object.keys(extraFields).length).toBe(0);
    });

    it("should check for valid object with valid props", () => {
      const extraData = {
        billingAddress: "Av. test, 12324",
        cardHolderName: "Joe Dow",
      };

      const extraFields = filterExtraFields(extraData);

      expect(Object.keys(extraFields).length).toBe(1);
      expect(extraFields.billingAddress).toBe("Av. test, 12324");
    });

    it("should parse an invalid expiry syntax error", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "INVALID_REQUEST",
            details: [
              {
                field: "/payment_source/card/expiry",
                value: "22-01",
                location: "body",
                issue: "INVALID_PARAMETER_SYNTAX",
                description:
                  "The value of a field does not conform to the expected format.",
              },
              {
                field: "/payment_source/card/expiry",
                value: "22-01",
                location: "body",
                issue: "INVALID_STRING_LENGTH",
                description:
                  "The value of a field is either too short or too long.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(2);
      expect(parsedErrors[0]).toBe("INVALID_EXPIRATION_DATE_FORMAT");
      expect(parsedErrors[1]).toBe("INVALID_EXPIRATION_DATE_LENGTH");

      expect(errors.length).toBe(2);
      expect(errors[0]?.issue).toBe("INVALID_PARAMETER_SYNTAX");
      expect(errors[1]?.issue).toBe("INVALID_STRING_LENGTH");

      expect(errorsMap.expiry).not.toEqual(undefined);
      expect(errorsMap.expiry.length).toBe(2);
    });

    it("should parse an expired card error", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "UNPROCESSABLE_ENTITY",
            details: [
              {
                field: "/payment_source/card/expiry",
                location: "body",
                issue: "CARD_EXPIRED",
                description: "The card is expired.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(1);
      expect(parsedErrors[0]).toBe("CARD_EXPIRED");

      expect(errors.length).toBe(1);
      expect(errors[0]?.issue).toBe("CARD_EXPIRED");

      expect(errorsMap.expiry).not.toEqual(undefined);
      expect(errorsMap.expiry.length).toBe(1);
    });

    it("should parse a missing required field error", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "INVALID_REQUEST",
            details: [
              {
                field: "/payment_source/card/number",
                value: "",
                location: "body",
                issue: "MISSING_REQUIRED_PARAMETER",
                description: "A required field / parameter is missing.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(1);
      expect(parsedErrors[0]).toBe("MISSING_NUMBER");

      expect(errors.length).toBe(1);
      expect(errors[0]?.issue).toBe("MISSING_REQUIRED_PARAMETER");

      expect(errorsMap.number).not.toEqual(undefined);
      expect(errorsMap.number.length).toBe(1);
    });

    it("should parse refused transaction error", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "UNPROCESSABLE_ENTITY",
            details: [
              {
                issue: "TRANSACTION_REFUSED",
                description: "The request was refused.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(1);
      expect(parsedErrors[0]).toBe("TRANSACTION_REJECTED");

      expect(errors.length).toBe(1);
      expect(errors[0]?.issue).toBe("TRANSACTION_REFUSED");

      expect(Object.keys(errorsMap).length).toEqual(0);
    });

    it("should return errors for unhandled (not defined on the constants) cases", () => {
      const gqlError = {
        path: ["processPayment"],
        data: [
          {
            code: "INVALID_REQUEST",
            details: [
              {
                issue: "PERMISSION_DENIED",
                description:
                  "You do not have permission to access or perform operations on this resource.",
              },
            ],
          },
        ],
      };

      const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

      expect(parsedErrors.length).toBe(1);
      expect(parsedErrors[0]).toBe(
        "PERMISSION_DENIED: You do not have permission to access or perform operations on this resource.",
      );

      expect(errors.length).toBe(1);
      expect(errors[0]?.issue).toBe("PERMISSION_DENIED");

      expect(Object.keys(errorsMap).length).toEqual(0);
    });
  });

  describe("filterStyle", () => {
    it("normalizes css properties from camelCase to kebab-case", () => {
      const styles = {
        input: {
          paddingTop: "20px",
        },
      };
      const filteredStyles = filterStyle(styles);
      const expectedStyles = {
        input: {
          "padding-top": "20px",
        },
      };
      expect(filteredStyles).toEqual(expectedStyles);
    });
    it("normalizes all css properties to lower case", () => {
      const styles = {
        input: {
          "pAdDiNg-ToP": "20px",
        },
      };
      const filteredStyles = filterStyle(styles);
      const expectedStyles = {
        input: {
          "padding-top": "20px",
        },
      };
      expect(filteredStyles).toEqual(expectedStyles);
    });
    it("excludes css properties that are not on the allowlist and log a warning", () => {
      const styles = {
        input: {
          boxShadow: "20px",
          paddingTop: "20px",
        },
      };
      const originalLoggerWarn = getLogger().warn;
      getLogger().warn = vi.fn();
      const filteredStyles = filterStyle(styles);
      const expectedStyles = {
        input: {
          "padding-top": "20px",
        },
      };
      expect(filteredStyles).toEqual(expectedStyles);
      expect(getLogger().warn).toHaveBeenCalledWith("style_warning", {
        warn: 'CSS property "boxShadow" was ignored. See allowed CSS property list.',
      });
      getLogger().warn = originalLoggerWarn;
    });
  });

  describe("styleToString", () => {
    it("converts a style object to a valid style string", () => {
      const styleObject = {
        input: {
          "font-size": "16 px",
          "font-color": "red",
        },
      };

      const targetString = `input {\n font-size: 16 px;\n font-color: red;\n}`;

      expect(typeof styleObject).toBe("object");

      const styleString = styleToString(styleObject);
      expect(typeof styleString).toBe("string");
      expect(styleString).toBe(targetString);
    });
  });

  it("should return errors for unhandled (not defined on the constants) cases", () => {
    const gqlError = {
      path: ["processPayment"],
      data: [
        {
          code: "INVALID_REQUEST",
          details: [
            {
              issue: "PERMISSION_DENIED",
              description:
                "You do not have permission to access or perform operations on this resource.",
            },
          ],
        },
      ],
    };

    const { parsedErrors, errors, errorsMap } = parseGQLErrors(gqlError);

    expect(parsedErrors.length).toBe(1);
    expect(parsedErrors[0]).toBe(
      "PERMISSION_DENIED: You do not have permission to access or perform operations on this resource.",
    );

    expect(errors.length).toBe(1);
    expect(errors[0]?.issue).toBe("PERMISSION_DENIED");

    expect(Object.keys(errorsMap).length).toEqual(0);
  });
});

describe("styleToString", () => {
  it("should stringify a style object into a valid style string", () => {
    const objectStyle = {
      height: "60px",
      padding: "10px",
      fontSize: "18px",
      fontFamily: '"Open Sans", sans-serif',
      transition: "all 0.5s ease-out",
    };
    const stringStyle = styleToString(objectStyle);

    // $FlowIssue doesn't know about replaceAll
    expect(stringStyle.trim().replaceAll("\n", "")).toEqual(
      'height: 60px; padding: 10px; fontSize: 18px; fontFamily: "Open Sans", sans-serif; transition: all 0.5s ease-out;'.trim(),
    );
  });
});

describe("filterExtraFields", () => {
  it("should return empty object for invalid data", () => {
    const extraFields = filterExtraFields(123);

    expect(typeof extraFields).toBe("object");
    expect(Object.keys(extraFields).length).toBe(0);
  });

  it("should check for valid object with valid props", () => {
    const extraData = {
      billingAddress: "Av. test, 12324",
      cardHolderName: "Joe Dow",
    };

    const extraFields = filterExtraFields(extraData);

    expect(Object.keys(extraFields).length).toBe(1);
    expect(extraFields.billingAddress).toBe("Av. test, 12324");
  });

  describe("isValidAttribute", () => {
    it("should return true if the attribute name is valid", () => {
      expect(isValidAttribute("aria-invalid")).toBe(true);
      expect(isValidAttribute("Aria-Invalid")).toBe(true);
      expect(isValidAttribute("aria-required")).toBe(true);
      expect(isValidAttribute("disabled")).toBe(true);
      expect(isValidAttribute("placeholder")).toBe(true);
    });

    it("should return false and log a warning if the attribute name is not valid", () => {
      const originalLoggerWarn = getLogger().warn;
      getLogger().warn = vi.fn();
      expect(isValidAttribute("invalid")).toBe(false);
      expect(getLogger().warn).toHaveBeenCalledWith("attribute_warning", {
        warn: 'HTML Attribute "invalid" was ignored. See allowed attribute list.',
      });
      getLogger().warn = originalLoggerWarn;
    });
  });

  describe("removeNonDigits", () => {
    it("should remove non-digits", () => {
      expect(removeNonDigits("abc123")).toBe("123");
    });
  });

  describe("checkForNonDigits", () => {
    it("should check for non-digits", () => {
      expect(checkForNonDigits("abc123")).toBe(true);
      expect(checkForNonDigits("123123")).toBe(false);
    });
  });

  describe("convertDateFormat", () => {
    it("should format the date as MM/YYYY", () => {
      expect(convertDateFormat("11/23")).toBe("11/2023");
      expect(convertDateFormat("11 / 23")).toBe("11/2023");
      expect(convertDateFormat("11 / 2023")).toBe("11/2023");
    });
  });

  describe("getContext", () => {
    beforeEach(() => {
      window.xprops = {};
    });

    it("should return the UID of the component", () => {
      window.xprops.uid = "abc123";
      expect(getContext(window)).toBe("abc123");
    });

    it("should return the UID of the parent of the component", () => {
      window.xprops.uid = "abc123";
      window.xprops.parent = {
        uid: "xyz789",
      };
      expect(getContext(window)).toBe("xyz789");
    });
  });

  describe("markValidity", () => {
    it("marks the refs HTMLelement as valid when isValid is true, it has focus, and it has been touched", () => {
      const element = document.createElement("div");

      const ref = {
        current: {
          base: element,
        },
      };

      const validity = {
        isValid: true,
        isPotentiallyValid: false,
      };

      const hasFocus = true;

      const touched = true;

      markValidity(ref, validity, hasFocus, touched);

      expect(element.classList.contains("valid")).toBe(true);
    });

    it("marks the refs HTMLelement as invalid when isValid is false, it does not have focus, and it has been touched", () => {
      const element = document.createElement("div");

      const ref = {
        current: {
          base: element,
        },
      };

      const validity = {
        isValid: false,
        isPotentiallyValid: true,
      };

      const hasFocus = false;

      const touched = true;

      markValidity(ref, validity, hasFocus, touched);

      expect(element.classList.contains("invalid")).toBe(true);
      expect(element.classList.contains("valid")).toBe(false);
    });

    it("marks the refs HTMLelement as neither valid or invalid. isValid, isPotentiallyValid, hasFocus, and touched are all false", () => {
      const element = document.createElement("div");

      const ref = {
        current: {
          base: element,
        },
      };

      const validity = {
        isValid: false,
        isPotentiallyValid: false,
      };

      const hasFocus = false;

      const touched = false;

      markValidity(ref, validity, hasFocus, touched);

      expect(element.classList.contains("invalid")).toBe(false);
      expect(element.classList.contains("valid")).toBe(false);
    });

    it("marks the refs HTMLelement as invalid when not valid, potentiallyValid, or focused but has been touched", () => {
      const element = document.createElement("div");

      const ref = {
        current: {
          base: element,
        },
      };

      const validity = {
        isValid: false,
        isPotentiallyValid: false,
      };

      const hasFocus = false;

      const touched = true;

      markValidity(ref, validity, hasFocus, touched);

      expect(element.classList.contains("invalid")).toBe(true);
      expect(element.classList.contains("valid")).toBe(false);
    });

    it("marks the refs HTMLelement as valid when focused and potentiallyValid, but not valid or touched", () => {
      const element = document.createElement("div");

      const ref = {
        current: {
          base: element,
        },
      };

      const validity = {
        isValid: false,
        isPotentiallyValid: true,
      };

      const hasFocus = true;

      const touched = false;

      markValidity(ref, validity, hasFocus, touched);

      expect(element.classList.contains("invalid")).toBe(false);
      expect(element.classList.contains("valid")).toBe(true);
    });

    it("marks the refs HTMLelement as valid when isValid and potentiallyValid, but not focused or touched", () => {
      const element = document.createElement("div");

      const ref = {
        current: {
          base: element,
        },
      };

      const validity = {
        isValid: true,
        isPotentiallyValid: true,
      };

      const hasFocus = false;

      const touched = false;

      markValidity(ref, validity, hasFocus, touched);

      expect(element.classList.contains("invalid")).toBe(false);
      expect(element.classList.contains("valid")).toBe(true);
    });

    it("marks the refs HTMLelement as valid when isValid, potentiallyValid, and focused but not touched", () => {
      const element = document.createElement("div");

      const ref = {
        current: {
          base: element,
        },
      };

      const validity = {
        isValid: true,
        isPotentiallyValid: true,
      };

      const hasFocus = true;

      const touched = false;

      markValidity(ref, validity, hasFocus, touched);

      expect(element.classList.contains("invalid")).toBe(false);
      expect(element.classList.contains("valid")).toBe(true);
    });

    it("removes valid and invalid class from element when field is optional and blank", () => {
      const element = document.createElement("input");
      element.name = "name";
      element.value = "";

      const ref = {
        current: {
          base: element,
        },
      };

      const validity = {
        isValid: false,
        isPotentiallyValid: true,
      };

      const hasFocus = false;
      const touched = true;
      markValidity(ref, validity, hasFocus, touched);

      expect(element.classList.contains("invalid")).toBe(false);
      expect(element.classList.contains("valid")).toBe(false);
    });

    it("marks HTMLElement as invalid when field is required and blank", () => {
      const element = document.createElement("input");
      element.name = "requiredField";
      element.value = "";

      const ref = {
        current: {
          base: element,
        },
      };

      const validity = {
        isValid: false,
        isPotentiallyValid: true,
      };

      const hasFocus = false;
      const touched = true;
      markValidity(ref, validity, hasFocus, touched);

      expect(element.classList.contains("invalid")).toBe(true);
      expect(element.classList.contains("valid")).toBe(false);
    });
  });

  describe("shouldUseZeroPaddedExpiryPattern", () => {
    it("should return false if the value is an empty string", () => {
      const result = shouldUseZeroPaddedExpiryPattern("", "backspace");

      expect(result).toBe(false);
    });

    it("should return true if the first digit is a 1 and the key typed is a forward slash", () => {
      const result = shouldUseZeroPaddedExpiryPattern("1", "/");

      expect(result).toBe(true);
    });

    it("should return true if the first digit is 2-9", () => {
      const result = shouldUseZeroPaddedExpiryPattern("2", "2");

      expect(result).toBe(true);
    });

    it("should return false if the first digit is a 1", () => {
      const result = shouldUseZeroPaddedExpiryPattern("1", "2");

      expect(result).toBe(false);
    });

    it("should default to false", () => {
      const result = shouldUseZeroPaddedExpiryPattern("0", "5");

      expect(result).toBe(false);
    });
  });

  describe("parsedCardType", () => {
    it("returns only the type, niceType, and code objecs returned from the card validator module", () => {
      const cardType = [
        {
          niceType: "Visa",
          type: "visa",
          patterns: [4],
          matchStrength: 1,
          gaps: [4, 8, 12],
          lengths: [16, 18, 19],
          code: {
            name: "CVV",
            size: 3,
          },
        },
      ];

      expect(parsedCardType(cardType)).toStrictEqual([
        {
          niceType: "Visa",
          type: "visa",
          code: {
            name: "CVV",
            size: 3,
          },
        },
      ]);
    });
  });

  describe("kebabToCamelCase", () => {
    it("converts a string from kebab-case to camelCase", () => {
      const string = "kebab-case-string";
      expect(kebabToCamelCase(string)).toStrictEqual("kebabCaseString");
      expect(kebabToCamelCase("string")).toStrictEqual("string");
      expect(kebabToCamelCase("")).toStrictEqual("");
      expect(kebabToCamelCase("HELLO-WORLD")).toStrictEqual("helloWorld");
      expect(kebabToCamelCase("HELLOWORLD")).toStrictEqual("helloworld");
      expect(kebabToCamelCase("hELlO-W1rLd")).toStrictEqual("helloW1rld");
    });
  });

  describe("reformatPaymentSource", () => {
    it("should convert a payment source object from camelCase to snake_case", () => {
      const paymentSource = {
        number: "4111111111111111",
        expiry: "2024-01",
        name: "John Doe",
        securityCode: "123",
        billingAddress: {
          postalCode: "12345",
          addressLine1: "123 s Main St",
          countryCode: "US",
        },
      };

      const reformatted_payment_source = {
        number: "4111111111111111",
        expiry: "2024-01",
        name: "John Doe",
        security_code: "123",
        billing_address: {
          postal_code: "12345",
          address_line_1: "123 s Main St",
          country_code: "US",
        },
      };

      expect(reformatPaymentSource(paymentSource)).toStrictEqual(
        reformatted_payment_source,
      );
    });

    it("should remove billingAddress from payment source object when undefined", () => {
      const paymentSource = {
        number: "4111111111111111",
        expiry: "2024-01",
        name: "John Doe",
        securityCode: "123",
        billingAddress: undefined,
      };

      const reformatted_payment_source = {
        number: "4111111111111111",
        expiry: "2024-01",
        name: "John Doe",
        security_code: "123",
      };

      expect(reformatPaymentSource(paymentSource)).toStrictEqual(
        reformatted_payment_source,
      );
    });

    it("should remove billingAddress from payment source object when empty", () => {
      const paymentSource = {
        number: "4111111111111111",
        expiry: "2024-01",
        name: "John Doe",
        securityCode: "123",
        billingAddress: {},
      };

      const reformatted_payment_source = {
        number: "4111111111111111",
        expiry: "2024-01",
        name: "John Doe",
        security_code: "123",
      };
      // $FlowIssue
      expect(reformatPaymentSource(paymentSource)).toStrictEqual(
        reformatted_payment_source,
      );
    });
  });
});
