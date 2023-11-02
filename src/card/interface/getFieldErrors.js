/* @flow */

import { FRAME_NAME } from "../../constants";
import { CARD_ERRORS } from "../constants";
import { kebabToCamelCase } from "../lib";
import type { FieldsState } from "../types";

export const getFieldErrors = (
  fields: FieldsState,
): [$Values<typeof CARD_ERRORS>] | [] => {
  const errors = [];
  Object.keys(fields).forEach((field) => {
    if (fields[field] && !fields[field].isValid) {
      switch (field) {
        case kebabToCamelCase(FRAME_NAME.CARD_NAME_FIELD):
          errors.push(CARD_ERRORS.INVALID_NAME);
          break;
        case kebabToCamelCase(FRAME_NAME.CARD_NUMBER_FIELD):
          errors.push(CARD_ERRORS.INVALID_NUMBER);
          break;
        case kebabToCamelCase(FRAME_NAME.CARD_EXPIRY_FIELD):
          errors.push(CARD_ERRORS.INVALID_EXPIRY);
          break;
        case kebabToCamelCase(FRAME_NAME.CARD_CVV_FIELD):
          errors.push(CARD_ERRORS.INVALID_CVV);
          break;
        case kebabToCamelCase(FRAME_NAME.CARD_POSTAL_FIELD):
          errors.push(CARD_ERRORS.INVALID_POSTAL);
          break;
        default:
        // noop
      }
    }
  });
  return errors;
};
