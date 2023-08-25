/* @flow */
import { describe, it, expect, beforeEach } from "vitest";

import { getFieldErrors } from ".";

describe("getFieldErrors", () => {
  let fields;

  const alphabetizedComparator = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  beforeEach(() => {
    fields = {
      cardCvvField: {
        isValid: false,
        isEmpty: false,
        isPotentiallyValid: false,
        isFocused: true,
      },
      cardNumberField: {
        isValid: false,
        isEmpty: false,
        isPotentiallyValid: false,
        isFocused: true,
      },
      cardExpiryField: {
        isValid: false,
        isEmpty: false,
        isPotentiallyValid: false,
        isFocused: true,
      },
      cardNameField: {
        isValid: false,
        isEmpty: false,
        isPotentiallyValid: false,
        isFocused: true,
      },
      cardPostalField: {
        isValid: false,
        isEmpty: false,
        isPotentiallyValid: false,
        isFocused: true,
      },
    };
  });

  it("returns an array with invalid error for each field name", () => {
    expect([...getFieldErrors(fields)].sort(alphabetizedComparator)).toEqual(
      [
        "INVALID_CVV",
        "INVALID_NUMBER",
        "INVALID_EXPIRY",
        "INVALID_NAME",
        "INVALID_POSTAL",
      ].sort()
    );
  });

  it("returns an empty array when no fields are passed", () => {
    Object.keys(fields).forEach((field) => {
      if (!fields[field]) {
        return;
      }
      fields[field].isValid = true;
    });
    expect(getFieldErrors(fields)).toStrictEqual([]);
  });

  it("returns an array with invalid error only for invalid fields", () => {
    fields.cardExpiryField.isValid = true;
    fields.cardCvvField.isValid = true;
    expect([...getFieldErrors(fields)].sort(alphabetizedComparator)).toEqual(
      ["INVALID_NUMBER", "INVALID_NAME", "INVALID_POSTAL"].sort()
    );
  });
});
