/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { getCardProps, type PurchaseFlowCardProps, type VaultWithoutPurchaseFlowCardProps } from "../props"
import { confirmOrderAPI } from "../../api"
import { hcfTransactionError, hcfTransactionSuccess, hcfFieldsSubmit } from "../logger"
import type { FeatureFlags } from "../../types"
import type { BillingAddress, Card, ExtraFields } from '../types'
import {convertCardToPaymentSource, reformatPaymentSource} from '../lib'
import { SUBMIT_ERRORS } from "../constants"
import { PAYMENT_FLOWS } from "../../constants";

import { resetGQLErrors } from "./gql";
import { hasCardFields } from "./hasCardFields";
import { getCardFields } from "./getCardFields";
import { savePaymentSource } from "./vault-without-purchase";

type SubmitCardFieldsOptions = {|
  facilitatorAccessToken: string,
  featureFlags: FeatureFlags,
  extraFields?: {|
    billingAddress?: BillingAddress,
  |},
  experiments: {|
    hostedCardFields: boolean,
  |},
|};

function handleVaultWithoutPurchaseFlow(
  cardProps: VaultWithoutPurchaseFlowCardProps,
  card: Card,
  extraFields?: ExtraFields
): ZalgoPromise<void> {
  return savePaymentSource({
    onApprove: cardProps.onApprove,
  // $FlowFixMe need to rethink how to pass down these props
    createVaultSetupToken: cardProps.createVaultSetupToken,
    onError: cardProps.onError,
    clientID: cardProps.clientID,
    paymentSource: convertCardToPaymentSource(card, extraFields),
  });
}

function handlePurchaseFlow(
  cardProps: PurchaseFlowCardProps,
  card: Card,
  extraFields: ?ExtraFields,
  facilitatorAccessToken: string
): ZalgoPromise<void> {
  let orderID;

  return cardProps
  // $FlowFixMe need to rethink how to pass down these props
    .createOrder()
    .then((id) => {
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
  experiments,
}: SubmitCardFieldsOptions): ZalgoPromise<void> {
  const cardProps = getCardProps({
    facilitatorAccessToken,
    featureFlags,
    experiments,
  });

  hcfFieldsSubmit({
    hcfSessionID: cardProps.hcfSessionID,
  });
  resetGQLErrors();

  return ZalgoPromise.try(() => {
    if (!hasCardFields()) {
      throw new Error(SUBMIT_ERRORS.UNABLE_TO_SUBMIT);
    }
    const card = getCardFields(cardProps.productAction);

    switch (cardProps.productAction) {
      case PAYMENT_FLOWS.WITH_PURCHASE: {
        return handlePurchaseFlow(
        // $FlowIssue need to work on card props with the different production actions
          cardProps,
          card,
          extraFields,
          facilitatorAccessToken
        );
      }
      case PAYMENT_FLOWS.VAULT_WITHOUT_PURCHASE: {
        // $FlowIssue need to work on card props with the different production actions
        return handleVaultWithoutPurchaseFlow(cardProps, card, extraFields);
      }
      default:
        // this technically can't happen. eslint makes us use a default case
        // this should be handled at the getProps level so that theres no
        // way a merchant could get into the situation where a submit is happening
        // but we don't know what product action to take
        throw new Error(SUBMIT_ERRORS.MISSING_BOTH_FUNCTIONS);
    }
  });
}
