/* @flow */

import { memoize, stringifyErrorMessage } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { FPTI_KEY, FUNDING } from "@paypal/sdk-constants/src";

import { FPTI_STATE, FPTI_TRANSITION, FPTI_CONTEXT_TYPE } from "../constants"
import { getClientsideTimestamp, sendCountMetric, getLogger } from "../lib"

type PaymentSource = $Values<typeof FUNDING> | null;

export type XCreateVaultSetupTokenDataType = {|
  paymentSource: PaymentSource,
|};

// What's the difference between XCreate... and Create...?
// XCreate... is the function that is passed through Zoid, usually by the merchant.
// Calling XCreate... is communicating with the merchant domain
// Create... is the internal version of the function passed by the merchant.
// We decorate Create... with our own config, pass through specific options needed,
// and sometimes making additional API or logging calls.  
export type XCreateVaultSetupToken = ?(
  XCreateVaultSetupTokenDataType
) => ZalgoPromise<string>;

export type CreateVaultSetupToken = () => ZalgoPromise<string>;

export function buildXCreateVaultSetupTokenData({
  paymentSource,
}: {|
  paymentSource: PaymentSource,
|}): XCreateVaultSetupTokenDataType {
  return { paymentSource };
}

export const getCreateVaultSetupToken = ({
  createVaultSetupToken,
  paymentSource,
}: {|
  createVaultSetupToken: XCreateVaultSetupToken,
  paymentSource: PaymentSource,
|}): CreateVaultSetupToken => {
  const data = buildXCreateVaultSetupTokenData({ paymentSource });
  const startTime = Date.now();
  return memoize(() => {
    if (!createVaultSetupToken) {
      throw new Error(`createVaultSetupToken undefined`);
    }

    return createVaultSetupToken(data)
      .then((vaultSetupToken) => {
        if (!vaultSetupToken || typeof vaultSetupToken !== "string") {
          const errString = "Expected a vault setup token to be returned from createVaultSetupToken"
          sendCountMetric({
            name: "pp.app.paypal_sdk.buttons.create_vault_setup_token.count",
            event: "error",
            dimensions: {
              errorName: 'no_setup_token',
            }
          })
          getLogger()
            .error('create_vault_setup_token', { err: errString })
            .track({
              [FPTI_KEY.STATE]:      FPTI_STATE.BUTTON,
              [FPTI_KEY.ERROR_CODE]: 'smart_buttons_create_vault_setup_token',
              [FPTI_KEY.ERROR_DESC]: errString
            })
          throw new Error(errString);
        }
        sendCountMetric({
          name: "pp.app.paypal_sdk.buttons.create_vault_setup_token.count",
          event: "success",
          dimensions: {
            errorName: "no_vault_setup_token"
          }
        });
        getLogger()
          .addTrackingBuilder(() => {
            return {
              [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.VAULT_SETUP_TOKEN,
              [FPTI_KEY.CONTEXT_ID]: vaultSetupToken,
            };
          })
          .track({
              [FPTI_KEY.STATE]: FPTI_STATE.BUTTON,
              [FPTI_KEY.TRANSITION]: FPTI_TRANSITION.RECEIVE_VAULT_SETUP_TOKEN,
              [FPTI_KEY.EVENT_NAME]: FPTI_TRANSITION.RECEIVE_VAULT_SETUP_TOKEN,
              [FPTI_KEY.RESPONSE_DURATION]: (Date.now() - startTime).toString(),
              client_time: getClientsideTimestamp(),
          });

        return vaultSetupToken;
      })
      .catch((err) => {
        sendCountMetric({
          name: "pp.app.paypal_sdk.buttons.create_vault_setup_token.count",
          event: "error",
          dimensions: {
              errorName: 'generic',
          }
        })

        getLogger()
            .error('create_vault_setup_token_error', { err: stringifyErrorMessage(err) })
            .track({
                [FPTI_KEY.STATE]:      FPTI_STATE.BUTTON,
                [FPTI_KEY.ERROR_CODE]: 'smart_buttons_create_vault_setup_token_error',
                [FPTI_KEY.ERROR_DESC]: stringifyErrorMessage(err)
            })
            .flush();

        throw err
      });
  });
};
