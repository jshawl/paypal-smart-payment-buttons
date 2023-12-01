/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { memoize } from "@krakenjs/belter/src";
import { INTENT, FPTI_KEY } from "@paypal/sdk-constants/src";

import { getLogger, promiseNoop } from "../lib";
import { FPTI_TRANSITION, FPTI_CONTEXT_TYPE } from "../constants";
import { getOrder, type OrderResponse } from "../api";
import type { FeatureFlags, Experiments } from "../types";

import { redirect } from "./utils";
import type { CreateOrder } from "./createOrder";
import type { OnError } from "./onError";

export type OnCompleteData = {|
  payerID?: ?string,
  paymentID?: ?string,
  billingToken?: ?string,
  subscriptionID?: ?string,
  buyerAccessToken?: ?string,
  authCode?: ?string,
  forceRestAPI?: boolean,
  paymentMethodToken?: string,
|};

export type OnComplete = (OnCompleteData) => ZalgoPromise<void>;

export type XOnCompleteData = {|
  orderID: string,
  intent: $Values<typeof INTENT>,
|};

export type XonCompleteOrderActions = {|
  get: () => ZalgoPromise<OrderResponse>,
|};

export type XOnCompleteActions = {|
  order: XonCompleteOrderActions,
  redirect: (string) => ZalgoPromise<void>,
|};
export type XOnComplete = (
  XOnCompleteData,
  XOnCompleteActions,
) => ZalgoPromise<void>;

type OnCompleteActionOptions = {|
  orderID: string,
  facilitatorAccessToken: string,
  buyerAccessToken: ?string,
  partnerAttributionID: ?string,
  forceRestAPI: boolean,
  onError: OnError,
  experiments: Experiments,
|};

type GetOnCompleteOptions = {|
  intent: $Values<typeof INTENT>,
  onComplete: ?XOnComplete,
  partnerAttributionID: ?string,
  onError: OnError,
  clientID: string,
  facilitatorAccessToken: string,
  createOrder: CreateOrder,
  featureFlags: FeatureFlags,
  experiments: Experiments,
|};

const buildOnCompleteActions = ({
  orderID,
  facilitatorAccessToken,
  buyerAccessToken,
  partnerAttributionID,
  forceRestAPI,
  experiments,
}: OnCompleteActionOptions): XOnCompleteActions => {
  const get = memoize(() => {
    return getOrder(orderID, {
      facilitatorAccessToken,
      buyerAccessToken,
      partnerAttributionID,
      forceRestAPI,
      experiments,
    }).finally(get.reset);
  });

  return {
    order: {
      get,
    },
    redirect,
  };
};

export function getOnComplete({
  intent,
  onComplete,
  partnerAttributionID,
  onError,
  facilitatorAccessToken,
  createOrder,
  featureFlags,
  experiments,
}: GetOnCompleteOptions): OnComplete {
  if (!onComplete) {
    return promiseNoop;
  }

  return memoize(
    ({
      buyerAccessToken,
      forceRestAPI = featureFlags.isLsatUpgradable,
    }: OnCompleteData) => {
      return createOrder().then((orderID) => {
        getLogger()
          .info("button_complete")
          .track({
            [FPTI_KEY.TRANSITION]: FPTI_TRANSITION.CHECKOUT_COMPLETE,
            [FPTI_KEY.EVENT_NAME]: FPTI_TRANSITION.CHECKOUT_COMPLETE,
            [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.ORDER_ID,
            [FPTI_KEY.TOKEN]: orderID,
            [FPTI_KEY.CONTEXT_ID]: orderID,
          })
          .flush();
        const actions = buildOnCompleteActions({
          orderID,
          facilitatorAccessToken,
          buyerAccessToken,
          partnerAttributionID,
          onError,
          forceRestAPI,
          experiments,
        });

        return onComplete({ orderID, intent }, actions).catch((err) => {
          return ZalgoPromise.try(() => {
            return onError(err);
          }).then(() => {
            throw err;
          });
        });
      });
    },
  );
}
