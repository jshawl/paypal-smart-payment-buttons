/* @flow */

import { memoize } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { FUNDING } from "@paypal/sdk-constants/src";

type PaymentSource = $Values<typeof FUNDING>;

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
  XCreateVaultSetupTokenDataType,
) => ZalgoPromise<string>;
export type CreateVaultSetupToken = () => ZalgoPromise<string>;

export const getCreateVaultSetupToken = ({
  createVaultSetupToken,
}: {|
  createVaultSetupToken: XCreateVaultSetupToken,
|}): ?CreateVaultSetupToken => {
  if (!createVaultSetupToken) {
    return;
  }

  return memoize(() => {
    return createVaultSetupToken({ paymentSource: FUNDING.CARD }).then(
      (vaultSetupToken) => {
        if (!vaultSetupToken || typeof vaultSetupToken !== "string") {
          throw new Error(
            `Expected a vault setup token to be returned from createVaultSetupToken`,
          );
        }
        return vaultSetupToken;
      },
    );
  });
};
