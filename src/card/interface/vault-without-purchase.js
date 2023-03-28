/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import {
  updateVaultSetupToken,
  type PaymentSourceInput,
} from "../../api/vault";
import {
  vaultWithoutPurchaseSuccess,
  vaultWithoutPurchaseFailure,
} from "../logger";
import type {
  XOnError,
  XCreateVaultSetupToken,
  SaveActionOnApprove,
} from "../../props";

type VaultPaymenSourceOptions = {|
  createVaultSetupToken: XCreateVaultSetupToken,
  onApprove: SaveActionOnApprove,
  onError: XOnError,
  clientID: string,
  paymentSource: PaymentSourceInput,
  idToken: string,
|};

export const savePaymentSource = ({
  createVaultSetupToken,
  onApprove,
  onError,
  clientID,
  paymentSource,
  idToken,
}: VaultPaymenSourceOptions): ZalgoPromise<void> => {
  let vaultToken;
  return createVaultSetupToken()
    .then((vaultSetupToken) => {
      vaultToken = vaultSetupToken;
      return updateVaultSetupToken({
        vaultSetupToken,
        clientID,
        paymentSource,
        // passing the id token here is a temporary fix until we can deploy xobuyernodeserv
        // to treak idToken as an optional field.
        idToken,
      })
    })
    .then(() => onApprove({ vaultSetupToken: vaultToken }))
    .then(() => vaultWithoutPurchaseSuccess({ vaultToken }))
    .catch((error) => {
      if (typeof error === "string") {
        error = new Error(error);
      }
      vaultWithoutPurchaseFailure({ error, vaultToken });
      onError(error);
      throw error;
    });
};
