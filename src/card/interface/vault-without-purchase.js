/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import type { CrossDomainWindowType } from '@krakenjs/cross-domain-utils/src';

import type { ThreeDomainSecureFlowType } from '../../types';
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
  CreateVaultSetupToken,
  SaveActionOnApprove,
} from "../../props";
import { SUBMIT_ERRORS } from "../constants";
import { handleThreeDomainSecureContingency } from "../../lib/3ds";

type VaultPaymenSourceOptions = {|
  createVaultSetupToken: CreateVaultSetupToken,
  onApprove: SaveActionOnApprove,
  onError: XOnError,
  clientID: string,
  paymentSource: PaymentSourceInput,
  getParent : () => CrossDomainWindowType,
  ThreeDomainSecure : ThreeDomainSecureFlowType,
|};

export const savePaymentSource = ({
  createVaultSetupToken,
  onApprove,
  onError,
  clientID,
  paymentSource,
  getParent,
  ThreeDomainSecure,
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
      });
    })
    .then((res) => {
      // $FlowFixMe
      const { status, links } = res?.updateVaultSetupToken || {};

      return handleThreeDomainSecureContingency({ status, links,
        getParent,
        ThreeDomainSecure,
    })
    })
    .then((threeDsResponse) => onApprove({ vaultSetupToken: vaultToken, liabilityShift: threeDsResponse?.liability_shift }))
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
