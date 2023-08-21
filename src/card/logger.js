/* @flow */

import { getPageRenderTime, stringifyErrorMessage  } from "@krakenjs/belter/src";
import {
  FPTI_KEY,
  ENV,
  COUNTRY,
  FPTI_DATA_SOURCE,
} from "@paypal/sdk-constants/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { sendCountMetric, getLogger, setupLogger } from "../lib";
import type { LocaleType } from "../types";
import { FPTI_STATE, PAYMENT_FLOWS } from "../constants";

import { FPTI_HCF_KEYS } from "./constants";

type CardLoggerOptions = {|
  env: $Values<typeof ENV>,
  sessionID: string,
  clientID: string,
  partnerAttributionID: ?string,
  sdkCorrelationID: string,
  cardCorrelationID: string,
  locale: LocaleType,
  cardSessionID: string,
  merchantID: $ReadOnlyArray<string>,
  merchantDomain: string,
  buyerCountry: $Values<typeof COUNTRY>,
  hcfSessionID?: string,
  type: string,
  productAction: string,
|};

export function setupCardLogger({
  env,
  sessionID,
  clientID,
  partnerAttributionID,
  sdkCorrelationID,
  cardCorrelationID,
  locale,
  merchantID,
  merchantDomain,
  buyerCountry,
  type,
  hcfSessionID,
  productAction,
}: CardLoggerOptions): ZalgoPromise<void> {
  const logger = getLogger();

  setupLogger({
    env,
    sessionID,
    clientID,
    sdkCorrelationID,
    locale,
    buyerCountry,
  });

  logger.addTrackingBuilder(() => ({
    [FPTI_KEY.BUTTON_VERSION]: __SMART_BUTTONS__.__MINOR_VERSION__,
    [FPTI_HCF_KEYS.HCF_SESSION_ID]: hcfSessionID,
    [FPTI_HCF_KEYS.HCF_CORRELATION_ID]: cardCorrelationID,
    [FPTI_KEY.PARTNER_ATTRIBUTION_ID]: partnerAttributionID,
    [FPTI_KEY.MERCHANT_DOMAIN]: merchantDomain,
    [FPTI_KEY.TIMESTAMP]: Date.now().toString(),
    [FPTI_HCF_KEYS.SDK_CORRELATION_ID]: sdkCorrelationID,
    [FPTI_DATA_SOURCE.PAYMENTS_SDK]: clientID,
    [FPTI_KEY.SELLER_ID]: merchantID?.[0],
    [FPTI_HCF_KEYS.HCF_VERSION]: `v2`,
    [FPTI_KEY.PAYMENT_FLOW]: productAction,
  }));

  const tracking = {
    [FPTI_KEY.STATE]: FPTI_STATE.CARD,
    [FPTI_KEY.TRANSITION]: `hcf_${type}_field_rendered`,
    [FPTI_KEY.EVENT_NAME]: `hcf_${type}_field_rendered`,
  };

  return ZalgoPromise.hash({
    pageRenderTime: getPageRenderTime(),
  }).then(({ pageRenderTime }) => {
    logger.track({
      ...tracking,
      [FPTI_KEY.CONTEXT_TYPE]: FPTI_HCF_KEYS.HOSTED_SESSION_ID,
      [FPTI_KEY.CONTEXT_ID]: hcfSessionID,
      [FPTI_KEY.PAGE_LOAD_TIME]: pageRenderTime
        ? pageRenderTime.toString()
        : "",
    });

    logger.flush();
  });
}

export const hcfTransactionSuccess = ({
  orderID
}: {|orderID: string|}) => {

  sendCountMetric({
    name: "pp.app.paypal_sdk.card_fields.submit.success.count",
    dimensions: {
      cardFieldsFlow: PAYMENT_FLOWS.WITH_PURCHASE,
    }
  })

  getLogger().track({
    [FPTI_KEY.TRANSITION]:  "hcf_transaction_success",
    [FPTI_KEY.EVENT_NAME]:  "hcf_transaction_success",
    [FPTI_HCF_KEYS.HCF_ORDER_ID]: orderID,
    [FPTI_KEY.PAYMENT_FLOW]: PAYMENT_FLOWS.WITH_PURCHASE,
    [FPTI_KEY.CONTEXT_TYPE]: FPTI_HCF_KEYS.HCF_ORDER_ID,
    [FPTI_KEY.CONTEXT_ID]: orderID
  }).flush();
}

export const hcfTransactionError = ({
  orderID, error
}: {|
  orderID?: string,
  // should be Error but other apis are constraining this type
  error: mixed
|}) => {

  sendCountMetric({
    name: "pp.app.paypal_sdk.card_fields.submit.error.count",
    dimensions: {
      cardFieldsFlow: PAYMENT_FLOWS.WITH_PURCHASE,
    }
  })
  getLogger().track({
    [FPTI_KEY.ERROR_CODE]: "hcf_transaction_error",
    [FPTI_KEY.EVENT_NAME]: "hcf_transaction_error",
    [FPTI_KEY.ERROR_DESC]: stringifyErrorMessage(error),
    [FPTI_KEY.PAYMENT_FLOW]: PAYMENT_FLOWS.WITH_PURCHASE,
    [FPTI_HCF_KEYS.HCF_ORDER_ID]: orderID,
    [FPTI_KEY.CONTEXT_TYPE]: FPTI_HCF_KEYS.HCF_ORDER_ID,
    [FPTI_KEY.CONTEXT_ID]: orderID
  }).flush();
}

export const vaultWithoutPurchaseSuccess = ({
  vaultToken,
}: {|vaultToken: string|}) => {

  sendCountMetric({
    name: "pp.app.paypal_sdk.card_fields.submit.success.count",
    dimensions: {
      cardFieldsFlow: PAYMENT_FLOWS.VAULT_WITHOUT_PURCHASE,
    }
  })

  getLogger().track({
    [FPTI_KEY.TRANSITION]:  "hcf_transaction_success",
    [FPTI_KEY.EVENT_NAME]:  "hcf_transaction_success",
    [FPTI_HCF_KEYS.VAULT_TOKEN]: vaultToken,
    [FPTI_KEY.PAYMENT_FLOW]: PAYMENT_FLOWS.VAULT_WITHOUT_PURCHASE,
    [FPTI_KEY.CONTEXT_TYPE]: `vault_setup_token`,
    [FPTI_KEY.CONTEXT_ID]: vaultToken
  }).flush();
}

export const vaultWithoutPurchaseFailure = ({
  vaultToken, error
}: {|
  vaultToken?: string,
  // should be Error but other apis are constraining this type
  error: mixed
|}) => {

  sendCountMetric({
    name: "pp.app.paypal_sdk.card_fields.submit.error.count",
    dimensions: {
      cardFieldsFlow: PAYMENT_FLOWS.VAULT_WITHOUT_PURCHASE,
    }
  })
  getLogger().track({
    [FPTI_KEY.ERROR_CODE]: "hcf_transaction_error",
    [FPTI_KEY.EVENT_NAME]: "hcf_transaction_error",
    [FPTI_KEY.ERROR_DESC]: stringifyErrorMessage(error),
    [FPTI_HCF_KEYS.VAULT_TOKEN]: vaultToken,
    [FPTI_KEY.PAYMENT_FLOW]: PAYMENT_FLOWS.VAULT_WITHOUT_PURCHASE,
    [FPTI_KEY.CONTEXT_TYPE]: `vault_setup_token`,
    [FPTI_KEY.CONTEXT_ID]: vaultToken
  }).flush();
}

// $FlowFixMe
export const threeDsAuthStatus = ({
  authStatus, // $FlowFixMe
}): {|
  authStatus: string
  |} => {
  getLogger().addTrackingBuilder(() => ({
    [FPTI_HCF_KEYS.THREEDS_AUTH_STATUS]: authStatus,
  }))
  }

export const hcfFieldsSubmit = ({
  cardFlowType,
  hcfSessionID
}: {|
  cardFlowType: string,
  hcfSessionID: string
|}) => {

  sendCountMetric({
    name: "pp.app.paypal_sdk.card_fields.submit.count",
    dimensions: {
      cardFieldsFlow: cardFlowType,
    }
  })
  getLogger().track({
    [FPTI_KEY.TRANSITION]:  "hcf_fields_submit",
    [FPTI_KEY.EVENT_NAME]:  "hcf_fields_submit",
    [FPTI_KEY.CONTEXT_TYPE]: FPTI_HCF_KEYS.HOSTED_SESSION_ID,
    [FPTI_KEY.PAYMENT_FLOW]: cardFlowType,
    [FPTI_KEY.CONTEXT_ID]: hcfSessionID
  })
}
