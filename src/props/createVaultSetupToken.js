/* @flow */

import { memoize } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

export type XCreateVaultSetupTokenDataType = {||};

export type XCreateVaultSetupToken = () => ZalgoPromise<string>;

export type CreateVaultSetupToken = XCreateVaultSetupToken;

export const getCreateVaultSetupToken = ({ createVaultSetupToken, }: {| createVaultSetupToken: ?XCreateVaultSetupToken, |}):
  () => ZalgoPromise<string> =>
  memoize(() => {
    if (createVaultSetupToken) {
      return createVaultSetupToken().then((vaultSetupToken) => {
        if (!vaultSetupToken || typeof vaultSetupToken !== "string") {
          throw new Error(
          `Expected a vault setup token to be returned from createVaultSetupToken`
        );
      }
      return vaultSetupToken;
    });
  } else {
    throw new Error(`createVaultSetupToken undefined`);
  }
});
