/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src"

import { getCardProps, type SaveCardFieldsProps, type LegacyCardProps } from "../props"
import { confirmOrderAPI } from "../../api"
import { hcfTransactionError, hcfTransactionSuccess } from "../logger"
import type { FeatureFlags } from "../../types"
import type { BillingAddress, Card, ExtraFields } from '../types'
import {convertCardToPaymentSource, reformatPaymentSource} from '../lib'
import { SUBMIT_ERRORS } from "../constants"

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

function handleVaultWithoutPurchaseFlow(cardProps: SaveCardFieldsProps, card: Card, extraFields?: ExtraFields): ZalgoPromise<void> {
  return savePaymentSource({
    onApprove: cardProps.onApprove,
    createVaultSetupToken: cardProps.createVaultSetupToken,
    onError: cardProps.onError,
    clientID: cardProps.clientID,
    paymentSource: convertCardToPaymentSource(card, extraFields),
    idToken: cardProps.userIDToken || "",
  });
}

function handlePurchaseFlow(cardProps: LegacyCardProps, card: Card, extraFields: ExtraFields, facilitatorAccessToken: string): ZalgoPromise<void> {
  let orderID;

  return cardProps
    .createOrder()
    .then((id) => {
      if (typeof id?.valueOf() !== "string") {
        throw new TypeError(SUBMIT_ERRORS.ORDER_ID_TYPE_ERROR);
      }
      const payment_source = convertCardToPaymentSource(card, extraFields);
      // eslint-disable-next-line flowtype/no-weak-types
      const data: any = {
        payment_source: {
          // $FlowIssue
          card: reformatPaymentSource(payment_source.card),
        },
      };
      orderID = id;
      return confirmOrderAPI(orderID, data, {
        facilitatorAccessToken,
        partnerAttributionID: "",
      });
    })
    .then(() => {
      // $FlowFixMe
      return cardProps.onApprove({ orderID }, {});
    })
    .then(() => {
      hcfTransactionSuccess({ orderID });
    })
    .catch((error) => {
      if (typeof error === "string") {
        error = new Error(error);
      }
      hcfTransactionError({ error, orderID });
      if (cardProps.onError) {
        cardProps.onError(error);
      }

      throw error;
    });
}

export function submitCardFields({
  facilitatorAccessToken,
  extraFields,
  featureFlags,
}: SubmitCardFieldsOptions): ZalgoPromise<void> {
  const cardProps = getCardProps({
    facilitatorAccessToken,
    featureFlags,
  });

  // $FlowIssue
  const [isPurchaseFlow, isVaultWithoutPurchaseFlow] = [Boolean(cardProps.createOrder), Boolean(cardProps.createVaultSetupToken)];

  resetGQLErrors();

  return ZalgoPromise.try(() => {
    if (!hasCardFields()) {
      throw new Error(SUBMIT_ERRORS.UNABLE_TO_SUBMIT);
    }
    const card = getCardFields(isVaultWithoutPurchaseFlow);

    if (isPurchaseFlow) {
      // $FlowFixMe
      return handlePurchaseFlow(cardProps, card, extraFields, facilitatorAccessToken);
    } else if (isVaultWithoutPurchaseFlow) {
      // $FlowFixMe
      return handleVaultWithoutPurchaseFlow(cardProps, card, extraFields)
    }
  });
}
