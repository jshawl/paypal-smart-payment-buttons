/* @flow */

import { getCardFrames } from "./getCardFrames";

export function hasCardFields(): boolean {
  const { cardFrame, cardNumberFrame, cardCVVFrame, cardExpiryFrame } =
    getCardFrames();

  return Boolean(
    cardFrame || (cardNumberFrame && cardCVVFrame && cardExpiryFrame),
  );
}
