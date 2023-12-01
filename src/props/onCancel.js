/* @flow */

import { memoize } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { FPTI_KEY } from "@paypal/sdk-constants/src";

import { getLogger, promiseNoop } from "../lib";
import { FPTI_TRANSITION, FPTI_CONTEXT_TYPE } from "../constants";

import { redirect } from "./utils";
import type { CreateOrder } from "./createOrder";
import type { XOnError } from "./onError";

export type XOnCancelDataType = {|
  orderID: string,
|};

export type XOnCancelActionsType = {||};

export type XOnCancel = (
  XOnCancelDataType,
  XOnCancelActionsType,
) => ZalgoPromise<void>;

export function buildXOnCancelData({
  orderID,
}: {|
  orderID: string,
|}): XOnCancelDataType {
  return {
    orderID,
  };
}

export function buildXOnCancelActions(): XOnCancelActionsType {
  // $FlowFixMe
  return {
    redirect,
  };
}

export type OnCancel = () => ZalgoPromise<void>;

type OnCancelXProps = {|
  onCancel: XOnCancel,
  onError: XOnError,
|};

export function getOnCancel(
  { onCancel = promiseNoop, onError }: OnCancelXProps,
  { createOrder }: {| createOrder: CreateOrder |},
): OnCancel {
  return memoize(() => {
    return createOrder()
      .then((orderID) => {
        getLogger()
          .info("button_cancel")
          .track({
            [FPTI_KEY.TRANSITION]: FPTI_TRANSITION.CHECKOUT_CANCEL,
            [FPTI_KEY.EVENT_NAME]: FPTI_TRANSITION.CHECKOUT_CANCEL,
            [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.ORDER_ID,
            [FPTI_KEY.TOKEN]: orderID,
            [FPTI_KEY.CONTEXT_ID]: orderID,
          })
          .flush();

        return onCancel(
          buildXOnCancelData({ orderID }),
          buildXOnCancelActions(),
        );
      })
      .catch((err) => {
        return onError(err);
      });
  });
}
