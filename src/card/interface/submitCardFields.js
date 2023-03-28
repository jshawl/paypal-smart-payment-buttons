/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src"

import { getCardProps } from "../props"
import { confirmOrderAPI } from "../../api"
import { hcfTransactionError, hcfTransactionSuccess } from "../logger"
import type { FeatureFlags } from "../../types"
import type { BillingAddress } from '../types'
import {convertCardToPaymentSource, reformatPaymentSource} from '../lib'

import { resetGQLErrors } from "./gql"
import { hasCardFields } from "./hasCardFields"
import { getCardFields } from "./getCardFields"
import { savePaymentSource } from "./vault-without-purchase"

type SubmitCardFieldsOptions = {|
  facilitatorAccessToken: string,
  featureFlags: FeatureFlags,
  extraFields?: {|
    billingAddress?: BillingAddress,
  |},
|};

export function submitCardFields({
  facilitatorAccessToken,
  extraFields,
  featureFlags,
}: SubmitCardFieldsOptions): ZalgoPromise<void> {
  const cardProps = getCardProps({
    facilitatorAccessToken,
    featureFlags,
  });

  resetGQLErrors();

  return ZalgoPromise.try(() => {
    if (!hasCardFields()) {
      throw new Error(`Card fields not available to submit`);
    }
    // $FlowIssue
    const isVaultFlow = Boolean(cardProps.createVaultSetupToken);
    const card = getCardFields(isVaultFlow);

    if (isVaultFlow) {
      return savePaymentSource({
        // $FlowFixMe
        onApprove: cardProps.onApprove,
        // $FlowFixMe
        createVaultSetupToken: cardProps.createVaultSetupToken,
        onError: cardProps.onError,
        clientID: cardProps.clientID,
        paymentSource: convertCardToPaymentSource(card, extraFields),
        idToken: cardProps.userIDToken || "",
      });
    }
    let orderID;

    if (cardProps.createOrder) {
      // $FlowFixMe
      return cardProps
      .createOrder()
      .then((id) => {
        if (typeof id?.valueOf() !== "string") {
          throw new TypeError("Expected createOrder to return a promise that resolves with the order ID as a string.");
        }
        const payment_source = convertCardToPaymentSource(card, extraFields)
        // eslint-disable-next-line flowtype/no-weak-types
        const data: any = {
          payment_source: {
            // $FlowIssue
            card: reformatPaymentSource(payment_source.card)
          }
        }
        orderID = id;
        return confirmOrderAPI(orderID, data, {
          facilitatorAccessToken,
          partnerAttributionID: ""
        })
      })
      .then(() => {
        // $FlowFixMe
        return cardProps.onApprove({ orderID }, {})
      })
      .then(() => {
        hcfTransactionSuccess({ orderID });
      })
      .catch((error) => {
        if (typeof error === "string") {  
          error = new Error(error);
        }
        hcfTransactionError({error, orderID});
        if (cardProps.onError) {
          cardProps.onError(error);
        }

        throw error;
      });
    }
  });
}
