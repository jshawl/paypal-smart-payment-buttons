/* @flow */

import { FRAME_NAME } from "../../constants";
import type { ExportsOptions } from "../lib";

import { getExportsByFrameName } from "./getExportsByFrameName";

/* This is a deadlock situation where CardExports<T> returned by getExportsByFrameName has to be a 'Maybe Type' (https://flow.org/en/docs/types/maybe/) for cardFrame, cardNameFrame and cardPostalCode whereas mandatory for the rest of the Frames.
 So adding a flowIgnore to pass the typecheck failures*/

// $FlowIgnore
export function getCardFrames(): {|
   
  cardFrame: ?ExportsOptions,
  cardNumberFrame: ExportsOptions,
  cardCVVFrame: ExportsOptions,
  cardExpiryFrame: ExportsOptions,
  cardNameFrame?: ?ExportsOptions,
  cardPostalFrame?: ?ExportsOptions,
|} {
  const cardFrame = getExportsByFrameName(FRAME_NAME.CARD_FIELD);
  const cardNumberFrame = getExportsByFrameName(FRAME_NAME.CARD_NUMBER_FIELD);
  const cardCVVFrame = getExportsByFrameName(FRAME_NAME.CARD_CVV_FIELD);
  const cardExpiryFrame = getExportsByFrameName(FRAME_NAME.CARD_EXPIRY_FIELD);
  const cardNameFrame = getExportsByFrameName(FRAME_NAME.CARD_NAME_FIELD);
  const cardPostalFrame = getExportsByFrameName(FRAME_NAME.CARD_POSTAL_FIELD);

  return {
    cardFrame,
    // $FlowIgnore
    cardNumberFrame,
    // $FlowIgnore
    cardCVVFrame,
    // $FlowIgnore
    cardExpiryFrame,
    cardNameFrame,
    cardPostalFrame,
  };
}
