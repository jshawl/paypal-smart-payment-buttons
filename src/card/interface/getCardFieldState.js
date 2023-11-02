/* @flow */

import { kebabToCamelCase, parsedCardType } from "../lib";
import type { CardFieldsState } from "../types";

import { getCardFrames } from "./getCardFrames";
import { isEmpty } from "./isEmpty";

export function getCardFieldState(): CardFieldsState {
  const {
    cardNameFrame,
    cardNumberFrame,
    cardCVVFrame,
    cardExpiryFrame,
    cardPostalFrame,
  } = getCardFrames();
  const optionalFields = {};

  // Optional frames: the idea is to keep the optional frames separate and add the field
  // state as needed
  const cardFrameFields = [cardNameFrame, cardPostalFrame];
  cardFrameFields.forEach((cardFrame) => {
    if (cardFrame) {
      optionalFields[kebabToCamelCase(cardFrame.name)] = {
        isEmpty: isEmpty(cardFrame?.getFieldValue()),
        isValid: cardFrame?.isFieldValid(),
        isPotentiallyValid: cardFrame.isFieldPotentiallyValid(),
        isFocused: cardFrame.isFieldFocused(),
      };
    }
  });

  const cardFieldsState = {
    cards: parsedCardType(cardNumberFrame.getPotentialCardTypes()),
    fields: {
      ...optionalFields,
      cardNumberField: {
        isEmpty: isEmpty(cardNumberFrame.getFieldValue()),
        isValid: cardNumberFrame.isFieldValid(),
        isPotentiallyValid: cardNumberFrame.isFieldPotentiallyValid(),
        isFocused: cardNumberFrame.isFieldFocused(),
      },
      cardExpiryField: {
        isEmpty: isEmpty(cardExpiryFrame.getFieldValue()),
        isValid: cardExpiryFrame.isFieldValid(),
        isPotentiallyValid: cardExpiryFrame.isFieldPotentiallyValid(),
        isFocused: cardExpiryFrame.isFieldFocused(),
      },
      cardCvvField: {
        isEmpty: isEmpty(cardCVVFrame.getFieldValue()),
        isValid: cardCVVFrame.isFieldValid(),
        isPotentiallyValid: cardCVVFrame.isFieldPotentiallyValid(),
        isFocused: cardCVVFrame.isFieldFocused(),
      },
    },
  };
  return cardFieldsState;
}
