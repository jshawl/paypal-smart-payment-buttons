/* @flow */

import { getCardFrames } from "./getCardFrames";

export function resetGQLErrors(): void {
  const { cardFrame, cardNumberFrame, cardExpiryFrame, cardCVVFrame } =
    getCardFrames();

  if (cardFrame) {
    cardFrame.resetGQLErrors();
  }

  if (cardNumberFrame) {
    cardNumberFrame.resetGQLErrors();
  }

  if (cardExpiryFrame) {
    cardExpiryFrame.resetGQLErrors();
  }

  if (cardCVVFrame) {
    cardCVVFrame.resetGQLErrors();
  }
}

export function emitGqlErrors(errorsMap: Object): void {
  const { cardFrame, cardNumberFrame, cardExpiryFrame, cardCVVFrame } =
    getCardFrames();

  const { number, expiry, security_code } = errorsMap;

  if (cardFrame) {
    let cardFieldError = { field: "", errors: [] };

    if (number) {
      cardFieldError = { field: "number", errors: number };
    }

    if (expiry) {
      cardFieldError = { field: "expiry", errors: expiry };
    }

    if (security_code) {
      cardFieldError = { field: "cvv", errors: security_code };
    }

    cardFrame.setGqlErrors(cardFieldError);
  }

  if (cardNumberFrame && number) {
    cardNumberFrame.setGqlErrors({ field: "number", errors: number });
  }

  if (cardExpiryFrame && expiry) {
    cardExpiryFrame.setGqlErrors({ field: "expiry", errors: expiry });
  }

  if (cardCVVFrame && security_code) {
    cardCVVFrame.setGqlErrors({ field: "cvv", errors: security_code });
  }
}
