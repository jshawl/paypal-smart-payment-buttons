/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { getLogger, setBuyerAccessToken } from "../lib";

export type XOnAuthDataType = {|
  accessToken: ?string,
|};

export type OnAuth = (params: XOnAuthDataType) => ZalgoPromise<string | void>;

export function getOnAuth(): OnAuth {
  return ({ accessToken }: XOnAuthDataType) => {
    getLogger().info(
      `spb_onauth_access_token_${accessToken ? "present" : "not_present"}`,
    );

    return ZalgoPromise.try(() => {
      if (accessToken) {
        // Cache the buyerAccessToken so that it can be used when creating an upgraded lsat with ignore cache
        setBuyerAccessToken(accessToken);
        return accessToken;
      }
    });
  };
}
