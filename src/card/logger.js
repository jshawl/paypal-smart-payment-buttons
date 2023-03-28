/* @flow */

import { getPageRenderTime, stringifyErrorMessage  } from "@krakenjs/belter/src";
import {
  FPTI_KEY,
  ENV,
  COUNTRY,
  FPTI_DATA_SOURCE,
} from "@paypal/sdk-constants/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { getLogger, setupLogger } from "../lib";
import type { LocaleType } from "../types";
import { FPTI_STATE } from "../constants";

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
    [FPTI_KEY.CONTEXT_TYPE]: FPTI_HCF_KEYS.HCF_SESSION_ID,
    [FPTI_KEY.CONTEXT_ID]: hcfSessionID,
    [FPTI_KEY.BUTTON_VERSION]: __SMART_BUTTONS__.__MINOR_VERSION__,
    [FPTI_HCF_KEYS.HCF_SESSION_ID]: hcfSessionID,
    [FPTI_HCF_KEYS.HCF_CORRELATION_ID]: cardCorrelationID,
    [FPTI_KEY.PARTNER_ATTRIBUTION_ID]: partnerAttributionID,
    [FPTI_KEY.MERCHANT_DOMAIN]: merchantDomain,
    [FPTI_KEY.TIMESTAMP]: Date.now().toString(),
    [FPTI_HCF_KEYS.SDK_CORRELATION_ID]: sdkCorrelationID,
    [FPTI_DATA_SOURCE.PAYMENTS_SDK]: clientID,
    [FPTI_KEY.SELLER_ID]: merchantID?.[0],
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
  getLogger().track({
    [FPTI_KEY.TRANSITION]:  "hcf_transaction_success",
    [FPTI_KEY.EVENT_NAME]:  "hcf_transaction_success",
    [FPTI_HCF_KEYS.HCF_ORDER_ID]: orderID
  }).flush();
}

export const hcfTransactionError = ({
  orderID, error
}: {|
  orderID?: string,
  // should be Error but other apis are constraining this type
  error: mixed
|}) => {
  getLogger().track({
    [FPTI_KEY.ERROR_CODE]: "hcf_transaction_error",
    [FPTI_KEY.ERROR_DESC]: stringifyErrorMessage(error),
    [FPTI_HCF_KEYS.HCF_ORDER_ID]: orderID
  }).flush();
}

export const vaultWithoutPurchaseSuccess = ({
  vaultToken,
}: {|vaultToken: string|}) => {
  getLogger().track({
    [FPTI_KEY.TRANSITION]:  "hcf_vault_without_purchase_success",
    [FPTI_KEY.EVENT_NAME]:  "hcf_vault_without_purchase_success",
    [FPTI_HCF_KEYS.VAULT_TOKEN]: vaultToken
  }).flush();
}

export const vaultWithoutPurchaseFailure = ({
  vaultToken, error
}: {|
  vaultToken?: string,
  // should be Error but other apis are constraining this type
  error: mixed
|}) => {
  getLogger().track({
    [FPTI_KEY.ERROR_CODE]: "hcf_vault_without_purchase_error",
    [FPTI_KEY.ERROR_DESC]: stringifyErrorMessage(error),
    [FPTI_HCF_KEYS.VAULT_TOKEN]: vaultToken
  }).flush();
}
