/* @flow */

import { FRAME_NAME } from '../../constants';
import { CARD_ERRORS } from '../constants';
import type { Card, CardType } from '../types';
import { checkCardEligibility } from '../lib';

import { getExportsByFrameName } from './getExportsByFrameName';
import { getCardFrames } from './getCardFrames';

export function getCardFields(isVaultFlow?: boolean = false): Card {
  const card = {};
  const cardFrame = getExportsByFrameName(FRAME_NAME.CARD_FIELD);

  if (cardFrame && cardFrame.isFieldValid()) {
    return cardFrame.getFieldValue();
  }

  const {
    cardNumberFrame,
    cardCVVFrame,
    cardExpiryFrame,
    cardNameFrame,
    cardPostalFrame
  } = getCardFrames();

  // 3 Required fields for HCFs purchase
  if (cardNumberFrame && cardNumberFrame.isFieldValid()) {
    const cardNumber: string = cardNumberFrame.getFieldValue();
    const cardType: CardType = cardNumberFrame.getPotentialCardTypes()[0];

    if (checkCardEligibility(cardNumber, cardType, isVaultFlow)) {
      card.number = cardNumber;
    } else {
      throw new Error(CARD_ERRORS.INELIGIBLE_CARD_VENDOR);
    }
  } else {
    throw new Error(CARD_ERRORS.INVALID_NUMBER);
  }

  if (cardCVVFrame && cardCVVFrame.isFieldValid()) {
    card.cvv = cardCVVFrame.getFieldValue();
  } else {
    throw new Error(CARD_ERRORS.INVALID_CVV);
  }

  if (cardExpiryFrame && cardExpiryFrame.isFieldValid()) {
    card.expiry = cardExpiryFrame.getFieldValue();
  } else {
    throw new Error(CARD_ERRORS.INVALID_EXPIRY);
  }

  // cardNameFrame and cardPostalFrame are optional fields so we only want to check the validity if they are rendered and non-blank.
  // Postal code is not available for now, it will be added when billing address fields are complete.
  if (cardNameFrame) {
    const cardNameValue = cardNameFrame.getFieldValue();
    if (cardNameFrame.isFieldValid()) {
      card.name = cardNameValue;
    } else if (cardNameValue.length !== 0) {
      throw new Error(CARD_ERRORS.INVALID_NAME);
    }
  }

  if (cardPostalFrame) {
    const postalCodeValue = cardPostalFrame.getFieldValue();
    if (cardPostalFrame.isFieldValid()) {
      card.name = postalCodeValue;
    } else if (postalCodeValue.length !== 0) {
      throw new Error(CARD_ERRORS.INVALID_POSTAL);
    }
  }

  return card;
}
