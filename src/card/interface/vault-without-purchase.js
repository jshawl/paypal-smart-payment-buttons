/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import {
  updateVaultSetupToken,
  type PaymentSourceInput,
} from "../../api/vault";
import {
  hcfTransactionSuccess, hcfTransactionError
} from "../logger";
import type {
  XOnError,
  XCreateVaultSetupToken,
  SaveActionOnApprove,
} from "../../props";
import { SUBMIT_ERRORS } from "../constants";

type VaultPaymenSourceOptions = {|
  createVaultSetupToken: XCreateVaultSetupToken,
  onApprove: SaveActionOnApprove,
  onError: XOnError,
  clientID: string,
  paymentSource: PaymentSourceInput,
|};

export const savePaymentSource = ({
  createVaultSetupToken,
  onApprove,
  onError,
  clientID,
  paymentSource,
}: VaultPaymenSourceOptions): ZalgoPromise<void> => {
  let vaultToken;
  return createVaultSetupToken()
    .then((vaultSetupToken) => {
      if (typeof vaultSetupToken !== "string") {
        throw new TypeError(SUBMIT_ERRORS.VAULT_TOKEN_TYPE_ERROR);
      }
      vaultToken = vaultSetupToken;
      return updateVaultSetupToken({
        vaultSetupToken,
        clientID,
        paymentSource,
      })
    })
    .then(() => onApprove({ vaultSetupToken: vaultToken }))
    .then(() => hcfTransactionSuccess({ vaultToken, flow: `vault_without_purchase` }))
    .catch((error) => {
      if (typeof error === "string") {
        error = new Error(error);
      }
      hcfTransactionError({ error, vaultToken, flow: `vault_without_purchase` });
      onError(error);
      throw error;
    });
};
